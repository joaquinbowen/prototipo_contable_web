# Plan de implementación: contadores verificados y gestión sencilla del negocio

> Para ejecución: aplicar `executing-plans` por etapas, con pruebas de las reglas y revisión visual de cada recorrido. Este documento es una propuesta de implementación; no inicia el desarrollo.

**Objetivo:** construir un prototipo completo donde el contador se habilita mediante revisión e entrevista, el cliente contrata y evalúa trabajos, el emprendedor entiende sus números y puede colocar una firma simulada en un PDF.

**Arquitectura:** mantener React, TypeScript y Vite en la web. Separar los nuevos dominios de verificación, contratación, finanzas y documentos del contexto general; persistir datos y archivos de demostración localmente. Usar identidades ficticias estables para recorrer los cuatro roles sin mezclar sus expedientes.

**Tecnologías:** stack actual, Vitest para reglas y persistencia, IndexedDB para archivos y estado nuevo; PDF.js para lectura y pdf-lib para generar copias con sello de demostración. Incorporar las bibliotecas PDF al ejecutar su etapa, comprobando compatibilidad y fijando versiones en el lockfile.

**Fecha:** 11 de octubre de 2026.

**Estado de ejecución, primera iteración:** la web ya tiene registro de contador, expediente con adjuntos locales, gestor/entrevista/aprobación, bloqueo de ofertas, contratos por trabajo, entregas versionadas, mensajes, reseñas, una vista financiera inicial y un firmador PDF de demostración. Continúan pendientes la gestión de varios candidatos e identidades reales dentro de la demo, revisión documental individual, agenda con prevención de choques, permisos por contrato, balance financiero completo, filtros/exportaciones avanzadas, revisión visual interactiva del PDF y paridad Expo. Las secciones siguientes describen el alcance completo que falta cerrar.

## 1. Alcance confirmado y enfoque

- El usuario confirmó expresamente: **todo prototipo**.
- Implementar pantallas y operaciones enlazadas con persistencia local; no solo maquetas aisladas.
- Las entrevistas, decisiones del gestor, avisos y credenciales serán de demostración. No enviar correos ni conectar calendarios o verificadores externos.
- El firmador abrirá un PDF real de prueba, permitirá colocar una marca y descargará una copia. La firma será simulada, sin certificado real ni validez criptográfica.
- No solicitar certificados privados, claves de firma ni antecedentes reales para probar la experiencia. Proporcionar archivos ficticios utilizables.
- No reincorporar el sistema profesional de asientos, libros, bancos y cierres retirado. Los balances del contribuyente serán resúmenes de gestión del negocio con datos y supuestos identificables.
- Conservar facturación, inventario, OCR, calendario y administración existentes, salvo los puntos de integración descritos.
- Supuesto de secuencia: completar primero la web adaptable a móvil. El repositorio Expo independiente tendrá una etapa de paridad; sus datos no se sincronizan con la web en este prototipo.
- No incluir cobros, comisiones reales, videollamadas integradas ni automatización oficial del SRI.

## 2. Diagnóstico de la base actual

| Área | Hallazgo en el código | Consecuencia para el plan |
|---|---|---|
| Acceso | `AccessModule.tsx` registra como contribuyente; el encabezado cambia el rol demo | Ofrecer registro como negocio o contador; gestor solo disponible como identidad demo precreada |
| Roles | `UserRole` contiene contribuyente, contador y superadministrador | Incorporar `GESTOR_CONTADORES` y su navegación propia |
| Perfil profesional | `AppContext.tsx` guarda nombre, licencia, ciudad, especialidades, experiencia y teléfono | Crear expediente estructurado, documentos versionados y estados de verificación |
| Marketplace | `acceptOffer` reemplaza el chat; `sendChatMessage` toma el primer trabajo en proceso | Identificar cada contrato, conversación, permiso y entrega por `contractId` |
| Reputación | `submitMarketplaceOffer` asigna 5 estrellas y 12 reseñas fijas | Calcular reputación desde reseñas vinculadas a trabajos reales de la demo |
| Entregas | `ClientWorkspaceModule.tsx` registra metadatos; el archivo no se conserva | Conservar archivos de prueba y mostrarlos al cliente en el trabajo correspondiente |
| Finanzas | El inicio combina datos locales y comparaciones/periodos fijos | Calcular tarjetas, gráficos, comparación y detalle desde un mismo filtro |
| Firmador | `DocumentSignModal.tsx` dibuja una hoja HTML; `signDocument` genera un hash aleatorio | Sustituir ese recorrido por visor del PDF, posición seleccionable y copia descargable |
| Persistencia | Estado general en `cont-marjo-demo-v2`; archivos no persistidos | Migración versionada y almacenamiento de blobs separado del estado visual |
| Superficies | Web, `MobileShell` web y app Expo contienen recorridos distintos | Verificar las tres superficies, evitando que alguna permita saltar restricciones |

