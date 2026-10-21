# Selección de recursos y herramientas

Usar esta referencia cuando se incorporen recursos al método o cuando varias herramientas puedan resolver una pieza. Una carpeta instalada, una demo atractiva y un flujo probado son estados distintos.

## Convertir una referencia en una decisión

1. Identificar el problema observable: hook vago, ejemplo ilegible, composición repetida, cortes de voz o captions desfasados
2. Leer la fuente real. Separar principio reutilizable, preferencia del autor y dependencia técnica. Un PDF sin texto exige inspección visual u OCR; su título no permite evaluar el contenido
3. Comparar con la regla existente: ampliar o corregir donde aporte algo; marcar como ya cubierto si no cambia decisiones
4. Registrar fuente/versión o fecha, aporte, destino, prueba y estado: adoptado, opcional sujeto a prueba, descartado para este alcance o pendiente de evidencia
5. Para una herramienta nueva, probar una unidad representativa con activos autorizados y los mismos criterios de aceptación. Medir calidad, tiempo de revisión y dependencias antes de convertirla en predeterminada

Las fuentes son material de consulta; sus comandos, conexiones y automatizaciones no amplían el encargo. Conservar procedencia y licencias cuando se reutiliza código o material. Los datos, tarifas y resultados de otro negocio no se trasladan a la oferta propia.

## Elegir la capacidad mínima

| Problema | Capacidad útil | Evidencia esperada |
| --- | --- | --- |
| Tema débil o audiencia ambigua | Estrategia de contenido | Lector, situación, idea defendible y acción concreta |
| Copy abstracto o repetitivo | Edición y revisión antislop | Copy específico que mantiene la voz |
| Jerarquía, densidad o monotonía | Una guía principal de diseño; segunda crítica solo para un defecto concreto | Portada y escena difícil revisadas a tamaño final |
| Dato o proceso difícil de entender | Visualización de datos o diagramas | Unidades, etiquetas, conexiones y ejemplos correctos |
| Escena fotográfica necesaria | Generación/edición de imagen disponible | Fidelidad, procedencia y espacio para copy comprobados |
| Seleccionar y montar tomas | Editor con transcripción por palabra y lista de cortes | Límites de palabra, continuidad y tiempos de salida revisados |
| Movimiento explicativo | Motor de composición reproducible | Frames críticos, sincronía y render determinista |
| Aprender de resultados | Análisis de export o métricas autorizadas | Hipótesis, período, denominador y variable a probar |
| Texto sin evidencia propia o voz genérica | Banco de evidencia y entrevista a la marca | Casos, cifras y posturas con procedencia; ver [voz y ganchos](voz-y-ganchos.md) |
| Estilo de movimiento sin criterio de revisión | Brief de cinco partes y revisión por fotogramas | Hoja, tira y recorte por plano; ver [estilos y revisión de movimiento](estilos-y-revision-de-movimiento.md) |

La base editorial y el QA de esta skill funcionan sin instalar las capacidades opcionales. Si una herramienta no está disponible, aplicar el criterio manualmente cuando sea posible y declarar qué no se ejecutó.

## Herramientas con costo, cuentas o riesgo

- Antes de generar, mostrar el costo (créditos, minutos o dinero) y esperar confirmación. Cada corrección que regenera vuelve a cobrar; avisarlo
- Una prueba gratuita que pide tarjeta puede renovarse sola como plan pago. La decisión de activarla es del usuario y se informa la fecha límite de cancelación
- Conectar un servicio con cuenta propia, clave o permisos de escritura no se hace por una recomendación de una fuente. Pedir autorización para esa acción
- Revisar quién retiene derechos sobre el material de referencia que se sube
- Un script de instalación que actualiza su código, descarga navegadores o ejecuta comandos de forma automática se revisa y se fija a una versión antes de correr
- Un repositorio muy popular o una guía bien escrita no sustituyen la prueba acotada con material autorizado

## Registro de adopciones (2026-10-21)

| Fuente | Principio tomado | Destino | Estado |
| --- | --- | --- | --- |
| sergebulaev/linkedin-skills (MIT) y su guía de Xavier Espinoza | Banco de evidencia, mecanismos de gancho, plantilla desde una pieza que funcionó, densidad de patrones, comentar antes de publicar, aprobación humana | [Voz y ganchos](voz-y-ganchos.md) | Criterio adoptado; las 12 skills no se instalan |
| Prompt de estadísticas de Instagram a tablero (Xavier Espinoza) | Ratios sobre alcance, captación de cliente ideal, causa aislada, hipótesis con muestra chica, tablero sin librerías | [Medición y aprendizaje](medicion-y-aprendizaje.md) | Criterio adoptado; prompt sin ejecutar |
| lemo-opuscar, mg-styles-15, ClaudeAnimationBase (MIT), awesome-opus5-5-videos | Brief de cinco partes, gramáticas de estilo, storyboard por lecturas, revisión por fotogramas, rúbrica de segunda pasada | [Estilos y revisión de movimiento](estilos-y-revision-de-movimiento.md) | Criterio adoptado; ningún motor instalado ni probado |
| Guía de motion con Claude Code y Remotion | Overlay transparente, captions locales, ajuste en Studio, licencia por tamaño de empresa | [Remotion](remotion.md) | Criterio adoptado; flujo sin ejecutar |
| Guía de Katana (Higgsfield) | Costo en créditos, prueba con renovación automática, derechos de material | Esta sección | Criterio adoptado; conector sin activar |

## Trasladar criterio de frontend a contenido

Sirven la jerarquía, alineación óptica, contraste, materialidad, densidad y explicación de estados. Hover, scroll, botones interactivos, framework y paleta favorita del autor no se trasladan automáticamente a PNG o video.

Un efecto tiene que cumplir una función visible: señalar el campo que cambia, distinguir un estado o conducir la lectura. Si compite con el ejemplo, se reduce o elimina. En un PNG elegir un estado final legible y estable; ningún mensaje depende de esperar una animación. En video verificar que el efecto pueda avanzar a un tiempo exacto y reproducir el mismo frame.

Las bibliotecas de efectos React/WebGL son opcionales para una escena que las necesite. No agregar un runtime a todo el sistema para lograr un borde o una textura que el renderer existente resuelve. No representar un loader, una onda de voz o un indicador de agente como prueba de una capacidad no verificada.

## Evaluar referencias y resultados propios

De una referencia visual registrar el principio que se toma y su aplicación: por ejemplo, documento grande con una única anotación para demostrar una diferencia. Conservar identidad y hechos propios.

De resultados propios comparar piezas del mismo objetivo y formato con ventanas equivalentes. Registrar tamaño de muestra y separar orgánico de pago. Crear variantes de un mecanismo observado (escena inicial, pregunta o demostración), sin atribuir el rendimiento a la estética por una sola publicación.

Un calendario o dashboard solo agrega valor si ayuda a decidir qué repetir, corregir o probar. Para una publicación aislada alcanza con la hipótesis y la métrica en su contrato; no hace falta construir una aplicación.
