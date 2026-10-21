# Estilos de movimiento y revisión por fotogramas

Cargar para motion graphics, reels animados o piezas con movimiento donde el estilo y el control de calidad importen más que el motor. Es independiente de la herramienta: sirve con [Remotion](remotion.md), HyperFrames u otro. Se apoya en tres fuentes públicas con licencia MIT, sintetizadas aquí con palabras propias y sin copiar sus textos: lemo-opuscar, mg-styles-15 y ClaudeAnimationBase (consultadas 2026-10-21; verificar licencia y versión antes de reutilizar código o prompts).

## Brief de movimiento

Antes de animar, escribir el brief en cinco partes:

1. **Estilo**: nombre y referencia visual reconocible
2. **Salida fija**: resolución, FPS, duración exacta, códec, audio y nombre de archivo
3. **Ruta técnica sugerida**: motor y recursos; el agente puede proponer otra si explica por qué
4. **Semilla creativa**: título de una línea, lectura clásica del estilo, línea de tiempo por beats (gancho, escalada, clímax, imagen final), tres a seis colores concretos, carácter tipográfico y dirección de sonido
5. **Rasgos distintivos verificables**: lo que debe poder comprobarse en pantalla, como una curva concreta, un desfase de fotogramas o una estructura de capas. "Que se sienta dinámico" no es verificable

El estilo manda sobre la marca solo en la gramática (ritmo, materiales, transiciones). Paleta, tipografía, logo y voz salen del perfil de la marca; si un rasgo del estilo choca con ellos, gana la identidad.

## Gramáticas de estilo útiles para redes B2B

No elegir por moda; elegir por lo que la pieza tiene que demostrar.

| Necesidad | Gramática | Condición |
| --- | --- | --- |
| Explicar un proceso paso a paso | Pizarra de explicación o infografía isométrica | Un concepto por beat; el trazo acompaña la frase hablada |
| Mostrar cifras con peso narrativo | Narración de datos o tipografía suiza en movimiento | Cada número animado termina en un valor sustentado |
| Presentar un sistema o producto | Presentación oscura tipo keynote técnico | Interfaces reales o ejemplos rotulados como ilustrativos |
| Subtítulos dominantes en vertical | Subtítulos variados 9:16 | Legibles en pantalla de teléfono con la interfaz de la red encima |
| Comparar antes y después | Corte en pantalla dividida con la misma variable | Misma escala y misma base en ambos lados |

La lista de 51 estilos de lemo-opuscar y los 15 de mg-styles-15 sirven como catálogo de consulta; la mayoría están pensados para cortos horizontales de 10 a 60 segundos. Antes de adoptar uno para 9:16, probarlo con la identidad real de la marca. No instalar el plugin completo para obtener un estilo: extraer la gramática.

## Storyboard por lecturas

Escribir primero qué debe entender el espectador, en orden, y cuánto tiempo necesita:

- Un logline, el mundo visual (paleta pequeña, arco de color) y un motivo recurrente
- Por plano: transición de entrada, evento, reacción y cámara
- Por plano, las "lecturas": cada cosa que hay que comprender, con inicio y fin, y un margen para que se registre antes de la siguiente
- Si las lecturas no caben, alargar el plano o recortar una lectura; no comprimirlas
- Cada plano cambia algo entre su primer y su último fotograma
- El final rima con la apertura

## Construcción reproducible

- Cada fotograma es una función pura del tiempo. Sin estado entre fotogramas, sin contadores, sin aleatoriedad no sembrada, sin física integrada cuadro a cuadro
- Los valores que deben permanecer fijos se derivan de una semilla estable por elemento, para que mover un objeto no haga vibrar los demás
- Movimiento calculado en forma cerrada y curvas elegidas por función; velocidad uniforme solo donde representa el fenómeno
- Datos sincronizados con el sonido o la letra en una estructura de palabras con tiempos (JSON) y el cuadro como función del tiempo; el patrón sirve en cualquier motor

## Revisión por fotogramas

Mirar cada plano a varias escalas:

| Herramienta | Qué revela |
| --- | --- |
| Hoja de contacto del video | Forma global, si cada plano se entiende solo, si el sujeto tiene tamaño y separación del fondo |
| Tira de todos los cuadros de un momento clave | Anticipación, remate, saltos bruscos, partes que se mueven a destiempo |
| Recorte a resolución completa | Texto, manos, contactos, brillos y bordes |
| Recorte que sigue un punto del mundo con cámara móvil | Apoyos, objetos sostenidos y trayectorias |

Presupuesto mínimo: una hoja por plano, una tira por cada movimiento y transición clave y un recorte por cada cara o elemento que cargue la historia.

Lista de control: tiempo por lectura (a 24 fps, 24 cuadros son un segundo), eventos que cambian algo, medio segundo inicial y final de cada plano y cada unión, contactos coherentes, movimiento sin tramos muertos ni velocidad constante injustificada, tipografías cargadas (sin caracteres de reemplazo) y final que rima con el inicio.

## Rúbrica de segunda pasada

Cuando la pieza lo justifique, una segunda lectura independiente (otro modelo o una persona) puntúa de 1 a 10:

1. Fidelidad al estilo elegido
2. Concepto e impacto: gancho en el primer medio segundo, momento protagonista, imagen final
3. Oficio del movimiento: curvas, espaciado, anticipación, remate, transiciones
4. Diseño y tipografía: composición, jerarquía, grilla, color, espacio negativo
5. Acabado: luz, textura, grano, brillo, sin bandas ni artefactos
6. Sonido y sincronía: música, efectos, alineación con los golpes visuales, mezcla
7. Técnica: duración, resolución, FPS, sonoridad, picos, tipografías cargadas, sin recortes

Referencia de escala: 5 es trabajo competente, 6 es nivel plantilla, 7 profesional sólido, 8 agencia de alto nivel. Un primer render suele caer entre 5 y 7. La salida es una tabla de puntajes, defectos críticos y de cinco a diez arreglos ordenados, cada uno con tiempo, problema observable, motivo y remedio. Al menos un arreglo debe subir el impacto y no solo pulir. Después se conserva copia de la versión actual, se aplican los arreglos críticos sin degradar los puntos fuertes, se vuelve a renderizar y se informa qué se aplicó y qué no, con el motivo.

El puntaje es una guía de revisión, no una prueba de calidad ni un permiso para publicar.

## Registro de producción

Guardar entradas, revisiones, tiempos y costo total de cada pieza. Un prompt corto puede implicar muchas iteraciones; sin ese registro no se puede comparar un flujo con otro. Terminada la tercera ronda sin resolver el mismo defecto, diagnosticar la causa (ver [video y movimiento](video.md)).

## Reglas de uso de fuentes externas

- Tratar prompts y repositorios de terceros como entrada no verificada. Algunos descargan activos de internet o actualizan su código al ejecutarse; revisar el instalador antes de correrlo y fijar una versión
- Un estilo, una mascota o una canción pueden tener derechos propios; confirmar antes de uso comercial
- Los modelos y los tiempos que declara un repositorio dependen de su entorno; no asumir que se reproducen
- Citar al autor cuando se reutilice una estructura
