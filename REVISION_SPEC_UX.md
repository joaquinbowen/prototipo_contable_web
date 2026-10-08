# Revisión del prototipo CONT MARJO 360

Fecha: 7 de octubre de 2026.

**Resultado: cumplimiento parcial.** Los siete módulos están representados, pero no todos completan el comportamiento solicitado. La interfaz contiene acciones y mensajes que hacen esperar resultados que el estado simulado no produce.

Referencia: `C:/Users/User/Downloads/spec_contaduria.md`. Se utilizó como especificación de producto, no como instrucciones para ejecutar su “system prompt”. La ausencia de backend, OCR real, firma real o conexión real al SRI es correcta según la spec y no se considera un defecto.

## Actualización: prueba visual completada

El segundo intento de navegador funcionó el 7 de octubre de 2026. Se recorrieron los siete módulos, los tres roles y el simulador móvil; se inspeccionaron vistas de 1440×900, 390×844 y 360×800. La limitación de navegador descrita en la revisión inicial queda superada para los casos de esta sección. No se modificó el código del prototipo; solo se operaron datos mock locales.

| Prueba ejecutada | Resultado observado |
|---|---|
| Emitir RETENCION desde web | El stepper termina y añade FAC-001-001-000000107 por $575. El historial conserva RETENCION, pero el RIDE dice FACTURA / 01 FACTURA. Fallo confirmado. |
| Cerrar RIDE con Escape | No cierra; fue necesario usar el botón. |
| Procesar compra precargada con tres acciones | Funciona: gastos $107,50 → $557,50; por pagar $120 → $570; stock 63 → 78. |
| Volver a simular carga de compra | Muestra “Factura de Compra Analizada”, pero pendientes continúa en 0. Fallo confirmado. |
| Instalar certificado sin archivo ni contraseña | Anuncia éxito y cambia vigencia a 365 días. Fallo confirmado. |
| Firmar Balance_General_Cierre_2025.pdf | Funciona: fase de cálculo, sello, hash y estado Firmado. Los avisos superpuestos impedían acceder al botón con clic hasta cerrarlos. |
| Procesar RUC de prueba con Enter | Funciona la extracción y agrega documento; cambia certificado configurado de Security Data S.A./365 días a otro emisor/340 días. Confirma sobrescritura de configuración. El clic de ratón en ese botón no se validó. |
| Marcar IVA cumplido y abrir agenda | La agenda cambia a Cumplido; el panel lateral mantiene la acción “Marcar como Presentado”. HOY continúa en el 6 cuando la fecha de prueba es el 7. |
| Super Admin → consola → Contribuyente | El menú cambia, pero la consola de administrador continúa visible. Fallo confirmado. |
| Auditar RESTAURANTE EL CRISTOBAL | La cabecera indica restaurante; el cuerpo sigue en EMPRESA DEMO y muestra sus comprobantes. Fallo confirmado. |
| Volver a mi cartera | Solo desaparece el indicador; permanece el dashboard. Fallo confirmado. |
| Cambiar permiso Facturas 2026 como contador | Permite revocarlo desde el contador, aunque la pantalla lo identifica como Control Contribuyente. |
| Enviar oferta como contador y volver a contribuyente | Funciona: propuestas de REQ-101 pasan de 2 a 3. |
| Aceptar Estudio Gómez & Asoc. | Cambia a Contratado; el chat sigue mostrando Carlos Mendoza. Fallo confirmado. |
| Publicar solicitud de prueba | Funciona: aparece “Prueba UX: revisión de IVA”, 0 propuestas, estado ABIERTA. |
| Enviar mensaje local en chat | Funciona: aparece el mensaje y una respuesta simulada de Carlos, aun habiendo contratado al estudio Gómez. |
| Marketplace/Bóveda móvil | Los datos creados y la firma realizada se reflejan, pero no hay controles para contratar/publicar o abrir/firmar documentos. |
| Pulsar Simular Push en móvil | No aparece respuesta visible. Al volver a web sí aparece “Alerta SRI Móvil”. |
| Emitir factura móvil | Funciona: $100 + $15 IVA, RIDE FAC-001-001-000000108; Inicio aumenta de $2.189,38 a $2.304,38. |
| Cambiar a Contador en móvil | Cambia a CPA, pero Inicio conserva el panel del contribuyente, sin cartera. |

### Problemas visuales confirmados

