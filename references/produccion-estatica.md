# Producción estática y adaptación

## Resolver formato real

Antes del HTML registrar plataforma + tipo de pieza + vía de publicación. Distinguir canvas lógico, píxeles exportados, proporción y recorte de vista previa. Un PNG de 1536x2048 es 3:4 aunque su resolución sea alta; no entra sin recorte en un publicador limitado a 4:5.

Cuando exista un perfil validado del proyecto, usarlo. Para nuevos destinos, confirmar especificaciones vigentes en documentación oficial y, si es accesible, preview del publicador real. Una tabla de una skill no prueba compatibilidad actual.

Como puntos de partida de composición, sujetos a esa confirmación: feed vertical 1080x1350 (4:5); historia/estado/video vertical 1080x1920 (9:16). LinkedIn puede requerir documento PDF o imágenes según el pedido y vía elegida. No afirmar que todos los canales comparten tamaño, UI o límites.

Exportar a 1x o 2x según contrato/publicador. Si se necesita 1080x1350 exacto, 2160x2700 no cumple ese contrato aunque conserve ratio. Para convertir 3:4 a 4:5, recomponer contenido; no aplastar ni recortar a ciegas.

## Implementar

Usar HTML/CSS editable como ruta base si el proyecto o usuario no eligió otra herramienta. Respetar Canva/Figma u otro editor cuando se hayan pedido. En proyecto existente, reutilizar renderer y controles antes de agregar dependencias.

- Un archivo o root identificable por slide; canvas fijo, `box-sizing:border-box`
- Fuentes locales o embebidas con pesos reales; resolver recursos respecto al archivo
- Composición principal en grid/flex; absolute para capas internas/fondos, con coordenadas compartidas en diagramas
- Evitar mezclar estilos de preview y export; el marco del simulador no pertenece al PNG
- Identificar contenido crítico para checks de bounds; esperar fuentes e imágenes efectivamente cargadas
- Capturar el root medido en navegador, por slide, con viewport/escala del contrato; no deducir tamaño con regex ni desde la primera slide
- En Windows usar `pathToFileURL()` o URI del sistema; `file:///c/...` de Git Bash no equivale a `file:///C:/...`

Receta para un browser automatizable disponible: abrir HTML -> esperar `document.fonts.ready` y decodificación de imágenes -> verificar recursos/red -> medir root y límites -> captura exacta -> comprobar PNG -> revisión visual. La API concreta se toma de la herramienta presente; no inventar un comando de Chrome ni asumir Playwright instalado.

Conservar evidencias del render: errores de recursos, dimensiones calculadas, warnings, archivos y hashes. Capturas de páginas de error pueden tener dimensiones correctas: solo abrirlas permite descartarlas con seguridad.

## Historias/estados

Recomponer en vertical: menos texto por pantalla, objeto grande y CTA visible. Usar una zona segura comprobada para el canal; si comparte entre canales, cumplir la intersección. Fondos pueden llegar a sangre.

Dejar lugar para sticker nativo sin dibujarlo como si ya fuera interactivo. Para WhatsApp, preparar una versión que funcione con respuesta manual. Omitir barra de carrusel si la plataforma ya aporta navegación o no corresponde.

## Export y entrega

Mantener fuentes y finales en carpetas separadas del proyecto. Numeración inequívoca; manifest con orden, proporción, salida esperada y auxiliares. Contact sheet se identifica como muestra y no se mezcla en el orden publicable.

Para PDF multipágina, producir desde las imágenes/HTML aprobados según pipeline y revisar páginas, orden y fidelidad. Para JPEG comprobar formato decodificado, dimensiones y compresión con herramienta apropiada. El auditor incluido solo cubre PNG.

Escribir caption específico por red y alt text cuando corresponda. Enlazar el destino real, no prometer un comentario o archivo aún inexistente.
