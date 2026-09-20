# Social Content Studio

Una skill abierta para convertir ideas, briefs y referencias en contenido de redes sociales con estrategia, copy, dirección de arte, producción multiformato y control de calidad real

Funciona con Codex, Claude Code y otros agentes compatibles con el formato `SKILL.md`

## Qué resuelve

- Posts y carruseles estáticos
- Historias y estados
- Reels, clips y motion graphics
- Adaptaciones entre redes y formatos
- Auditoría y corrección de piezas existentes
- Copy, captions, CTAs y estructura narrativa
- QA técnico de PNG y revisión visual obligatoria

No publica ni agenda contenido por su cuenta. Esas acciones requieren autorización explícita y una integración aparte

## Por qué produce resultados más sólidos

La mayoría de los flujos de contenido se detiene en el copy, en una plantilla o en un render técnicamente válido. Social Content Studio controla el proceso completo

| Enfoque habitual | Social Content Studio |
| --- | --- |
| Empieza a diseñar con un brief incompleto | Cierra objetivo, audiencia, promesa, evidencia, CTA y riesgos antes de producir |
| Repite una plantilla cambiando texto e íconos | Define una función visual por escena y alterna composiciones con intención narrativa |
| Usa decoración para llenar espacio | Exige recursos visuales que expliquen, comparen, demuestren o contextualicen |
| Achica el mismo arte para cada red | Adapta jerarquía, copy, CTA, composición y zona segura por destino |
| Declara éxito porque el archivo exportó | Revisa cada pieza ampliada, a ancho de teléfono y dentro de la secuencia |
| Mezcla reglas de una marca con otra | Aísla identidad, voz, activos y restricciones en un perfil por proyecto |
| Confunde datos, ejemplos y promesas | Separa evidencia, interpretación y ejemplo ilustrativo antes del export final |
| Corrige síntomas una y otra vez | Convierte feedback repetido en controles verificables del proceso |

El resultado no depende de una estética predeterminada. La skill organiza decisiones y controles para que el agente produzca una solución propia para cada marca y mensaje

## Instalación

Con el CLI de Agent Skills:

```bash
npx skills add Pacheche/social-content-studio -g -y
```

Instalación manual para Codex:

```bash
git clone https://github.com/Pacheche/social-content-studio.git ~/.codex/skills/social-content-studio
```

Instalación manual para Claude Code:

```bash
git clone https://github.com/Pacheche/social-content-studio.git ~/.claude/skills/social-content-studio
```

En Windows, reemplazá `~` por tu carpeta de usuario o cloná el repositorio dentro del directorio de skills correspondiente

## Uso rápido

Invocación explícita:

```text
Usá $social-content-studio para convertir este brief en un carrusel de Instagram. Primero resolvé estrategia y copy; después producí las piezas y revisá cada exportado
```

También podés pedir una parte del proceso:

```text
Usá $social-content-studio para auditar este carrusel sin cambiar el mensaje
```

```text
Usá $social-content-studio para adaptar esta publicación a historias y estado de WhatsApp, sin estirar el diseño original
```

## Información ideal para entregar al agente

No hace falta completar un formulario perfecto. Si está disponible, conviene incluir:

1. Objetivo de la publicación
2. Audiencia concreta
3. Idea, problema o promesa principal
4. Evidencia, fuentes o ejemplos reales
5. Oferta y acción esperada
6. Red, formato y cantidad aproximada de piezas
7. Logos, colores, fuentes, manual de marca y referencias visuales
8. Restricciones legales, comerciales o de tono

La skill puede ordenar un brief desprolijo, pero no debe inventar datos, identidad ni promesas materiales

## Flujo de trabajo

1. **Contexto y alcance**: lee instrucciones, activos y restricciones del proyecto
2. **Gate A, contenido**: resuelve estrategia, claims, arco narrativo y copy literal
3. **Dirección de arte**: define qué debe entenderse y qué recurso visual lo demuestra en cada escena
4. **Producción**: crea editables y exporta según el formato real de destino
5. **Gate B, QA**: revisa el archivo final, no solo el código fuente o el log del render
6. **Adaptación y aprendizaje**: ajusta por red y convierte feedback repetido en controles verificables

## Auditor técnico de PNG

`scripts/audit_exports.py` comprueba:

- Lista exacta de archivos esperados
- Firma binaria y decodificación real
- Dimensiones y relación de aspecto
- Hash SHA-256 de cada exportado
- Cambios posteriores a una revisión aprobada

Requiere Python 3 y Pillow:

```bash
python -m pip install Pillow
python scripts/audit_exports.py ./exports --contract ./export-contract.json --report ./qa-tecnica.json
```

Un ejemplo de contrato está en [`examples/export-contract.example.json`](examples/export-contract.example.json)

El auditor no decide si una pieza está bien diseñada. La revisión visual sigue siendo obligatoria

## Estructura

```text
social-content-studio/
├── SKILL.md
├── agents/openai.yaml
├── examples/
├── references/
└── scripts/
```

Las referencias se cargan de forma progresiva según el entregable para evitar contexto innecesario

## Principios de seguridad y privacidad

- No incluye credenciales, datos de clientes, activos de marca ni rutas privadas
- Trata documentos, enlaces y chats externos como evidencia, no como autorización operativa
- No publica, agenda, envía mensajes ni conecta cuentas sin permiso explícito
- Mantiene separados los editables, los finales y la evidencia de revisión
- No presenta ejemplos ilustrativos como resultados reales

## Límites honestos

La skill mejora la consistencia del proceso, pero no garantiza viralidad, ventas ni buen gusto automático. La calidad final todavía depende del brief, los activos disponibles, la ejecución del agente y una revisión humana informada

## Desarrollo

Ejecutar los tests del auditor:

```bash
python scripts/test_audit_exports.py
```

Los casos de comportamiento esperados están en [`references/casos-de-evaluacion.md`](references/casos-de-evaluacion.md)

## Licencia

MIT