## 3. Experiencia propuesta por rol

### Contribuyente

Inicio con las preguntas «¿Cuánto vendí?», «¿Cuánto gasté?», «¿Cuánto me queda?» y «¿Cuánto necesito vender para cubrir mis costos?». Accesos a **Mi negocio**, **Ventas**, **Gastos**, **Inventario**, **Servicios contables**, **Documentos y firma**, **Calendario** y **Perfil**; mantener pocos accesos principales y agrupar opciones secundarias.

Servicios contables se divide en **Solicitudes**, **Trabajos en curso** e **Historial**. Cada trabajo muestra contador, alcance acordado, precio, fecha comprometida, estado y siguiente acción. Detalle con **Resumen**, **Entregas**, **Mensajes** e **Historial de actividad**.

### Contador candidato

Registro normal → completar perfil profesional → adjuntar respaldos → enviar expediente → agendar entrevista → asistir → recibir decisión. Inicio centrado en el progreso y el siguiente paso. Puede corregir su expediente y consultar su entrevista; no puede ofrecer servicios ni abrir información de clientes.

### Contador verificado

Acceso a **Resumen**, **Oportunidades**, **Mis propuestas**, **Mis trabajos**, **Clientes** y **Perfil profesional**. La insignia expresa aprobación por la plataforma en esta demo. Verificación y calificación son conceptos separados: un recién aprobado puede tener cero reseñas.

### Gestor de contadores

Nuevo rol `GESTOR_CONTADORES` con **Solicitudes de verificación**, **Agenda**, **Contadores** y **Historial de decisiones**. Revisa respaldos, solicita correcciones, ofrece horarios, registra entrevista y decide aprobación o rechazo. Solo ve el expediente necesario para esa tarea; no obtiene acceso automático a la información financiera de clientes.

### Superadministrador

Conserva sus vistas existentes. Puede configurar las identidades ficticias del gestor y ver indicadores de verificación. El selector de roles permanece identificado como una herramienta de demostración, separado del registro público.

## 4. Expediente, entrevista y aprobación

### Perfil profundo

- Identidad y contacto: nombres, identificación/RUC, ciudad, teléfono, correo y presentación.
- Formación: título, institución, año y respaldo documental.
- Certificaciones: nombre, emisor, fecha y archivo; listado vacío explícito si no tiene certificaciones.
- Experiencia: empresas o proyectos, cargo, fechas, funciones y especialidades; permitir declarar que inicia su carrera.
- CV, título y récord policial como documentos de la lista de revisión solicitada; en la demo todos podrán cargarse desde ejemplos ficticios.
- Servicios ofrecidos, disponibilidad y descripción profesional pública.
- CV y respaldos privados para candidato y gestor; el perfil público solo contiene presentación, formación resumida, experiencia, servicios, insignia y reseñas.

### Estados y reglas

`BORRADOR → EN_REVISION → HABILITADO_PARA_ENTREVISTA → ENTREVISTA_AGENDADA → PENDIENTE_DECISION → VERIFICADO`

Ramas: `EN_REVISION → REQUIERE_CAMBIOS → EN_REVISION`; después de entrevista, `PENDIENTE_DECISION → RECHAZADO`. Una nueva postulación conserva el historial de la anterior. Proponer también `VERIFICADO → SUSPENDIDO` con motivo, para demostrar el control posterior del gestor.