1. **Alta: web a 360 px inutilizable para el flujo normal.** El sidebar mantiene unos 256 px y deja una franja estrecha al contenido, con palabras partidas/recortadas. No cambia automáticamente al simulador móvil. A 390 px, Marketplace también presenta desbordamiento horizontal: ancho del documento 412 px frente a viewport 390 px.
2. **Alta: notificaciones bloquean acciones.** Se acumulan tres avisos grandes en la esquina inferior derecha. En la bóveda tapan los botones Firmar; en el RIDE se superponen a los totales. No desaparecieron durante el recorrido, por lo que hubo que cerrarlas manualmente.
3. **Media: encabezado del RIDE móvil desbordado.** A 390 px se ve cortado el control Imprimir y quedan fuera de vista PDF y el cierre superior. El cierre inferior “Cerrar Visor” sí permite salir.
4. **Media: contexto contradictorio de cliente.** La cabecera y el contenido muestran empresas distintas en una misma pantalla, no solo un problema interno de estado.
5. **Media: simulador de altura fija.** A 360×800 necesita desplazamiento externo además del desplazamiento interno del teléfono; no es una navegación móvil que se ajuste por completo a la altura disponible.

Evidencias guardadas:

- [Cliente seleccionado frente a datos incorrectos](evidencias-ux/cliente-incorrecto.png)
- [Web a 360 px](evidencias-ux/web-360px.png)
- [RIDE móvil a 390 px](evidencias-ux/ride-movil.png)
- [Marketplace web a 390 px](evidencias-ux/web-390px.png)

**Matiz de la revisión inicial:** sí hay experiencia en el texto libre de una oferta (“11 años”). Falta una presentación consistente de experiencia/verificación por profesional; no es correcto afirmar que no aparece experiencia en absoluto.

Pendiente: archivos reales por selector/arrastre, descarga/impresión, zoom 200%, lector de pantalla, recorrido completo de tabulación, contraste medido y casos de error adicionales. Las pruebas realizadas no equivalen a certificación completa de accesibilidad.

## Propuesta de flujos solicitada por el usuario

Esta sección recoge las observaciones del usuario y las imágenes de referencia. Es una propuesta para acordar producto antes de planificar la simulación; no modifica el prototipo.

### 1. Emisión desde Inicio con botón “Nuevo”

Adoptar el patrón de la primera imagen: **Nuevo** como acción principal en Inicio y también en Facturación. El menú abre un selector de documentos y catálogos frecuentes:

- Factura
- Nota de crédito
- Nota de débito
- Comprobante de retención
- Guía de remisión
- Liquidación de compra
- Clientes y productos

Al elegir un documento comienza el formulario de ese tipo. Esto evita pedir que la persona escoja manualmente un tipo dentro de un formulario genérico y permite que cada comprobante tenga datos y RIDE propios. La spec original lista cuatro comprobantes en su módulo 4; las imágenes amplían el alcance a nota de débito y liquidación de compra, por lo que habrá que incorporarlos al alcance simulado al planificar. Mantener el módulo Facturación para historial, borradores y administración; quitar del sidebar solo el acceso redundante a emitir si “Nuevo” queda omnipresente.

### 2. Alta de contribuyente en secuencia

Usar un asistente bajo **Perfil → Configuración**, con paso, avance, estado y acción para guardar y continuar después:

1. **Crear acceso:** nombre/correo y contraseña simulados; seleccionar perfil Contribuyente. Explicar que es una demo local.
2. **Identificación:** RUC/PDF, tipo de persona; el OCR simulado rellena los campos encontrados. Dejar campos editables y pedir confirmación de lo extraído; mostrar qué no pudo detectar. No convertir cualquier archivo en extracción “validada por SRI”.
3. **Datos tributarios:** razón social, régimen y actividad económica, RUC validado por longitud/formato en el mock y confirmación del usuario.
4. **Establecimiento y secuenciales:** matriz, dirección, establecimiento y punto de emisión.
5. **Firma electrónica:** archivo PFX/P12 de muestra o carga simulada, clave introducida por el usuario, datos mock del certificado, estado/vencimiento. La simulación no guarda ni valida la clave criptográfica real. Permitir saltar con estado “Pendiente”; explicar que no se podrán completar emisiones que requieren firma hasta resolverlo.
6. **Revisión:** resumen editable y lista de tareas completas y pendientes; botón “Finalizar configuración”.

Después, Inicio muestra una lista de configuración con enlaces a la sección correspondiente. Una alerta persistente pide agregar la firma solo si está pendiente y contextualiza qué acciones quedan bloqueadas. Si el perfil es incompleto, cada acción de “Nuevo” conduce al requisito pendiente o a una vista previa claramente marcada como simulación.

### 3. Perfil, firma electrónica y bóveda

