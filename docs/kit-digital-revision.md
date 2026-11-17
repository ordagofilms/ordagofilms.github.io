# Revisión de la web para Kit Digital

La propuesta corrige la base técnica de la web publicada desde `nueva-web/prototipo`. Se prepara para revisión en una rama, con textos legales y analítica correspondientes a los datos facilitados por el titular. La publicación y la justificación requieren comprobar el resultado en el dominio público.

## Cambios incluidos

- Títulos, descripciones, encabezados y textos propios para Inicio, Cine y Servicios, editables desde `site-content.json`.
- Sinopsis, descripciones y enlaces a las ocho fichas disponibles en el HTML inicial, sin depender de la ejecución de JavaScript para su lectura o descubrimiento.
- Metadatos de Open Graph y datos estructurados de la organización con la información real de la empresa.
- Asociaciones explícitas de etiquetas y campos en los tres formularios; instrucciones, errores identificados con texto, foco en el primer campo que requiere corrección y revisión del borrador de correo.
- Enlaces para saltar al contenido y controles de pausa del vídeo de fondo; corrección de valores no numéricos en la animación del logotipo y eliminación de IDs duplicados en las copias del carrusel.
- Aviso legal, privacidad, política de cookies y pie con el banner oficial suministrado. Datos registrales contrastados con el [BORME de 16 de abril de 2025](https://www.boe.es/diario_borme/txt.php?id=BORME-A-2025-74-28), asiento 180031. El domicilio y el NIF proceden del titular.
- GA4 `G-G9HX6EF6HY`, cargado únicamente después de aceptar analítica. Publicidad denegada, preferencias con caducidad, posibilidad de retirada y exclusión de visitas locales, del gestor y de la vista previa.
- Gestor en `/gestor/`: permite editar textos de las tres páginas principales y crear páginas adicionales en español o inglés. Exporta `site-content.json`; el propietario lo sube y confirma en GitHub para publicar. No almacena credenciales ni modifica el repositorio desde un navegador anónimo.

## Alcance de la autogestión y los idiomas

El editor requiere un paso manual de publicación en GitHub con una cuenta que ya tenga permisos. No es un CMS con publicación directa. Se debe validar con el agente digitalizador si admite este flujo como evidencia de autogestión; si exige publicación en un solo panel, hará falta conectar un CMS con autenticación.

La creación de páginas admite español e inglés con direcciones separadas y atributo `lang` correcto. Esta preparación no equivale a una traducción completa del portfolio ni proporciona un selector de idioma de toda la web. La traducción íntegra y el idioma definitivo deben concretarse con el beneficiario y el digitalizador.

## Verificación realizada

- Pruebas de rutas antiguas y actuales, títulos, canonicals, recursos y sitemap.
- Pruebas de contenido legible sin JavaScript, etiquetas, IDs únicos y generación de una página en inglés.
- Pruebas de consentimiento inicial, rechazo, aceptación, retirada, sincronización entre pestañas, caducidad y exclusión de entornos de desarrollo.
- Prueba de edición y exportación del archivo de contenidos y bloqueo de direcciones de página inseguras. La prueba automatizada verifica el archivo; la espera del evento de descarga en el navegador integrado no llegó a confirmarlo.
- Revisión visual local del formulario y del pie en escritorio, de Servicios y cookies a 390 px y del editor a 820 px. Formulario comprobado con datos ficticios, sin enviar correo.

Comandos:

```sh
python3 -m unittest discover -s scripts -p 'test_*.py'
node --test scripts/test-*.cjs
```

## Comprobaciones necesarias antes de justificar

1. Revisar y aprobar los textos legales con los proveedores y operaciones reales de la sociedad. Comprobar en GA4 la configuración de conservación de datos, las funciones de medición mejorada y las condiciones de tratamiento aplicables.
2. Tras publicar, verificar la recepción real de datos consentidos en GA4 y la ausencia de medición al rechazar. La prueba local evita enviar datos a producción deliberadamente.
3. Verificar la propiedad y la indexación en Search Console desde la cuenta del titular; conservar la evidencia de SEO y el seguimiento acordado. Instalar Analytics por sí solo no acredita el trabajo de posicionamiento.
4. Repetir TAW con WCAG 2.1 AA y revisión manual: teclado y foco, contraste en los distintos fondos, zoom y reflujo, lectores de pantalla, carruseles y alternativas de los vídeos. Las pruebas automáticas incluidas no certifican conformidad completa.
5. Verificar subtítulos, transcripciones y audiodescripción cuando el contenido audiovisual lo requiera. Los archivos de vídeo no se han evaluado en esta revisión local.
6. Completar evidencias reales del hosting y titularidad, tres páginas o apartados, escritorio/móvil/tableta, autogestión y directorios de empresa. Las capturas locales sirven para revisar el cambio; las de la justificación deben corresponder al servicio efectivamente implantado.
7. Validar que la plantilla de primera convocatoria, versión 30/11/2023, corresponde al expediente y que el alcance de idiomas y SEO coincide con el acuerdo aplicable.

No se tramita ninguna renuncia de fase 2 ni se presenta documentación en nombre de la sociedad desde esta propuesta.

## Referencias técnicas

- [W3C sobre etiquetas de formularios](https://www.w3.org/WAI/tutorials/forms/labels/).
- [Google sobre Consent Mode básico](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic).
- [Guía de cookies de la AEPD](https://www.aepd.es/guias/guia-cookies.pdf).
- [Guía de SEO de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