- Enviar requiere los campos obligatorios y respaldos; el progreso explica qué falta.
- El gestor revisa cada documento: pendiente, conforme u observado, con observación visible para el candidato. Revisar documentos no aprueba al contador por sí solo.
- El candidato elige un horario disponible del gestor tras la revisión inicial. El gestor puede agendar en su nombre. Reservas incompatibles se rechazan.
- Cancelar o reprogramar conserva el evento previo; una ausencia no cuenta como entrevista completada.
- Registrar entrevista exige asistencia, evaluación y nota. Aprobar exige documentos conformes, entrevista completada y decisión del gestor.
- Solo `VERIFICADO` permite presentar propuestas o iniciar servicios. La regla se aplica también en las funciones de dominio, no únicamente en botones.
- Editar identidad, título o respaldos esenciales de un verificado genera solicitud de revisión; conserva la versión aprobada hasta decisión del gestor. Una suspensión bloquea nuevas propuestas y contratos; los trabajos existentes siguen visibles y se marcan para gestión, sin desaparecer.
- Cada cambio registra quién, cuándo, expediente/versiones involucradas y motivo. Una decisión incompatible con una revisión más reciente se rechaza.

### Agenda de demostración

Intervalos de 30 minutos, zona visible `America/Guayaquil`, fecha almacenada como instante UTC. Horarios ficticios generados desde una fecha base de demo configurable. Sin enlaces reales a reuniones: mostrar ubicación o enlace de ejemplo claramente identificado.

## 5. Marketplace, entregas, historial y estrellas

### Solicitar y contratar

1. Elegir ayuda con frases comprensibles: «Declarar mis impuestos», «Ordenar mis cuentas», «Revisar mi negocio».
2. Describir necesidad, periodo, fecha deseada y presupuesto; ofrecer ejemplos y adjuntos opcionales.
3. Revisar y publicar. Mostrar solicitudes sin propuestas, con propuestas y contratadas.
4. Comparar profesionales: verificación, especialidades, experiencia, estrellas con número de opiniones, precio, plazo y entregables.
5. Aceptar una propuesta y crear un contrato con una copia del alcance, importe y plazo aceptados. Modificaciones posteriores al perfil o propuesta no alteran ese acuerdo.

### Trabajo y entrega

`EN_CURSO → ENTREGADO → COMPLETADO`

Correcciones: `ENTREGADO → CAMBIOS_SOLICITADOS → ENTREGADO`, creando una nueva versión de entrega. Cancelación conserva el trabajo y sus eventos en el historial, con motivo.

- Cada entrega contiene archivos descargables, nota, versión, autor y fecha. El cliente puede abrirlos, aceptar o solicitar cambios con motivo.
- Propuesta de cierre: **Aceptar entrega y calificar**. Con ello la calificación sucede después de que el contador entrega, como pidió el usuario, y queda ligada al trabajo recibido. Permitir aceptar sin calificar y hacerlo después.
- Una reseña por contrato completado, de su cliente al contador contratado: estrellas enteras de 1 a 5 y comentario opcional. Doble clic no genera dos reseñas.
- Reputación = media de reseñas válidas, mostrada con un decimal y su cantidad; sin reseñas, mostrar «Aún sin calificaciones». No mezclar estrellas con la aprobación del gestor.
- Todas las propuestas y el perfil leen la reputación actual del mismo contador, sin cifras copiadas de forma permanente.
- Conversación, adjuntos y permisos separados por contrato. El contribuyente concede y revoca permisos; el contador solo consulta los concedidos.
- Historial con contratación, cambios de alcance si se acuerdan, mensajes, entregas, solicitudes de corrección, aceptación y valoración. No reemplazarlo al aceptar otro servicio.
- Filtros: búsqueda, estado, servicio, profesional/cliente y fecha de contratación; etiquetas visibles, limpiar filtros y estados vacíos accionables.
- El detalle siempre abre el trabajo seleccionado. Evitar inferirlo del primer registro en proceso.

## 6. Finanzas para emprendedores y pymes

### Pantallas

| Vista | Contenido y lenguaje |
|---|---|
| Resumen | Ventas, costos y gastos, resultado estimado, cobros/pagos y comparación con periodo anterior |
| Ventas | Evolución, clientes/productos principales, documentos y cobros relacionados |
| Gastos | Categorías, proveedores, costos fijos/variables y documentos relacionados |
| Punto de equilibrio | «Necesitas vender X para cubrir tus costos»; progreso real y simulador de escenarios separado |
| Balances | «Lo que tienes», «Lo que debes», «Patrimonio» y resultado del periodo con detalle y nivel de completitud |

Cada tarjeta explica «Qué significa», «Cómo se calcula» y «Ver movimientos». El detalle conserva filtros y permite volver al mismo contexto. Los gráficos acompañan cifras y tablas, sin depender solo del color.

### Datos necesarios antes de construir gráficos