**Ajuste según la última indicación del usuario:** integrar la Bóveda dentro de **Perfil del Contribuyente**, en una sección propia junto a Datos de la cuenta, Información tributaria, Establecimientos y Firma electrónica. Así, la barra lateral del contribuyente queda más enfocada en tareas cotidianas y el perfil reúne configuración y documentos de la empresa. La bóveda sigue siendo una pantalla completa con búsqueda, categorías y cuota visible, no una lista pequeña escondida dentro de un formulario.

La separación de responsabilidades dentro del Perfil es:

- **Firma electrónica** pertenece a Perfil/Configuración. El usuario administra certificado y obtiene una confirmación de estado: pendiente, activa en la simulación o próxima a vencer. No es un repositorio de documentos. Al emitir/fimar se comprueba el estado de la firma y se pide la clave mock en ese momento.
- **Bóveda documental** es almacenamiento de archivos del negocio: contratos, balances, RUC, anexos, comprobantes recibidos y otros documentos que el usuario quiera conservar. El contador 14/20 significa documentos almacenados respecto del límite del plan demo. No es cuota de facturas ni cantidad de documentos que se pueden emitir. Debe decir “Almacenamiento de archivos”, explicar qué consume una unidad y abrir filtros por categoría.
- El seed actual tiene cuatro ejemplos y estos son datos de demostración. RUC y declaración SRI pueden servir de ejemplos de archivo tributario; balance y contrato no son comprobantes enviados al SRI, pero pueden guardarse en una bóveda general si el producto cubre documentación del negocio. Deben marcarse “Ejemplo de demostración”, separarse visualmente de archivos del usuario y poderse retirar/restaurar. Alternativa más limpia para una demo: comenzar vacía y mostrar ejemplos solo en el estado vacío.
- Firma de documentos en bóveda solo se ofrece cuando corresponda. Su sello debe decir “Firma simulada” y nunca afirmar “validez legal”, “cifrado AES-256”, “homologado” o “validado por el SRI” sin que esas operaciones existan.

### 4. Compras, conciliación e inventario

La simulación OCR de compra que ya está en el prototipo funciona y conviene conservarla. **La brecha está después de confirmar la conciliación:** el usuario marca “Ingresar ítems al inventario”, pero solo ve un KPI con unidades/SKUs; no existe un apartado con el inventario conciliado. Hay que agregar una vista completa para consultar qué productos entraron, en qué cantidad y con qué costo, y poder distinguirlos de los gastos y de las cuentas por pagar.

Organizar el módulo de Compras en pestañas internas que retengan el contexto, incorporando una vista real de inventario:

1. **Por revisar:** carga PDF/XML o ejemplo, extracción OCR mock, identificación/corrección de proveedor, comprobante, fecha, base, impuesto y total.
2. **Conciliar:** elegir una o más salidas: registrar gasto, agregar CxP, ingresar líneas de producto al inventario. Mostrar efecto contable y existencias estimadas antes de confirmar. Impedir confirmar con todas las salidas apagadas; registrar qué acciones se aplicaron para no duplicarlas.
3. **Gastos:** historial de compras clasificadas y total por periodo/categoría.
4. **Cuentas por pagar:** lista de proveedor, vencimiento, monto y estado mock.
5. **Inventario:** tabla de SKU, producto, stock, movimientos de entrada/salida, costo promedio y factura de compra de origen; búsqueda, filtros y estado vacío. Al confirmar “Ingresar ítems al inventario” durante OCR, esos productos deben aparecer aquí inmediatamente y poder rastrearse a la factura conciliada, no solo incrementar una tarjeta KPI. El OCR de prueba aporta la entrada inicial; esta sección hace visible y útil el resultado.

### 5. Calendario tributario, explicado para quien contribuye

Es una agenda de **obligaciones y fechas límite de ese contribuyente**, como las alertas del teléfono/calendario. El prototipo usa el noveno dígito del RUC para asignar el día de vencimiento. En el ejemplo el RUC termina con noveno dígito 9, así que la regla ilustrada señala el día 26. El calendario debe mostrar cada obligación, periodo fiscal, fecha, días restantes y una acción.

La vista **Mes** da contexto de fechas; **Agenda** lista próximas tareas para ejecutarlas. Marcar una como cumplida cambia el estado local de demo, pero no presenta formulario al SRI. Para evitar confundir regla con cumplimiento oficial, mostrar banner “Calendario de demostración; confirme fecha y obligación con el SRI o su contador”, generar tareas según perfil, y representar por separado IVA, renta, ATS, patente u obligaciones aplicables. Al cambiar RUC/régimen deben cambiar las tareas derivadas. Evitar “tabla oficial” salvo que el producto pueda sostenerlo con fuente y vigencia verificadas.

