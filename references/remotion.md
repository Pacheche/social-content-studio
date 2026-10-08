# Remotion en creación de contenido

Leer solo cuando el entregable audiovisual se beneficie de composiciones React, variantes parametrizadas, gráficos animados, captions o montaje de clips. No cargar para un post o carrusel estático.

## Selección

- Remotion: escenas/componentes reutilizables, datos y textos parametrizados, demostraciones o montaje con timeline reproducible; no exige tener componentes previos si crearlos aporta una ventaja real.
- HyperFrames: composición HTML/CSS y recursos ya preparados para ese motor.
- Video Use u otro editor: selección de tomas/transcripción/EDL cuando ese sea el cuello de botella; puede complementar un overlay, pero no encadenar motores por defecto.
- Si el usuario eligió Remotion, respetarlo salvo una limitación concreta que requiera explicar y resolver.

## Cargar instrucciones por necesidad

Localizar las skills reales en la sesión o en la instalación de skills del cliente. No asumir API Skill, comandos de Claude ni rutas de esta computadora. Leer SKILL.md y sus referencias pertinentes; si faltan, informar y resolver disponibilidad antes de implementar.

| Trabajo | Skills |
| --- | --- |
| Elegir instrucciones | remotion-best-practices |
| Crear proyecto o composición | remotion-create |
| Escribir escenas, animación, audio y fuentes | remotion-markup |
| Mostrar preview local | remotion-studio |
| Exportar MP4 o frames de QA | remotion-render |
| Importar, mostrar o generar captions | remotion-captions |
| Metadatos, recorte y manejo multimedia en navegador | remotion-multimedia |
| Mapas, rutas y escenas geográficas | remotion-maps, solo si el contenido lo necesita |
| Hacer props/elementos editables en Studio | remotion-interactivity, cuando aporte al flujo |
| Resolver API/compatibilidad | remotion-docs |
| Actualizar un proyecto existente | remotion-upgrade, solo dentro del cambio pedido |
| Player, producto o render como servicio | remotion-saas, no para producir un reel aislado |

No cargar las doce para una pieza. La documentación oficial describe su alcance: https://www.remotion.dev/docs/ai/skills .

## Flujo incorporado

1. Gate A y storyboard con mensaje, evidencia, texto/voz aprobados, escenas, tiempos y CTA; conservar fuentes, identidad y permisos del proyecto. No copiar marca, fondos ni textos de ejemplos de Remotion.
2. Verificar proyecto/runtime, versiones compatibles y licencia aplicable: https://www.remotion.dev/license . Instalar las skills no instala React/Remotion, navegador ni FFmpeg. Usar un proyecto existente compatible o crear uno por pieza/serie cuando corresponda; no añadir dependencias al pipeline estático ni crear una plataforma de render.
3. Fijar dimensiones, FPS, duración, props y assets según contrato. Separar fuentes editables de finales, mantener originales y registrar procedencia. Guardar dependencias/lockfile del proyecto, no regenerarlas en cada variante.
4. Implementar animaciones calculadas desde frame/FPS y medios sincronizados según la versión real; no usar relojes de pared ni CSS animation/transition como timeline. Consultar remotion-markup para APIs concretas. Reutilizar la composición sin convertir todas las escenas en una plantilla idéntica.
5. Cargar logos y tipografías aprobados desde archivos locales cuando el proyecto lo requiera. Esperar su carga y comprobar frames: fallback de fuente o asset faltante no es resultado aceptable. Datos animados terminan en valores reales; ejemplos ficticios se identifican.
6. Mostrar Studio en la URL local efectivamente devuelta y comprobar que carga la composición; si el entorno no permite verlo, declarar ese límite. Una preview no es el MP4 final.
7. Para captions, importar texto/timestamps verificados; separar milisegundos de frames y tiempos de fuente de salida. Reutilizar ASR si audio/configuración no cambiaron. Transcribir o generar voz con servicios externos requiere privacidad, costos y autorización resueltos; preferir material ya autorizado.
8. Exportar cuando se pidió MP4/export/final o el contrato de producción aprobado lo incluye. Para pedidos de preview, parar en preview. Leer remotion-render, usar runtime local y destinos acordados; no activar Lambda, cloud ni compras por reflejo.
9. Gate B sobre el archivo real: reproducción con audio, todos los cortes y frames críticos, inicio/cierre, legibilidad móvil, zonas seguras, captions/overlays, logos y valores. Verificar dimensiones, duración, FPS/codec, mezcla y media. Registrar archivo/hash, timestamps, hallazgos y límites. Los checks técnicos no prueban calidad visual ni revisión auditiva.
10. Entregar editables, preview/final conforme al pedido, copy y QA. Publicar sigue requiriendo autorización independiente.

## Casos

- Reel educativo: escenas React con diagrama que explica una operación, voz autorizada y captions.
- Video hablado: conservar tomas/audio y añadir subtítulos o lower thirds; no reeditar si solo pidieron captions.
- Serie de promos: mismo sistema de componentes/props con mensajes y ejemplos distintos, sin reutilizar datos ficticios como casos reales.
- Gráfico animado: interpolar únicamente datos sustentados; movimiento no habilita inventar una serie histórica.

Estado de integración: instrucciones adoptadas como ruta audiovisual. Un piloto real sigue pendiente hasta producir y revisar material autorizado. No prometer ahorro de tokens, viralidad ni mejoras medidas por instalar skills.