Las facturas y gastos actuales no bastan para inferir un balance completo. Añadir registros demo con organización, fecha, tipo, importe en centavos, categoría, origen, contraparte y estado; cobros y pagos separados; saldos iniciales de caja, bancos, cuentas por cobrar, inventario, activos, cuentas por pagar, deudas y patrimonio.

- Cada documento tiene un identificador de origen para evitar contar dos veces la compra OCR, su gasto y su pago.
- Facturar y cobrar son eventos distintos; comprar inventario y reconocer su costo de venta también.
- La salida de inventario vinculada a una venta registra costo histórico. No usar el costo promedio actual para reescribir ventas pasadas.
- Movimientos con datos incompletos se señalan. No convertir importes desconocidos en cero ni inventar patrimonio para cuadrar.
- Proporcionar un negocio de servicios y otro comercial con saldos y operaciones ficticios coherentes en varios meses.

### Definiciones del prototipo

Estas son reglas del modelo de gestión propuesto, no un cálculo tributario oficial:

- Ventas netas: bases de ventas confirmadas menos devoluciones/notas de crédito, más ajustes de venta aplicables; excluir borradores, documentos rechazados y documentos que no representan ventas. Impuestos mostrados por separado.
- Costos y gastos: costo de lo vendido más gastos del periodo; no toda compra de inventario se trata como gasto inmediato.
- Resultado estimado: ventas netas − costo de ventas − gastos del periodo. Etiquetar como estimado y explicar las categorías incluidas.
- Flujo de caja: cobros − pagos en sus fechas efectivas. Mostrar saldo inicial y final por separado del resultado.
- Margen de contribución: `(ventas − costos variables) / ventas`.
- Punto de equilibrio monetario: `costos fijos / margen de contribución`; si ventas son cero o el margen no es positivo, mostrar «No calculable con estos datos» y explicar lo que falta. Si costos fijos son cero y el margen es positivo, el umbral es cero.
- Balance a una fecha: activos = pasivos + patrimonio. Exponer diferencia de conciliación si los registros no cuadran; para balance incompleto mostrar las partidas faltantes.
- Comparación porcentual: `(actual − anterior) / abs(anterior) × 100`; si anterior es cero, mostrar diferencia monetaria y «Sin base comparable». Para pérdidas/resultados, priorizar cambio monetario y explicar el signo.
- Utilizar centavos y reglas de redondeo explícitas; no acumular importes mediante aritmética flotante sin control.

### Filtros

Filtro común: negocio, este mes, mes anterior, trimestre, año o rango personalizado; fechas inclusivas y zona del negocio. Ventas: cliente, producto/categoría, estado y canal cuando exista. Gastos: categoría, proveedor, fijo/variable y estado de pago. Balance: **al día** seleccionado, sin aplicar erróneamente un rango a saldos acumulados.

Los filtros por producto/cliente no recalculan balances globales ni un equilibrio global con solo parte de los costos: indicar qué filtros aplican a cada vista. Exportar CSV y un resumen PDF con título, filtros, fecha y marca de demostración. Los escenarios «¿Qué pasa si…?» no modifican los registros reales de la demo.

## 7. Firmador PDF del contribuyente

Recorrido: **Cargar PDF → revisar páginas → colocar firma → previsualizar → simular firma → descargar o guardar copia**.

- Leer el archivo elegido, mostrar miniaturas, página actual, total, zoom y navegación. Cargar páginas de forma progresiva.
- Elegir cualquier página; colocar, mover y redimensionar un sello mediante ratón, tacto o controles de posición accesibles. Permitir quitarlo y volver a colocarlo.
- Guardar la posición en coordenadas del PDF, no en píxeles de pantalla; respetar tamaño, orientación, rotación y área visible de página.
- MVP: una marca por operación, en la página elegida. No es necesario firmar todas las páginas para completar el recorrido solicitado.
- Sello: nombre del firmante demo, fecha y «FIRMA SIMULADA · SIN VALIDEZ CRIPTOGRÁFICA».
- Generar una copia PDF con el sello visible y conservar el original. Nombre sugerido: `<nombre>-firma-demo.pdf`.
- Historial por documento: original, copia, página, posición, actor y fecha. Descarga y reapertura muestran la misma posición.
- Estados de error: PDF corrupto, cifrado/no compatible, archivo demasiado grande, página inválida y fallo de almacenamiento. Mensajes específicos con opción de elegir otro archivo.
- Límites iniciales del prototipo: 20 MB y 100 páginas; informar antes de cargar. Los respaldos del expediente usan 10 MB por archivo, PDF/JPG/PNG. CV y título pueden usar PDF de ejemplo.
- No mostrar «certificado validado» ni generar hashes aleatorios como evidencia de una firma. No pedir contraseña real de PFX.
- El visor y la colocación son funcionales; la marca no implementa firma criptográfica. Para una etapa futura real habría que definir un mecanismo separado, fuera de este alcance.

