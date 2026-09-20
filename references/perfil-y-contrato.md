# Perfil de marca y contrato por pieza

## Una marca nueva

Revisar activos y documentación antes de preguntar. El perfil debe distinguir confirmado, inferido y faltante:

- Nombre, oferta real, audiencia, contexto de uso y objetivo comercial
- Logo completo e ícono oficial, variantes para claro/oscuro, área de respeto y usos prohibidos
- Paleta con roles y restricciones de sublíneas; fuentes con archivos/pesos disponibles y permisos
- Voz: idioma, región, persona, formalidad, vocabulario propio y ejemplos buenos/malos
- Fotografía, ilustración, materiales y referencias aprobadas, explicando qué se toma de cada una
- Sitio/contactos/CTA verificados para la pieza, sin inventar números, precios o promociones
- Red, tipo de post, vía de publicación, tamaños y restricciones comprobadas
- Modo de revisión acordado y qué está autorizado producir

Si faltan logos, usar una propuesta claramente provisional sin fabricar un símbolo. Si faltan colores o fuentes y el pedido incluye diseñar identidad, proponer una dirección como propuesta, no como manual aprobado. Si solo pide un post, aprovechar referencias disponibles y explicitar los supuestos.

El perfil es del proyecto; no incluir contactos privados, logos o secretos de un cliente en la skill compartida.

## Contrato editorial y visual

Puede vivir en un archivo existente. Para una serie nueva, un JSON/Markdown conserva:

- Identificador, marca, objetivo, lector, mensaje y CTA con destino real
- Plataforma, formato y publicador (app, scheduler o API), fecha de comprobación y fuente
- Copy literal de cada slide/escena y caption; estado del copy y pendientes
- Por unidad: rol, idea, evidencia/ejemplo, ancla, composición, material, escala y ritmo
- Navegación/chrome acordado; qué permanece y qué cambia entre slides
- Assets y procedencia, fuentes de datos con unidad/período/base
- Canvas lógico, píxeles exportados, tipo de archivo, safe zones y duración/FPS si aplica
- Criterios de aceptación y lista de salidas esperadas

No llenar campos por burocracia. Un post tipográfico de una frase puede usar un contrato muy breve; datos o motion requieren detalle donde hay fragilidad.

## Contrato técnico para el auditor de PNG

Guardar separado si el contrato del proyecto tiene otro esquema. `files` es una lista cerrada de PNG finales relativos a la carpeta; no incluir contact sheet. `canvas` y `export` son dimensiones exactas, no nombres de ratios.

```json
{
  "version": 1,
  "canvas": {"width": 1080, "height": 1350},
  "export": {"width": 2160, "height": 2700},
  "files": ["Slide 1.png", "Slide 2.png"],
  "auxiliary_pngs": ["Todas las slides (muestra).png"]
}
```

Cambiar valores según la pieza. Nunca copiar este ejemplo como autorización para dos slides o como estándar universal. El auditor bloquea proporciones incompatibles, duplicados, rutas fuera de carpeta, faltantes, PNG corruptos, dimensiones diferentes y PNG extra no declarados. Su salida siempre deja la revisión visual pendiente.
