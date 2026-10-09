# Claridad de los módulos contables

La experiencia del contador mantiene la profundidad profesional y las seis rutas actuales. El problema es la lectura de cada pantalla: datos, acciones y estados aparecen mezclados, algunos conceptos carecen de contexto y se usan controles genéricos como `prompt` para tareas que requieren trazabilidad.

## Diseño aprobado

- Conservar todas las operaciones y la selección compartida de contribuyente y período.
- Poner un objetivo específico y un estado legible en la cabecera de cada módulo.
- Agrupar cada pantalla por el objeto de trabajo: documentos/asientos, libros, estados, movimientos, checklist de cierre y borradores fiscales.
- Situar cada acción junto al registro o sección que modifica. Dar nombres explícitos a los botones y a las columnas.
- Explicar brevemente términos y consecuencias irreversibles sin ocultar los controles profesionales.
- Mostrar estados vacíos con la siguiente acción posible.
- Sustituir solicitudes críticas mediante `prompt` por campos visibles en la pantalla.

## Alcance por módulo

- **Registro:** documentos por contabilizar antes del editor; Debe/Haber etiquetados; borradores y confirmados distinguibles; plan de cuentas con jerarquía comprensible.
- **Libros:** diario, mayor y comprobación seleccionables dentro del módulo; tablas legibles y exportación contextual.
- **Estados:** pérdidas y ganancias y balance con totales jerárquicos, detalle de cuentas y publicación claramente separada de la consulta.
- **Bancos:** importación accesible, movimientos pendientes primero, sugerencias justificadas y contrapartida elegible sin código oculto.
- **Cierres:** checklist con acceso directo a la tarea pendiente; cierre y reapertura con consecuencias y motivo visibles.
- **Tributación:** separar ATS, IVA y renta; diferencias y revisión junto a sus cifras; mantener la marca de simulación.

## Datos y comportamiento

El libro local y las funciones de dominio continúan intactos, salvo correcciones necesarias para mensajes y estados. Las pantallas siguen leyendo el mismo `AccountingContext`. Los valores de ejemplo se identifican como demo; ningún archivo se presenta como válido para el SRI.