## 8. Modelo y límites de responsabilidad

| Entidad | Relaciones y datos principales |
|---|---|
| DemoIdentity | ID estable, rol, organización o perfil profesional |
| AccountantProfile | Datos públicos, especialidades, experiencia estructurada |
| VerificationApplication | Contador, versión, estado, documentos y gestor asignado |
| CredentialDocument | Archivo, categoría, versión, revisión y observación |
| Interview | Expediente, gestor, inicio UTC, duración, estado y evaluación |
| VerificationDecision | Actor, versión del expediente, decisión, motivo y fecha |
| ServiceRequest / Proposal | Cliente, necesidad; contador, precio, plazo y entregables |
| ServiceContract | Solicitud, propuesta aceptada, partes, alcance congelado y estado |
| ContractMessage / AccessGrant | Contrato, actor, mensaje o alcance del permiso |
| Delivery / ServiceReview | Contrato, versión y archivos; cliente, contador, estrellas |
| ActivityEvent | Entidad, acción, actor, fecha y referencia de versión |
| BusinessTransaction / OpeningBalance | Negocio, origen, fecha, importes y clasificación financiera |
| DemoFile / SignatureDraft | Blob y metadatos; documento, página y rectángulo de marca |

Identificadores UUID, claves estables y timestamps ISO. Separar expediente privado del perfil público mediante selectores explícitos. Las reglas locales simulan permisos y no constituyen autenticación real.

### Estructura de archivos propuesta

Todos los siguientes paths son relativos a `web/`:

- `src/features/demo/{types.ts,DemoSessionContext.tsx,demoRepository.ts,demoFiles.ts,migrateV2.ts,seed.ts}`: identidades, repositorio local, archivos y migración.
- `src/features/verification/{types.ts,verificationRules.ts,VerificationContext.tsx,ProfessionalOnboarding.tsx,VerificationStatus.tsx,ManagerInbox.tsx,ApplicationDetail.tsx,InterviewAgenda.tsx}`.
- `src/features/marketplace/{types.ts,contractRules.ts,rating.ts,MarketplaceContext.tsx,RequestWizard.tsx,ProposalComparison.tsx,WorkList.tsx,WorkDetail.tsx,DeliveryPanel.tsx,ReviewForm.tsx,ContractChat.tsx,ActivityTimeline.tsx}`.
- `src/features/finance/{types.ts,transactionAdapter.ts,metrics.ts,breakEven.ts,balance.ts,FinanceFilters.tsx,BusinessOverview.tsx,SalesReport.tsx,ExpenseReport.tsx,BreakEvenSimulator.tsx,BalanceReport.tsx,reportExport.ts}`.
- `src/features/signing/{types.ts,pdfCoordinates.ts,pdfStamp.ts,PdfViewer.tsx,SignaturePlacement.tsx,SigningWorkspace.tsx}`.
- Pruebas junto a cada archivo de reglas (`*.test.ts`); casos de uso entre dominios en `src/features/demo/demoJourney.test.ts`.

Modificar los puntos existentes: `src/types/index.ts`, `src/context/AppContext.tsx`, `src/App.tsx`, `src/components/layout/{WebHeader,WebSidebar,ContextBar,MobileShell}.tsx`, y módulos `AccessModule`, `ProfileModule`, `AccountantDashboardModule`, `MarketplaceModule`, `ClientWorkspaceModule`, `DashboardModule`, `VaultSignatureModule`, además de `DocumentSignModal`.

Los componentes antiguos quedan como adaptadores cuando sea útil; extraer únicamente la lógica afectada. No crear un segundo marketplace paralelo ni mantener dos fuentes de reputación.

## 9. Implementación por entregables

### Etapa 1 — Base local, identidades y navegación

**Archivos:** feature `demo`, `src/types/index.ts`, `AppContext.tsx`, `App.tsx` y componentes de acceso/navegación señalados arriba.

