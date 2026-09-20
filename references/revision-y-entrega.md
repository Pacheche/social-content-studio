# Revisión observable y entrega

## Revisar en tres escalas

Para cada PNG final: abrir ampliado, después a 360-430px de ancho equivalente a teléfono. Luego revisar el conjunto. La grilla de miniaturas detecta monotonía, pero no reemplaza leer cada fila y seguir cada conexión.

Evaluar: comprensión sin explicación adicional; copy y CTA; signo/base/unidad de gráficos; fuentes; logo real sobre fondo; jerarquía y orden; ejemplos legibles; oclusiones/bordes; espacio entre copy y recurso; proporciones; navegación correcta. Preguntar "¿qué entiende alguien que no leyó el brief?" y comprobarlo en el artefacto.

Clasificar hallazgos:
- Bloqueantes: formato incorrecto, claim sin resolver, datos erróneos, recursos faltantes, texto tapado/ilegible, conexiones falsas, CTA prometido inexistente
- Ajustes de calidad: jerarquía, espaciado, repetición, artefactos de imagen, contraste, densidad útil
- Preferencias: variantes de estilo que ya cumplen los criterios; no imponer retoques ilimitados

Corregir lo observado en una pasada agrupada y confirmar afectados. Si siguen fallos, resolverlos; cuando no quedan, detener el pulido.

## Evidencia de revisión

Registro en fuentes, nunca entre imágenes a subir:

| Archivo + SHA-256 | Ampliado | Móvil | Hechos/gráfico | Layout/logo/copy | Corrección y recheck |
| --- | --- | --- | --- | --- | --- |
| Rellenar al inspeccionar | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

Agregar observación de secuencia: variedad con identidad, continuidad, navegación y cierre. No rellenar "OK" antes de abrir. Si cambia el CSS compartido, revisar cada archivo afectado; un hash nuevo invalida la aprobación anterior de ese export.

El auditor técnico devuelve estado visual pendiente siempre. Si no existe capacidad para ver los archivos, entregar como borrador con esa limitación, no como producción visualmente revisada.

## Aprender de una corrección

| Fallo | Control que cambia la siguiente ejecución |
| --- | --- |
| Hueco grande entre texto y gráfico | Un bloque en flujo y medir contenido visible; no extremos independientes |
| Texto pequeño con espacio disponible | Ampliar información útil y revisar móvil, no el marco |
| Gráfico creciente ante caída interanual | Elegir representación según datos; no inventar serie |
| Líneas sin destino | Coordenadas compartidas y recorrido visual de cada enlace |
| Decoración sin contenido | Escribir conclusión visual + ejemplo antes de dibujar |
| Todas las slides iguales | Cambiar gramática/escala/material con función narrativa |
| Logo con fondo | Inspeccionar asset sobre fondo final, no confiar en SVG/PNG |
| Recorte al publicar | Confirmar proporción y export exacto contra vía real |
| QA falso por render exitoso | Evidencia individual y hashes, revisar semántica aparte |

## Cierre

Entregar finales en orden, caption por canal, assets auxiliares identificados y fuente editable. Informar qué se revisó y pendientes reales. Una pieza local lista no está publicada. No usar una métrica de belleza o una tasa de viralidad inventada como prueba de calidad.