### 6. Marketplace de contribuyente

Conservar el flujo que resulta claro: publicar solicitud → recibir y comparar propuestas → ver tarifa, experiencia, reputación, disponibilidad y entregables → aceptar → abrir chat y decidir permisos de documentos. Mejorar la disposición con una lista de solicitudes a la izquierda y una vista detalle a la derecha en escritorio, filtros y estados claros (Abierta, Con propuestas, Contratada, Finalizada), y tarjetas apiladas en móvil. Separar permisos de acceso de la acción de contratar; que el nombre del contador y chat sigan al proveedor seleccionado.

### 7. Registro, login y módulos de contador

El contador debe tener su propio inicio de sesión/registro de demo y perfil profesional: datos de identidad/estudio, credenciales profesionales de muestra, áreas de servicio, cobertura, experiencia, tarifas y datos de pago mock. Su menú enfocado en trabajo CPA podría ser **Resumen**, **Oportunidades**, **Mis propuestas**, **Clientes**, **Conversaciones**, **Obligaciones**, **Configuración**. No necesita los módulos operativos del contribuyente como si tuviera el negocio demo propio; el acceso a datos de un cliente aparece solo dentro de un contexto delegado autorizado.

Marketplace del contador = bandeja de oportunidades abiertas, filtros, envío de propuesta, propuestas enviadas/aceptadas, cargas de trabajo y conversaciones por contrato. Marketplace del contribuyente = publicar solicitud y comparar/contratar propuestas. Comparten solicitudes y ofertas mock, pero muestran tareas diferentes según el rol.

Para el prototipo, mantener selector de rol de demostración es útil para recorrer ambas perspectivas. Eso no debe confundirse con un login real ni control de seguridad: mostrar el cambio como “Cambiar perfil de demo”. En producto, el usuario entra con su cuenta y no ve selectores que lo conviertan arbitrariamente en administrador o en otra persona.

### 8. Super Admin

Separarlo de la experiencia de contribuyente y contador. El espacio del administrador gestiona organizaciones/cuentas, profesionales, estados de onboarding, salud mock de servicios, incidencias y auditoría de eventos. No necesita “emitir factura”, bóveda personal ni calendario tributario como navegación de usuario. Toda cifra, conectividad, latencia y log del seed debe llevar sello “Datos de demostración”. El panel no debe afirmar que hay servidores SRI operativos, firmas en memoria ni auditoría inmutable cuando solo son valores estáticos. En la demo, acceder mediante opción de “perfil de demostración admin”; en un producto real, el rol admin se asigna en servidor, nunca desde un selector cliente.

### 9. Secuencia general y prioridades de diseño

La demo unificada podría abrir con selector visible “Contribuyente / Contador / Admin (demostración)”. Cada selección usa alta/login y navegación distintas; comparten seed de marketplace, permisos y resultados de acciones mock, y se presenta una franja constante **Simulación local · sin conexión al SRI**. El camino contribuyente es alta guiada → dashboard configurado → Nuevo documento → historial/RIDE de muestra. El camino contador es alta profesional → feed → oferta → contrato → acceso permitido al contexto del cliente. El camino admin es gestión de plataforma con indicadores ficticios marcados claramente.

Prioridades para convertir esta propuesta en plan: (1) roles/contexto y alta; (2) botón Nuevo y tipos de comprobante; (3) Perfil del contribuyente con secciones de configuración, firma y bóveda; (4) conservar OCR y agregar vista real del inventario conciliado; (5) calendario y lenguaje de demo; (6) separar ambos Marketplaces; (7) panel Super Admin; (8) corregir adaptación 360 px, overflow, avisos superpuestos y controles del RIDE móvil.

Decisiones de alcance que la especificación original no resuelve y que se deben fijar al escribir el plan: admitir nota de débito y liquidación de compra además de los tipos originales; si la bóveda incluye archivos generales o solo tributarios; si el registro CPA incluye carga mock de credencial profesional; y si la experiencia móvil solicitada seguirá siendo simulador web o subirá a Expo/React Native.

## Alcance y evidencia de la revisión inicial