- [ ] Crear identidades de contribuyente, candidato, verificado, gestor y superadministrador. Cambiar de identidad conserva el estado de las otras.
- [ ] Incorporar `GESTOR_CONTADORES`, registro contribuyente/contador y aterrizaje correcto por rol y estado.
- [ ] Crear repositorio IndexedDB versionado con lecturas/escrituras atómicas por operación, metadatos y blobs; capturar cuota excedida sin anunciar guardado exitoso.
- [ ] Migrar `cont-marjo-demo-v2` sin perder facturas/inventario; mapear reputación de muestra a reseñas ficticias explícitas, sin inventar reseñas del candidato nuevo.
- [ ] El chat viejo sin vínculo fiable se conserva como conversación heredada de solo lectura; no asignarlo arbitrariamente a todos los contratos. Evidencias sin archivo indican «Archivo no disponible».
- [ ] Probar migración repetida, recarga, reset total, almacenamiento no disponible y cambio de rol sin contaminación de datos.

**Aceptación:** se puede recorrer los cuatro roles y volver al candidato sin perder su avance. Aplicar la migración dos veces no duplica contratos, reseñas ni archivos.

### Etapa 2 — Perfil profundo del candidato

**Archivos:** `verification/types.ts`, `verificationRules.ts`, `VerificationContext.tsx`, `ProfessionalOnboarding.tsx`, `VerificationStatus.tsx`, `ProfileModule.tsx`.

- [ ] Crear formulario por pasos: identidad, formación, experiencia, documentos, servicios y revisión final.
- [ ] Guardar borrador y progreso; cargar/abrir/reemplazar respaldos con versiones. Añadir botón «Usar documentos de ejemplo».
- [ ] Implementar envío y corrección con estados y validaciones descritos en la sección 4.
- [ ] Probar candidato sin título adjunto, expediente completo, archivo inválido, corrección de observación y recarga a mitad del formulario.

**Aceptación:** el candidato sabe qué falta y puede enviar; aún no puede ofertar. Su récord policial nunca aparece en el perfil público.

### Etapa 3 — Gestor, agenda y verificación

**Archivos:** `ManagerInbox.tsx`, `ApplicationDetail.tsx`, `InterviewAgenda.tsx`, reglas/contexto de verificación y dashboard profesional.

- [ ] Bandeja con filtros por estado, fecha de solicitud, candidato y gestor; detalle documental y lista de revisión.
- [ ] Solicitar cambios, habilitar entrevista, reservar/reprogramar/cancelar turno y registrar asistencia/evaluación.
- [ ] Aprobar/rechazar con motivo; registrar historial y avisos locales para el candidato.
- [ ] Bloquear propuesta/contratación cuando no esté verificado, incluso invocando la función directamente. La suspensión también se comprueba al aceptar una oferta previa.
- [ ] Probar doble reserva, ausencia, aprobación sin entrevista, decisión sobre versión antigua y aprobación válida.

**Aceptación:** al aprobar desde el gestor, el candidato ve su insignia y obtiene acceso a oportunidades; antes de eso está bloqueado.

### Etapa 4 — Solicitudes, propuestas y contrato independiente

**Archivos:** feature `marketplace` (tipos, reglas, contexto, wizard, comparación, lista/detalle y chat); adaptadores de `MarketplaceModule.tsx` y `AppContext.tsx`.

- [ ] Wizard de solicitud, tarjetas y comparación de propuestas con perfil y reputación derivados.
- [ ] Crear contrato al aceptar, rechazar aceptación duplicada y congelar alcance/precio/plazo.
- [ ] Separar mensajes, adjuntos y permisos por contrato; dejar de usar el primer trabajo activo.
- [ ] Implementar listas, búsqueda, filtros y siguiente acción para cada estado; conservar selección al volver del detalle.
- [ ] Probar dos trabajos simultáneos con clientes/contadores distintos, autorización por participante y revocación de permiso.

**Aceptación:** contratar un segundo servicio no modifica el chat ni los archivos del primero.

### Etapa 5 — Entregas, historial y valoración

**Archivos:** `DeliveryPanel.tsx`, `ReviewForm.tsx`, `ActivityTimeline.tsx`, `rating.ts`, reglas de contrato y `ClientWorkspaceModule.tsx`.

