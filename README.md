# Social Content Studio

Una skill abierta para convertir ideas, briefs y referencias en contenido de redes sociales con estrategia, copy, dirección de arte, producción multiformato y control de calidad real

Funciona con Codex, Claude Code y otros agentes compatibles con el formato `SKILL.md`

> English: an open agent skill for turning ideas, briefs, and references into social content with strategy, copy, art direction, multiformat production, and real export QA

## En 30 segundos

Le pasás al agente una idea o un brief, aunque esté desordenado. La skill resuelve el mensaje antes de diseñar, asigna una función visual a cada escena, produce el formato pedido y revisa los archivos finales en lugar de confiar solo en el render

```text
Brief → estrategia y copy → dirección visual → editables y exportados → QA técnico + revisión visual
```

El resultado puede ser un carrusel, un post, una historia, un estado, un reel o una corrección puntual. El formato y la herramienta se eligen según el encargo; no fuerza una estética ni un renderer único

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

## Requisitos

- Un agente que cargue skills mediante `SKILL.md`, como Codex o Claude Code
- Para el auditor técnico opcional: Python 3 y Pillow
- Los activos y reglas reales de la marca cuando el pedido los necesite

No requiere una cuenta de red social, un servicio externo, un renderer específico ni una plantilla cerrada para empezar a trabajar

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

## Personalizarla para una marca

La skill conserva el método y cada proyecto aporta su propia identidad. Usá [`examples/brand-profile.example.md`](examples/brand-profile.example.md) como punto de partida para documentar:

- Logos y activos oficiales
- Colores, fuentes y sistema visual
- Voz, audiencia, oferta y CTA real
- Restricciones comerciales, legales o de tono
- Formatos prioritarios y referencias aprobadas

Guardá ese perfil junto al proyecto de la marca, no dentro de la skill compartida. Así una actualización pública nunca expone información de clientes ni contamina el estilo de otra marca

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

## Uso manual del auditor

Si ya tenés exportados y solo querés comprobar el contrato técnico, creá un archivo a partir de [`examples/export-contract.example.json`](examples/export-contract.example.json), definí el lienzo y la resolución final esperada, y ejecutá:

```bash
python scripts/audit_exports.py ./exports --contract ./export-contract.json --report ./qa-tecnica.json
```

El reporte deja la revisión visual como `pending` a propósito: un PNG puede tener las medidas correctas y aun así contener texto cortado, un logo con fondo o una captura de error

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

## Extender la skill

- Para incorporar una red nueva, documentá su formato, zona segura y criterio de adaptación en la referencia de producción correspondiente
- Para sumar una verificación repetible, agregá un script con tests que comprueben un resultado observable
- Para cambiar el proceso, actualizá primero los casos de evaluación y evitá convertir una preferencia de un cliente en una regla para todos

La mejor extensión no agrega pasos por costumbre: elimina un riesgo concreto o mejora una decisión repetida

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