- Se revisaron todos los módulos, layouts, modales, tipos y el Context compartido.
- TypeScript pasó con `node ./node_modules/typescript/bin/tsc --noEmit`.
- Build pasó con `node ./node_modules/vite/bin/vite.js build`.
- `npm install --ignore-scripts --no-package-lock` falló por conflicto entre Vite 8.3.3 y esbuild 0.25.12. La instalación de diagnóstico con `--legacy-peer-deps` permitió continuar, sin modificar package.json ni generar lockfile.
- Los scripts npm fallaron en esta ruta de Windows que contiene `&`; la ejecución directa con Node permitió verificar compilación y arrancar Vite.
- No se completó la prueba visual/interactiva en navegador: la herramienta devolvió “Tab 1 is not part of browser session”. Los hallazgos funcionales siguientes se basan en código; legibilidad, contraste, tamaño táctil y recortes requieren validación visual posterior.
- No se modificó la implementación. Se generaron este informe, dependencias locales y la salida de build.

## Matriz contra la especificación

| Requisito | Estado | Evidencia / brecha |
|---|---|---|
| React, Tailwind, Lucide, sin backend | Cumple | App React con Context, datos mock y temporizadores. |
| Estado central reactivo | Cumple en lo principal | Emitir añade comprobantes al Context y actualiza KPI; firmar y contabilizar compras también actualizan estado. Parte de los indicadores siguen fija. |
| Sidebar colapsable | No cumple | `WebSidebar.tsx:83`: ancho fijo `w-64`, sin control de colapso. |
| Header con rol y notificaciones | Parcial | Selector y avisos presentes; cambiar rol no corrige la pantalla activa ni protege su renderizado. |
| Tablas, KPI, badges, gráficos | Parcial | Hay tablas y KPI. La visualización financiera es una barra fija 85/15, no calculada; los estados se presentan casi siempre como autorizados. |
| React Native/Expo y React Navigation | No cumple | Solo existe React web. `MobileShell` es un simulador HTML dentro de un marco de teléfono. |
| Cinco tabs móviles y FAB | Cumple como simulador | Inicio, Facturar, Marketplace, Bóveda y Perfil; acceso rápido a facturar. |
| Listas deslizables, filtros en bottom sheets | No cumple | No se encuentran implementados. |
| Tres roles sobre el mismo estado | Parcial | Se conserva el Context, pero no se aplica acceso por rol de forma consistente. |
| M1: carga/arrastre RUC y OCR de 1,5 s | Mayormente cumple | Carga y drop; temporizadores 400+500+600 ms; perfil mock. Barra visual fija al 75%, no progreso real. |
| M1: perfil y obligaciones esperadas | Parcial | Muestra perfil y obligaciones semestral/anual; no sincroniza esas obligaciones con el calendario. El seed del calendario no contiene renta anual. |
| M2: mes/agenda y alertas | Parcial | Ambas vistas y avisos existen. Mes, día actual, vencimientos y detalles están fijados; calendario no deriva del estado. |
| M3: archivo PFX/P12 y contraseña | Parcial | Formulario presente; archivo y contraseña no condicionan la configuración. |
| M3: vigencia y medidor 14/20 | Parcial | Widgets presentes; días fijos, cupo no aplicado y OCR sobrescribe el contador. |
| M3: vista, firma simulada, hash, sello y estado | Mayormente cumple en web | Modal con representación de documento, hash mock, sello y actualización a FIRMADO. Falta modelar certificado bloqueado/desbloqueado. |
| M4: cuatro tipos de comprobante | No cumple completo | Hay tres opciones; falta Guía de Remisión. Retenciones y notas de crédito se generan y visualizan como factura. |
| M4: cliente, ítems, subtotal, IVA y total | Parcial | Campos e importes reactivos; datos de cliente escritos manualmente, sin selector de clientes. |
| M4: stepper XML → firma → envío → autorizado | Cumple como simulación | Cuatro pasos temporizados, comprobante añadido al Context. |
| M4: RIDE dinámico, QR y clave de 49 dígitos | Parcial | Vista dinámica y generador de clave para nuevas emisiones. QR es icono estático; RIDE ignora el tipo. Descarga PDF solo muestra alert. |
| M5: dropzone PDF/XML y lectura simulada | No cumple el flujo de carga | No hay input de archivo ni manejadores de drop. El botón solo espera y notifica, no crea una compra. |
| M5: gasto / por pagar / inventario | Parcial | Las tres acciones funcionan sobre la compra precargada. Se puede eliminar el pendiente sin elegir acción. |
| M6: publicar, ofertar y aceptar | Mayormente cumple en web | Formularios y cambios compartidos de estado presentes. Feed no restringido a abiertas. |
| M6: comparación de contadores | Parcial | Precio, valoración, opiniones y plazo presentes; no se presenta experiencia ni verificación individual explícita. |
| M6: chat directo y permisos | Parcial | Un chat global con interlocutor fijo y toggles que no controlan acceso. |
| M7: KPI y mapa de alertas | Parcial | Valores solicitados presentes, pero fijos e incoherentes con seis clientes del listado. |
| M7: cliente con sus propios datos bajo autorización | No cumple | Cambia un ID y un indicador; datos y permisos no se seleccionan por cliente. |