- [ ] Subir entrega versionada, previsualizar/descargar, pedir corrección y volver a entregar.
- [ ] Aceptar entrega, completar contrato y ofrecer estrellas; permitir omitir la reseña y añadirla luego.
- [ ] Validar autor, relación con contrato, trabajo completado, rango 1–5 y unicidad por contrato.
- [ ] Actualizar media y cantidad en perfil, tarjetas y propuestas; conservar todo en historial con filtros.
- [ ] Probar reseña prematura, cliente ajeno, doble envío y promedio correcto; comprobar descarga de versión anterior.

**Aceptación:** una entrega corregida conserva ambas versiones; al evaluar con 4 estrellas un profesional sin reseñas muestra 4,0 y una opinión tras recargar.

### Etapa 6 — Datos financieros y cálculos verificables

**Archivos:** `finance/types.ts`, `transactionAdapter.ts`, `metrics.ts`, `breakEven.ts`, `balance.ts`, seeds demo e integraciones de facturas/compras/inventario.

- [ ] Definir registros de venta, cobro, pago, compra, costo de venta, gasto, saldos y ajustes, con origen único e importes en centavos.
- [ ] Incorporar clasificación fijo/variable y registrar costo histórico por salida; evitar duplicar gasto con pago o inventario con costo.
- [ ] Implementar fórmulas, filtros de fechas y estados, niveles de completitud y comparaciones de la sección 6.
- [ ] Crear escenarios coherentes para servicios y comercio, incluyendo mes sin ventas y margen negativo.
- [ ] Probar cálculos con ejemplos de aceptación abajo antes de conectar tarjetas.

**Aceptación:** cada indicador puede reconstruirse desde sus movimientos; ningún saldo faltante se presenta como cero confirmado.

### Etapa 7 — Interfaz financiera sencilla

**Archivos:** vistas/filtros/exportación de `finance`, `DashboardModule.tsx`, navegación y enlaces de ventas/gastos.

- [ ] Implementar resumen con 4–6 indicadores prioritarios, explicaciones cortas y acciones «Ver detalle».
- [ ] Crear ventas, gastos, equilibrio y balance; filtros pertinentes, comparación y chips del contexto seleccionado.
- [ ] Simulador de equilibrio con costos fijos y proporción variable editables, sin modificar registros.
- [ ] Exportar los mismos datos filtrados a CSV y resumen PDF; marcar información incompleta.
- [ ] Recorrer por teclado y en 360/390 px; probar ausencia de datos, limpieza de filtros y navegación de ida/vuelta.

**Aceptación:** al cambiar de mes, tarjetas, gráfico, detalle y exportación coinciden; el balance usa su fecha de corte visible.

### Etapa 8 — Visor y firma simulada de PDF

**Archivos:** feature `signing`, `demoFiles.ts`, `DocumentSignModal.tsx`, `VaultSignatureModule.tsx`, perfil/bóveda y dependencias del paquete.

- [ ] Incorporar PDF.js y pdf-lib con carga diferida y worker local. Crear PDF demo de varias páginas y orientaciones.
- [ ] Implementar carga, miniaturas, navegación, zoom y errores de archivo.
- [ ] Implementar rectángulo de firma con transformaciones de coordenadas, límites de página y alternativa de controles al arrastre.
- [ ] Exportar copia marcada, guardarla en bóveda y conservar original e historial. Liberar object URLs al cerrar.
- [ ] Probar páginas 1/intermedia/última, zoom 50/100/200 %, rotación 0/90/180/270 grados y páginas de tamaños distintos.
- [ ] Reabrir la copia y revisar visualmente que la marca está en la página/posición elegida y que las demás páginas se conservan.

**Aceptación:** el contribuyente coloca una firma demo en la página 3, descarga la copia y ve esa misma marca al abrirla fuera del visor.

### Etapa 9 — Paridad móvil y revisión integral

**Web adaptable:** actualizar `MobileShell.tsx` para reutilizar los nuevos recorridos/reglas, sin una ruta antigua que salte verificación o contratos.

**Expo:** modificar `mobile/src/state/{types,AppState,navigation}.ts(x)`, `screens/{AuthScreen,ProfileScreen,AccountantScreens,ContributorScreens}.tsx` y `app/(tabs)/_layout.tsx`; añadir `screens/ManagerScreens.tsx`, rutas `verification.tsx`, `interviews.tsx`, `work-detail.tsx`, `finances.tsx`, `signing.tsx` y un adaptador de persistencia local propio. Las rutas solo contienen composición de pantallas.

