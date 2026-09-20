---
name: social-content-studio
description: "Planificar, escribir, diseñar, producir, adaptar o corregir publicaciones de redes para cualquier marca: posts, carruseles, historias/estados y reels. Usar con ideas sueltas, briefs, referencias o piezas existentes que deben convertirse en contenido claro, visualmente cuidado y verificable. Incluye revisión editorial, dirección de arte, fuentes editables y QA del exportado. No se activa para desarrollo web general ni publica automáticamente."
metadata:
  version: "1.0.0"
---

# Social Content Studio

Convertí una idea en una pieza que el público entienda, tenga una razón para guardar, compartir o responder y, cuando corresponda, un camino real hacia la oferta. El método es portable, independiente de la marca y no requiere servicios externos específicos.

## Elegir alcance y contexto

- Leé primero las instrucciones y activos del proyecto. Una corrección reciente del usuario manda sobre el brief reenviado. No conviertas una corrección puntual en prohibición universal.
- Pedido de análisis: entregar diagnóstico. Pedido de copy: terminar en copy. Pedido de producción: llegar al exportado revisado. Pedido de corrección: preservar contenido y decisiones aprobadas fuera del cambio.
- Recibí el brief como venga. Completá con contexto existente; preguntá solo lo que cambie materialmente verdad, identidad, formato, oferta o entrega. Usá supuestos menores explícitos.
- Para cada marca, reunir identidad, logos oficiales, colores, fuentes, voz, oferta, lector y referencias según [perfil y contrato](references/perfil-y-contrato.md). Nunca heredar preferencias de otro proyecto.
- Publicar, agendar, enviar mensajes o conectar cuentas requiere autorización para esa acción. Crear archivos locales y revisar no la implica.

## Gate A: resolver el contenido

Leer [estrategia y copy](references/estrategia-y-copy.md) para una pieza nueva o cambios de mensaje.

Extraer objetivo, lector, situación, idea, evidencia, acción esperada, canal y formato. Elegir el arco que entrega la promesa: demostración, explicación, caso, comparación, tutorial, reflexión o anuncio. No imponer una cantidad de slides, una taxonomía cerrada ni urgencia artificial.

Producir copy literal por slide/escena, caption complementario y las dependencias reales del CTA. Identificar cada afirmación verificable y separar dato, interpretación y ejemplo ilustrativo. Un claim material sin evidencia queda resuelto mediante fuente, eliminación o reformulación antes del export final; no publicar marcadores pendientes.

Aplicar la revisión antislop de la referencia. Preservar la voz; no adivinar si el autor usó IA. Titular y apoyo deben aportar información distinta.

Respetar el modo de aprobación del usuario/proyecto. Si pidió evaluar primero, presentar el guion y detener la producción. Si ya autorizó analizar y producir, resolver Gate A internamente y seguir; no exigir dos turnos por una receta externa. Una decisión de identidad o un dato esencial pendiente sí requiere respuesta.

## Dirección de arte y contrato

Leer [dirección visual](references/direccion-visual.md). Escribir qué debe entenderse de cada slide y qué recurso lo demuestra antes de elegir colores y adornos.

Registrar en el contrato la secuencia, copy, ancla con ejemplo literal, composición, fuentes, material, navegación y formato exacto. Usar [perfil y contrato](references/perfil-y-contrato.md) como guía proporcional: una corrección de espaciado no necesita rehacer el brief completo.

Producir y revisar internamente la portada y la escena más difícil antes de extender la dirección. No repetir la misma tarjeta/gradiente cambiando íconos; alternar composiciones con una razón narrativa. Una pieza tipográfica puede ser suficiente cuando el mensaje lo justifica.

## Producción por entregable

| Entregable solicitado | Referencia que cargar |
| --- | --- |
| Post, carrusel, flyer digital, historias o estados estáticos | [Producción estática](references/produccion-estatica.md) |
| Reel, clips, motion graphic, captions o presentación animada | [Video y movimiento](references/video.md) |
| Solo auditoría/corrección de archivos finales | [Revisión y entrega](references/revision-y-entrega.md) y la referencia del formato |

Mantener editables separados de finales. Adaptar contenido, composición, CTA y zona segura a cada destino; estirar el feed no crea una historia. La herramienta sigue al entregable y a la elección del usuario.

Las guías de producción funcionan como base autónoma. Reutilizar el renderizador probado del proyecto cuando exista. Para video, verificar las capacidades y contratos de la herramienta autorizada antes de elegir el flujo. Ninguna dependencia se considera instalada por aparecer en esta skill.

## Gate B: revisar el archivo real

Leer [revisión y entrega](references/revision-y-entrega.md). En estáticos: inspeccionar cada archivo ampliado y a ancho de teléfono, después la secuencia completa. En video: reproducirlo con sonido y revisar cortes, captions y frames críticos.

Para PNG, [scripts/audit_exports.py](scripts/audit_exports.py) verifica lista exacta, formato binario, decodificación, dimensiones, proporción y hashes contra `export-contract.json`. No renderiza ni aprueba el diseño. Uso:

```text
python <skill>/scripts/audit_exports.py <carpeta-final> --contract <export-contract.json> --report <qa-tecnica.json>
```

Requiere Python 3 y Pillow. Usar el runtime disponible del entorno. Si no está disponible, verificar con otra herramienta real e informar el alcance; nunca declarar una prueba que no se ejecutó.

Corregir defectos conocidos y revisar de nuevo todos los archivos afectados. El hash vincula la revisión a una versión: un cambio compartido invalida la evidencia anterior correspondiente. No repetir pulidos una vez cumplidos los criterios.

Entregar enlaces a finales, vista previa cuando sea posible, copy y limitaciones reales. Distinguir listo para revisión de autorizado para publicación.

## Mejorar el método con evidencia

Medir según objetivo usando datos propios disponibles: comprensión/respuestas, guardados/compartidos, retención, conversaciones calificadas o conversiones. Registrar período, denominador y limitaciones de atribución. Probar una variable identificable; la skill no garantiza viralidad ni ventas.

Ante feedback repetido, vincular síntoma -> causa -> control -> evidencia; actualizar la regla responsable en lugar de sumar prohibiciones. Aplicar cambios persistentes solo en el ámbito solicitado.

Para evaluar modificaciones de la skill, usar [casos de evaluación](references/casos-de-evaluacion.md).