## Hallazgos prioritarios

### 1. Alta — Seleccionar cliente no cambia los datos consultados

`src/components/modules/AccountantDashboardModule.tsx:44` guarda `impersonatedClientId` y navega al dashboard. `src/components/layout/WebHeader.tsx:45` usa ese ID para un indicador, pero Dashboard, Bóveda y Facturación siguen utilizando el único perfil y las mismas listas del Context.

**Consecuencia:** “Auditar Cliente” puede mostrar el nombre de una empresa en el encabezado y los comprobantes de EMPRESA DEMO en el contenido. “Volver a mi cartera” solo limpia el ID; no vuelve a la cartera (`WebHeader.tsx:65`).

**Criterio de corrección:** dos clientes de prueba deben mostrar conjuntos distintos de datos y un contexto inequívoco; volver debe restaurar la cartera.

### 2. Alta — Roles y autorizaciones son principalmente visuales

`src/components/layout/WebHeader.tsx:130` cambia el rol sin cambiar `activeTab`. `src/App.tsx:55` renderiza módulos por tab, sin comprobar rol. `WebSidebar.tsx:80` únicamente filtra el menú. Entrar en Super Admin y volver a Contribuyente puede conservar la consola abierta.

`src/components/modules/MarketplaceModule.tsx:284` permite cambiar permisos también desde el rol contador. `clientPermissions` no se consulta en Facturación, Bóveda ni en el cambio de cliente.

**Criterio de corrección:** simular las restricciones en rutas/vistas y operaciones del Context; permisos por cliente y profesional, editables por el contribuyente autorizado. No se requiere un backend para demostrar este comportamiento.

### 3. Alta — Tipos de comprobante incompletos e inconsistentes

`src/components/modules/InvoicingModule.tsx:194` solo ofrece FACTURA, RETENCION y NOTA_CREDITO. `src/context/AppContext.tsx:732` genera siempre prefijo FAC y código de documento '01'. `src/components/common/RideViewerModal.tsx:89` y `:100` presentan siempre FACTURA.

**Consecuencia:** emitir una retención o nota de crédito termina en un RIDE que dice factura. GUIA_REMISION existe en el tipo TypeScript, pero no se puede elegir.

**Criterio de corrección:** los cuatro tipos deben producir una simulación coherente entre selección, registro y vista previa; incorporar los campos mock que distingan cada flujo.

### 4. Alta — Cargar compras deja de ser útil después de la primera

`src/components/modules/PurchaseOcrModule.tsx:38` solo activa un spinner y una notificación. No agrega ni selecciona un nuevo registro. La compra disponible procede del seed (`AppContext.tsx:336`). Tras procesarla se elimina (`AppContext.tsx:859`), y “Simular Carga de Compra” no repone ninguna.

Además, desmarcar las tres acciones y confirmar elimina igualmente la compra pendiente.

**Criterio de corrección:** aceptar archivo o ejemplo, generar compra mock, mostrar extracción, exigir al menos una acción y permitir repetir el flujo.

### 5. Alta — Calendario y obligaciones no comparten una fuente coherente

`src/components/modules/TaxCalendarModule.tsx:124` fija HOY en el día 6; el contexto de esta revisión es 7 de octubre. Día 26, eventos y detalles se escriben a mano. `AppContext.tsx:690` define un recálculo, pero no se llama desde ningún consumidor; además modificaría también la patente municipal. `OnboardingRucModule.tsx:225` muestra IVA semestral Julio/Enero mientras el calendario muestra el primer semestre con vencimiento en octubre. Renta anual no aparece en el seed de obligaciones.

**Criterio de corrección:** fecha de referencia explícita para la demo, obligaciones únicas en el store y vistas derivadas de ellas; al marcar cumplido, mes, agenda y dashboard deben coincidir. Esta observación es de consistencia con la spec, no una validación de normativa tributaria vigente.

### 6. Alta — La experiencia móvil no completa los flujos

`src/components/layout/MobileShell.tsx:311` muestra solicitudes sin publicar, ofertar o aceptar. `:337` muestra documentos sin abrir ni firmar. No hay acceso móvil a OCR de compras, onboarding ni cartera específica de contador. El rol cambia la etiqueta y la identidad al emitir, pero no ofrece los espacios correspondientes.

`src/App.tsx:30` retorna antes del contenedor de toasts: la campana móvil agrega alertas al store, pero no muestra el resultado allí.

