# Video, reels y movimiento

## Elegir herramienta y alcance

Empezar por el resultado solicitado: guion, storyboard, subtítulos, edición de material, reel completo, motion breve o deck navegable. Una historia estática no activa video; un PDF de LinkedIn no es una presentación animada.

Si se usa un motor de video basado en código, cargar sus instrucciones vigentes y confirmar versión, capacidades y contrato antes del proyecto. No copiar comandos ni versiones fijadas de una referencia antigua. Un flujo instalado no equivale a un video validado.

Rutas orientativas: captions para metraje sin alterar; edición para cortes/reordenamiento; motion para una unidad breve donde el movimiento explica; explicador para un tema con visuales; producto para una demostración real; slideshow para una presentación navegable. Si la herramienta prevista no está disponible, conservar guion y storyboard y usar otra herramienta audiovisual autorizada; no simular un MP4 con slides.

### Rutas opcionales según el trabajo

| Necesidad | Ruta posible | Condición de uso |
| --- | --- | --- |
| Seleccionar tomas, quitar retomas y montar voz real | Video Use u otro editor con ASR por palabra y EDL | Material autorizado, proveedor/costo de transcripción resueltos y estrategia de montaje acordada |
| Componer escenas HTML/CSS o overlays | HyperFrames | Runtime compatible y timeline determinista comprobados |
| Reutilizar componentes React para animación | Remotion | Componentes existentes o una ventaja concreta de mantenimiento |
| Agregar subtítulos sin editar el metraje | Herramienta de captions | Conservar imagen, duración, orden y audio originales |
| Motion o diagrama sencillo | Motor ya disponible | Elegir el camino más simple que reproduzca el resultado |

Son alternativas, no una cadena obligatoria. Video Use puede organizar cortes y tiempos; un motor de animación puede producir solo un overlay. Leer la skill vigente de la herramienta elegida y usar el esquema de EDL que su renderer realmente acepte. Instalación no equivale a disponibilidad de credenciales ni a un piloto validado.

Documentación de los motores opcionales: [Video Use](https://github.com/browser-use/video-use), [HyperFrames](https://github.com/heygen-com/hyperframes), [Remotion](https://www.remotion.dev/docs/). Verificar versiones y dependencias al usarlos; no instalar los tres por defecto.

## Storyboard y dirección

Por beat: duración tentativa, frase hablada, idea visual, asset, texto en pantalla, transición y razón. Una vez grabada la voz, ajustar a sus tiempos reales. El primer frame informa el tema y permite entender qué mirar.

Voz, captions y gráficos cumplen funciones complementarias. Evitar mostrar el mismo párrafo en los tres canales. Una animación tiene intención: revelar, comparar, transformar, orientar o marcar transición; retirar movimiento sin función.

Producto/foto: separar rasgos invariantes (forma, marca, etiqueta) y estilización permitida (luz, fondo, cámara). Revisar fidelidad. Imágenes generadas no demuestran capacidades de una interfaz o resultado comercial.

## Montaje y reproducibilidad

Detectar tiempos de palabras/silencios con herramientas; no cortar sobre timestamps inventados por el modelo. Volver a transcribir o escuchar todo el montaje para encontrar palabras truncadas, cambios de sentido y cortes incómodos.

Para material hablado, conservar una transcripción literal por palabra y una vista compacta por frases. La transcripción es evidencia para elegir tomas, no una autorización para alterar lo dicho. Vincular la caché a una huella del audio transcrito y a proveedor/modelo/opciones; conservar aparte el hash del archivo original para procedencia. Un cambio de imagen o contenedor no obliga a retranscribir si el audio es idéntico. Si cambian voz o configuración del ASR, invalidar la transcripción afectada; si cambia el montaje, recalcular el mapeo temporal de los captions. No repetir una llamada paga al corregir un overlay.

Conservar originales y escribir el montaje en la carpeta de la pieza. La lista de cortes registra fuente, entrada, salida, frase/beat y motivo. Registrar estrategia y aprobación ya existente; no volver a pedirla si el usuario ya aprobó ese montaje. Una estrategia material aún no decidida se resuelve antes de cortar.

Separar tiempos de fuente y tiempos de salida. A velocidad normal, si se conserva el tramo 10–14 s de una toma y comienza en 6 s del montaje, una palabra en 11 s aparece en 7 s: `tiempo_salida = tiempo_fuente - inicio_del_tramo + inicio_en_montaje`. Si hay retiming, usar el mapeo real del renderer. Los subtítulos y overlays usan tiempos de salida. Comprobar cada corte contra palabras y fotogramas reales, con margen ajustado al audio; no elevar un padding de una demo a regla universal.

Captions por unidades de sentido, con contraste y tiempo de lectura. Evitar cortar nombres y frases en partículas aisladas. Coordinar su salida con el cambio de escena.

Componer captions por encima de los overlays que puedan taparlos y revisar también la UI del canal. En una cadena de filtros, aplicar subtítulos al final es una forma de preservar esa prioridad. Alinear el frame inicial de cada overlay a su ventana de salida; verificar duración, transparencia y último frame antes de integrarlo.

Con HTML animado, timeline seek-safe y determinista, fuentes/medios resueltos, pistas de audio separadas. Confirmar restricciones del runtime; no animar layout y media contra el contrato técnico del framework. Fijar dependencias del proyecto y verificar cambios de versión.

Música/efectos acompañan y no tapan la voz. Probar escuchando el export real; no fijar dB o duración universal desde un artículo. Confirmar derechos y contexto de uso antes de publicar.

Elegir easing y duración según lo que se muestra: una aparición y un desplazamiento uniforme no necesitan la misma curva. Sincronizar la culminación de una explicación con la palabra o acción que la justifica. Dar tiempo a leer el resultado; evitar múltiples revelaciones que compitan por atención. Los efectos sonoros se alinean a eventos concretos y se revisan en la mezcla final.

Si se concatenan segmentos sin recodificar, comprobar compatibilidad de codec, dimensiones, FPS/timebase y audio. Usar el renderer probado y normalizar cuando haga falta; no afirmar que una receta de concat siempre evita pérdidas o dobles codificaciones.

## Revisión

Reproducir el export con audio. Ver hook, todos los cortes, cada dato, overlays, transiciones y cierre; revisar frames críticos ampliados y vista móvil. Probar comprensión sin sonido y legibilidad con la UI de destino.

Registrar resolución, orientación, codec, duración, FPS, sincronía, clipping de audio, medios faltantes y último frame. Usar herramientas disponibles (p. ej., ffprobe y checks del renderer) y guardar su evidencia. Su éxito no aprueba narrativa ni estética.

Revisar ambos lados de cada corte en el archivo exportado, no solo en los originales. El registro de QA incluye timestamp, captura/evidencia, hallazgo y corrección. Comparar duración final con la lista de cortes y las transiciones previstas. Medir picos y niveles por secciones; si no se pudo escuchar o reproducir, informar esa limitación y dejar la revisión correspondiente pendiente.

Agrupar correcciones. Si tres rondas de render y revisión no resuelven el mismo defecto, diagnosticar la causa o informar el bloqueo; no seguir un ciclo sin fin ni aprobar el resultado por agotar intentos.

Si solo se entregó guion o faltan medios, etiquetar el estado. No llamar video final a un storyboard.
