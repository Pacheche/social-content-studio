"""Validate PNG exports against an explicit contract; never certify visual quality."""
import argparse
import hashlib
import io
import json
from pathlib import Path, PureWindowsPath
import sys

from PIL import Image


def validate_contract(contract):
    if (not isinstance(contract, dict) or type(contract.get('version')) is not int
            or contract.get('version') != 1):
        raise ValueError('Contract must be an object with version 1')
    sizes = []
    for key in ('canvas', 'export'):
        box = contract.get(key)
        if not isinstance(box, dict):
            raise ValueError(f'Missing {key} dimensions')
        pair = (box.get('width'), box.get('height'))
        if any(type(v) is not int or v <= 0 for v in pair):
            raise ValueError(f'{key} dimensions must be positive integers')
        sizes.append(pair)
    (cw, ch), (ew, eh) = sizes
    if cw * eh != ch * ew:
        raise ValueError('Canvas and export aspect ratios differ')
    files = contract.get('files')
    auxiliary = contract.get('auxiliary_pngs', [])
    if not isinstance(files, list) or not files:
        raise ValueError('files must be a nonempty list of relative PNG paths')
    if not isinstance(auxiliary, list):
        raise ValueError('auxiliary_pngs must be a list')
    seen = set()
    for name in files + auxiliary:
        if not isinstance(name, str) or not name.strip():
            raise ValueError('File names must be nonempty strings')
        posix = name.replace('\\', '/')
        win = PureWindowsPath(name)
        rel = Path(posix)
        if (win.drive or win.root or rel.is_absolute()
                or '..' in rel.parts or ':' in name or rel.suffix.lower() != '.png'):
            raise ValueError(f'Unsafe or non-PNG path: {name}')
        normalized = rel.as_posix().casefold()
        if normalized in seen:
            raise ValueError(f'Duplicate file path: {name}')
        seen.add(normalized)
    return sizes[1]


def confined(root, name):
    result = (root / name.replace('\\', '/')).resolve()
    if not result.is_relative_to(root):
        raise ValueError(f'Path escapes export directory: {name}')
    return result


def audit_exports(folder, contract):
    expected = validate_contract(contract)
    root = Path(folder).resolve()
    if not root.is_dir():
        raise ValueError('Export directory does not exist')
    errors = []
    records = []
    names = contract['files']
    allowed = {Path(n.replace('\\', '/')).as_posix().casefold()
               for n in names + contract.get('auxiliary_pngs', [])}
    for name in names + contract.get('auxiliary_pngs', []):
        confined(root, name)
    for path in root.rglob('*'):
        if path.is_file() and path.suffix.lower() == '.png':
            relative = path.relative_to(root).as_posix()
            if relative.casefold() not in allowed:
                errors.append(f'Undeclared PNG: {relative}')
    for name in names:
        path = confined(root, name)
        record = {'file': name, 'visual_review': 'pending'}
        records.append(record)
        if not path.is_file():
            errors.append(f'Missing PNG: {name}')
            record['technical_status'] = 'failed'
            continue
        try:
            raw = path.read_bytes()
            record['sha256'] = hashlib.sha256(raw).hexdigest()
            record['bytes'] = len(raw)
            with Image.open(io.BytesIO(raw)) as img:
                if img.format != 'PNG':
                    raise ValueError(f'Actual format is {img.format}, not PNG')
                size = img.size
                record['width'], record['height'] = size
                img.verify()
            with Image.open(io.BytesIO(raw)) as img:
                if getattr(img, 'n_frames', 1) != 1:
                    raise ValueError('Animated PNG is not a static slide')
                img.load()
            if size != expected:
                raise ValueError(f'Dimensions {size[0]}x{size[1]}; expected {expected[0]}x{expected[1]}')
            record['technical_status'] = 'passed'
        except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as exc:
            record['technical_status'] = 'failed'
            errors.append(f'{name}: {exc}')
    return {
        'version': 1,
        'technical_status': 'failed' if errors else 'passed',
        'visual_review': 'pending',
        'scope': 'PNG decoding, exact dimensions, declared set and hashes only; not DOM or visual semantics',
        'contract_sha256': hashlib.sha256(json.dumps(contract, sort_keys=True).encode()).hexdigest(),
        'files': records,
        'errors': errors,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('folder', type=Path)
    parser.add_argument('--contract', type=Path, required=True)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    try:
        if args.report:
            report = args.report.resolve()
            if report.suffix.lower() != '.json' or report == args.contract.resolve():
                raise ValueError('Report must be a separate JSON file, never the contract or a PNG')
        contract = json.loads(args.contract.read_text(encoding='utf-8-sig'))
        result = audit_exports(args.folder, contract)
        data = json.dumps(result, ensure_ascii=False, indent=2)
        if args.report:
            args.report.write_text(data + '\n', encoding='utf-8')
        print(data)
        return 0 if not result['errors'] else 1
    except (OSError, ValueError) as exc:
        print(json.dumps({'technical_status': 'failed', 'visual_review': 'pending',
                          'errors': [str(exc)]}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