- [ ] Consultar documentación de la versión instalada de Expo antes de tocar APIs, siguiendo `mobile/AGENTS.md`.
- [ ] Replicar contratos de datos y escenarios de prueba; no importar componentes DOM en React Native.
- [ ] Probar primero en desarrollo Expo el visor táctil y archivos; seleccionar adaptador de visor/exportación compatible con la versión instalada. No dar por cubierta la app nativa con el modo móvil web.
- [ ] Confirmar almacenamiento de borradores y archivos, rol gestor, entregas, reseñas y filtros en la app; mantener aviso de que son demos locales independientes.
- [ ] Ejecutar recorridos completos por rol, reglas negativas, recarga y reset. Revisar accesibilidad, estados de carga y errores.

**Aceptación:** cada superficie declarada terminada permite el mismo recorrido funcional. No anunciar sincronización entre repositorios/dispositivos.

## 10. Casos de aceptación concretos

| Caso | Entrada/acción | Resultado esperado |
|---|---|---|
| Verificación | Expediente completo, sin entrevista; intentar aprobar | Rechazo de la acción y explicación |
| Habilitación | Entrevista completada y aprobación del gestor | Estado verificado; puede enviar propuesta |
| Acceso | Candidato invoca envío de oferta directamente | Regla rechaza; no se crea oferta |
| Agenda | Dos candidatos reservan el mismo intervalo del gestor | Solo una reserva vigente |
| Aislamiento | Contratos A y B; mensaje/archivo en A | B no muestra esos datos |
| Entrega | Cliente pide cambio a v1; contador sube v2 | Ambas versiones y sus fechas permanecen |
| Reseña | Tres reseñas de 5, 4 y 3 | Media 4,0; tres opiniones |
| Reseña duplicada | Reenviar valoración del mismo contrato | Sigue existiendo una sola reseña |
| Ventas | Venta base 1.000 e impuesto 150; devolución base 100 | Ventas netas 900; impuesto no se suma a ventas |
| Equilibrio | Costos fijos 600, ventas 2.000, variables 800 | Margen 60 %; equilibrio 1.000 |
| Caja vs resultado | Venta confirmada 1.000, cobrada 400 | Ventas 1.000; cobros 400; pendiente 600 |
| Inventario | Compra 300, solo se vende mercancía con costo 100 | Costo de ventas 100; existencias restantes 200 |
| Balance | Activos 5.000, pasivos 2.000, patrimonio 3.000 | Cuadra; si falta un saldo, informa incompleto |
| Firma | Marca en página 3 con zoom 200 % | Copia conserva marca en página 3 y posición documental |
| Persistencia | Recargar tras aprobación/entrega/reseña | Estados, archivos y calificación se conservan |

Pruebas de dominio con Vitest; comprobación de tipos y build; revisión interactiva de recorridos y PDFs. Comandos web: `pnpm test`, `pnpm lint`, `pnpm build`. Comandos Expo: `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build:web`; exportación web no reemplaza la prueba en dispositivo o emulador.

## 11. Orden recomendado y definición de terminado

**Primero etapas 1–3:** registro → expediente → entrevista → aprobación del gestor. Es la puerta de entrada del nuevo modelo de negocio.

**Después etapas 4–5:** contratar → trabajar → entregar → corregir/aceptar → calificar. Fin de un recorrido completo entre contador y cliente.

**Después etapas 6–7:** base de datos financiera consistente → pantallas comprensibles. **Después etapa 8:** PDF real con firma simulada. La paridad Expo se cierra en la etapa 9, después de estabilizar las reglas web.

Cada etapa termina con sus criterios comprobados, cambios revisables y una demostración del recorrido; la implementación no debe sustituir reglas por cifras fijas o botones sin efecto. No se requiere un backend para completar este alcance.

## 12. Fuentes técnicas consultadas

- [PDF.js: ejemplos oficiales](https://github.com/mozilla/pdf.js/blob/master/docs/contents/examples/index.md): lectura/renderizado y transformaciones de escala, rotación y coordenadas.
- [pdf-lib: PDFDocument](https://pdf-lib.js.org/docs/api/classes/pdfdocument): carga y guardado de un PDF existente.
- [pdf-lib: PDFPage](https://pdf-lib.js.org/docs/api/classes/pdfpage): dibujo del sello visible en la página seleccionada.

La elección propuesta es usar PDF.js para la visualización y pdf-lib para la copia marcada. No se implementará firma criptográfica dentro de este prototipo.