**Criterio de corrección:** implementar la plataforma móvil pedida o acordar expresamente reducir el alcance a web responsive. Completar los flujos del simulador no equivale a entregar Expo/React Native.

### 7. Media — La configuración del certificado siempre tiene éxito

`src/components/modules/VaultSignatureModule.tsx:69` pasa solo emisor y fecha. El input PFX no tiene estado ni requisito y `certPass` no se utiliza para decidir el resultado. `AppContext.tsx:803` fija 365 días independientemente de la fecha. `DocumentSignModal.tsx:14` trae contraseña 1234 precargada; no existe estado de desbloqueo y `signDocument` ignora el valor.

**Criterio de corrección:** archivo y contraseña de demo obligatorios, estados mock de error/éxito, vigencia calculada y certificado bloqueado/desbloqueado. No hace falta validar criptografía real.

### 8. Media — El chat no corresponde a la propuesta elegida

`src/components/modules/MarketplaceModule.tsx:256` muestra siempre el mismo chat con Carlos Mendoza. `src/context/AppContext.tsx:917` cambia la oferta aceptada pero no su interlocutor ni conversación. Los mensajes no tienen ID de solicitud. Aceptar otra propuesta conserva el mismo chat.

**Criterio de corrección:** conversación asociada a solicitud y profesional; mostrar nombre, servicio y permiso concedido en ese contexto. Filtrar las oportunidades abiertas y mostrar claramente el estado de cada solicitud.

### 9. Media — Los indicadores mezclan conceptos o contradicen las listas

`src/components/modules/DashboardModule.tsx:26` suma todos los comprobantes como ventas y todo el IVA como cobrado. El seed incluye una retención de $4,38: el KPI inicia en $1.614,38 aunque las dos facturas suman $1.610,00. No filtra mes ni tipo. `MobileShell.tsx:85` repite el problema. La barra del dashboard es fija 85/15 (`DashboardModule.tsx:191`), aunque la etiqueta anuncia una proporción calculada.

`AccountantDashboardModule.tsx:40` fija 12 clientes y el mapa muestra 3/5/4, mientras hay seis registros con distribución 2/2/2. Esto dificulta explicar por qué al seleccionar una alerta aparecen menos resultados.

**Criterio de corrección:** métricas derivadas del conjunto mostrado y su periodo; si se simula un agregado mayor, explicar la paginación o muestra parcial.

### 10. Media — El medidor de bóveda no representa el uso

`src/context/AppContext.tsx:799` limita el número mostrado a 20, pero continúa agregando documentos. El OCR del RUC reemplaza todo el perfil y vuelve a fijar `storageUsed: 15` (`:645`), pudiendo borrar una configuración previa del certificado.

**Criterio de corrección:** conservar configuración independiente, incrementar el uso coherentemente y mostrar la decisión esperada al alcanzar el límite.

### 11. Media — Mensajes de operaciones reales en una simulación

`InvoicingModule.tsx:125` promete autorización oficial; `DashboardModule.tsx:213` dice “Producción (SRI Online)”; `VaultSignatureModule.tsx:87` promete cifrado y validez legal. La descarga PDF únicamente abre un alert (`RideViewerModal.tsx:38`) y el QR es un icono Lucide (`:192`). La spec admite representaciones mock, pero la interfaz debe explicarlas.

**Criterio de corrección:** indicador persistente de “Demo · datos simulados”; mensajes “Emisión simulada completada”, “Vista previa RIDE” y “Marcar como cumplida”. Una acción titulada “Descargar PDF” debería entregar un archivo de muestra o identificarse como simulación.

## Revisión de facilidad de uso

La estructura por módulos, los botones principales, la comparación de tarifas y el stepper proporcionan una base comprensible. No basta para declarar el producto intuitivo: los flujos anteriores pueden detener al usuario o llevarlo a interpretar mal el resultado.

