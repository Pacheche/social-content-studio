# Medición y aprendizaje con datos propios

Cargar cuando el usuario aporte métricas, pida decidir qué repetir o quiera mejorar piezas futuras. Una publicación aislada solo necesita su hipótesis y su métrica en el contrato.

## Entrada mínima

Una fila por publicación, exportada desde la herramienta de estadísticas de la red o cargada a mano:

| Campo | Nota |
| --- | --- |
| Fecha, tema, formato | Comparar solo piezas del mismo objetivo y formato |
| Gancho (primeros 3 segundos o primera línea) | Es la variable más habitual de análisis |
| Duración (video) | Y retención media si existe |
| Alcance y % de no seguidores | Base de todos los ratios |
| Guardados, compartidos, comentarios | Siempre como tasa sobre alcance |
| Seguidores ganados, mensajes o contactos calificados | Lo más cercano al objetivo comercial |
| Pago u orgánico | Se analizan por separado |

Si falta una columna necesaria para un cálculo, pedirla antes de calcular. No completar con valores inventados.

## Análisis

1. Normalizar por alcance. Comparar tasas, nunca números crudos
2. Ordenar por la métrica del objetivo: para captar clientes pesan guardados, compartidos, comentarios con intención y contactos; las visualizaciones van al final
3. Para las tres mejores piezas, aislar una causa (gancho, tema o formato). Si no se puede aislar, escribirlo
4. Describir el patrón común de las peores, sin suavizarlo
5. Qué repetir y qué dejar, máximo tres de cada lado, por impacto esperado
6. Tres ideas nuevas que nazcan de los datos propios, cada una con la pieza concreta que la respalda
7. Para cada idea, un guion hablado completo y varios ganchos con mecanismos distintos (ver [voz y ganchos](voz-y-ganchos.md)). Nada de cinco variaciones de la misma frase
8. Con pocas observaciones, marcar el patrón como hipótesis. Una muestra de uno o dos casos no prueba causalidad

Cada afirmación lleva el número que la sostiene. Citar textual cuando se hable de un comentario. Si una sección no tiene datos suficientes, escribirlo.

## Probar una variable

Una prueba cambia una sola cosa identificable (escena inicial, pregunta, demostración, formato) con ventanas equivalentes. Registrar hipótesis, métrica, período, denominador, tamaño de muestra y fecha de revisión. Cuando cambian varias cosas a la vez, no se atribuye causalidad.

## ¿Hace falta un tablero?

Un tablero se justifica cuando ayuda a decidir qué repetir, corregir o probar, y se va a consultar más de una vez. De lo contrario alcanza una tabla y un párrafo de conclusiones. Si se construye uno:

- Un solo HTML autocontenido, sin librerías externas ni CDN: barras con elementos de ancho porcentual y líneas con trazos SVG. Las series animadas de las librerías pueden aparecer vacías al abrir el archivo suelto o al grabarlo
- Identidad y paleta de la marca de quien analiza; nunca la de la fuente que inspiró el prompt
- Números grandes cuando se va a grabar (a escala de teléfono solo se leen las cifras grandes), animaciones que respeten `prefers-reduced-motion` y un estado final estable
- Estado vacío explícito para cada sección sin datos suficientes
- Contexto de la marca reemplazado antes de usar cualquier prompt externo; si no, el análisis juzga el contenido con objetivos ajenos

## Del dato a la siguiente pieza

El resultado del análisis alimenta el Gate A de la próxima pieza: el brief indica la hipótesis a probar y la métrica de éxito. Registrar el aprendizaje como regla solo cuando se repite o tiene causa clara; las preferencias de una sola pieza quedan en su contrato.