| Problema | Cambio propuesto | Evidencia |
|---|---|---|
| Menú con terminología técnica | “Mi negocio”, “Compras”, “Documentos y firma”, “Buscar contador”, “Mis clientes” | `WebSidebar.tsx:36`, `:42`, `:54`, `:66` |
| Textos de implementación en pantallas | Retirar “MÓDULO 1”, “RBAC”, “Multi-Tenant”, “X.509”, “Web Service” del flujo normal; dejar explicación técnica opcional | Cabeceras de módulos; `MarketplaceModule.tsx:118`; `AccountantDashboardModule.tsx:207` |
| No hay guía inicial | Una secuencia visible: revisar RUC → configurar firma de prueba → emitir comprobante; mantener accesos rápidos posteriores | `DashboardModule.tsx:30` |
| Cambiar rol deja una pantalla anterior | Inicio adecuado por rol, contexto de cliente visible y retorno real a la cartera | `WebHeader.tsx:130`, `:65` |
| Labels y acciones no coinciden | La cartera instruye “Ingresar a Bóveda / Facturas” pero el botón dice “Auditar Cliente” y lleva al dashboard | `AccountantDashboardModule.tsx:176`, `:283`, `:51` |
| Acción “Declarar” marca cumplido inmediatamente | “Marcar como presentada” con contexto del periodo y posibilidad de deshacer | `TaxCalendarModule.tsx:225` |
| Símbolos técnicos sin renderizar | Reemplazar el texto literal `$\rightarrow$` por una flecha o texto natural | `TaxCalendarModule.tsx:94`, `PurchaseOcrModule.tsx:143` |
| Carga demo del RUC potencialmente interceptada | Separar input de archivo del botón de ejemplo: el input invisible ocupa toda la dropzone | `OnboardingRucModule.tsx:82` — requiere comprobar el clic en navegador |
| Navegación sin URL/Historial | Rutas o hash sincronizados; volver del navegador debe volver al módulo anterior; el logo debe ir al inicio real | `WebHeader.tsx:51`, `WebSidebar.tsx:96`, `AppContext.tsx:130` |
| Formularios se desmontan al navegar | Conservar borrador o advertir antes de perder datos | `App.tsx:55`, estados locales de Facturación/Marketplace |
| Web no adapta automáticamente a teléfono | Menú responsive y sin marco de dispositivo en uso real; el modo inicial siempre es desktop | `AppContext.tsx:129`, `WebSidebar.tsx:83`, `MobileShell.tsx:103` |
| Textos pequeños y densos | Revisar visualmente contenido de 9–11 px, zoom 200%, botones táctiles y formularios en ancho 360/390 px | `MobileShell.tsx`, modales de firma/RIDE |

## Accesibilidad detectada en código

- `src/components/common/DocumentSignModal.tsx:35` y `RideViewerModal.tsx:18`: modales sin semántica dialog/aria-modal, gestión de foco, devolución de foco ni cierre con Escape.
- `src/components/modules/InvoicingModule.tsx:212`: labels visibles sin htmlFor/ID; patrón repetido en configuración de firma, Marketplace y móvil.
- `src/components/modules/PurchaseOcrModule.tsx:119` y `MobileShell.tsx:196`: tarjetas clicables hechas con div, sin alternativa de teclado.
- `src/App.tsx:74`: notificaciones sin región aria-live; cierres de toast sin nombre accesible.
- `src/components/modules/MarketplaceModule.tsx:284`: permisos implementados como botones sin comunicar su estado mediante aria-pressed o switch.
- `src/index.css:1`: sin tratamiento de prefers-reduced-motion pese a animaciones pulse/spin repartidas por el producto.

Criterio de referencia: [Web Interface Guidelines de Vercel](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), apartados de accesibilidad, formularios, navegación y movimiento. No se certifica WCAG ni contraste visual con esta revisión estática.

## Orden de corrección recomendado

1. Aislar datos por cliente y aplicar roles/permisos simulados.
2. Completar los cuatro tipos de comprobante y el flujo repetible de compras.
3. Unificar calendario, obligaciones, vigencias y métricas en estado derivado.
4. Asociar chats a servicios contratados y corregir estado de certificado/bóveda.
5. Definir la entrega móvil exigida y completar sus acciones/notificaciones.
6. Simplificar textos, navegación, formularios y accesibilidad.
7. Resolver instalación reproducible y ejecutar una prueba de aceptación visual.

## Pruebas de aceptación pendientes

- Cambiar de los tres roles desde cada módulo; no conservar pantallas que el rol ya no ofrece.
- Elegir dos clientes, comprobar datos distintos; revocar permiso y comprobar acceso bloqueado.
- Emitir los cuatro tipos, revisar encabezado, clave, totales y efecto correspondiente en KPI.
- Cargar, procesar y volver a cargar una compra; no permitir confirmación sin acciones.
- Cargar RUC después de cambiar certificado; conservar firma y uso de bóveda.
- Marcar obligación cumplida y verificar coherencia entre agenda, mes y dashboard.
- Contratar a un contador diferente y verificar conversación y permisos asociados.
- Completar firma y emisión con teclado; verificar foco y lectura de errores.
- Recorrer a 360 px, 390 px, escritorio y zoom 200%; comprobar desbordamiento, toque, modales y navegación.

Estas pruebas constituyen criterios de cierre; no se presentan como ejecutadas.
