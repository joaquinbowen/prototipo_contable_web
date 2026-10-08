# CONT MARJO: separación web y aplicación móvil

## Objetivo

Dejar la aplicación web actual como proyecto autónomo dentro de `web/` y crear en `mobile/` una aplicación React Native con Expo, visualmente coherente y funcionalmente alineada con la experiencia aprobada de CONT MARJO. Cada aplicación tiene su propio repositorio Git y utiliza pnpm.

## Decisiones de arquitectura

- `web/` conserva React, Vite, TypeScript, Tailwind y los módulos existentes; su estado de demostración y apariencia aprobada se preservan.
- `mobile/` es una aplicación TypeScript con Expo Router, navegación nativa y controles adaptados a teléfono. No se importa ni se renderiza la app web dentro de una WebView.
- Cada carpeta mantiene un `package.json`, `pnpm-lock.yaml`, `.gitignore` y `.git` independiente. No se configura un monorepo ni paquetes compartidos en esta etapa.
- La app móvil reproduce los roles de contribuyente, contador y superadministrador; acceso y registro; inicio; emisión guiada; historial; perfil/firma/bóveda; compras/OCR e inventario; calendario; marketplace; cartera/expedientes y evidencia; administración. Las operaciones de SRI, OCR y persistencia externa continúan etiquetadas como demostraciones.
- Los dos repos quedan localmente inicializados y listos para enlazar a GitHub. No se crea un remoto hasta iniciar sesión y confirmar el propietario/visibilidad del destino.

## Diseño móvil

Se conserva la identidad azul petróleo y pizarra atenuada, tipografía clara, jerarquía de tarjetas y lenguaje de interfaz de la web. La navegación lateral se convierte en navegación inferior para las áreas principales, y las tareas secundarias usan listas o acciones contextuales. Formularios y tablas se transforman en pasos y tarjetas de lectura móvil; selección de documento se mantiene dentro de “Nuevo”. El contenido evita desplazamiento horizontal y respeta áreas seguras, teclado, estados vacíos y etiquetas de simulación.

## Validación

- Instalar y verificar cada proyecto por separado con pnpm.
- Ejecutar chequeos TypeScript y build web.
- Ejecutar `expo-doctor` y pruebas de arranque/build estático de la app móvil según las capacidades del entorno.
- Revisar navegación y pantallas móviles con Expo web/browser cuando esté disponible y verificar los proyectos Android/iOS generados por Expo.
- Inicializar y verificar que cada carpeta tenga una raíz Git independiente, sin incluir dependencias, secretos ni artefactos de build.

## Límites

Esta entrega crea repositorios locales separados. La creación/publicación de repos remotos requiere autenticación GitHub y propietario/visibilidad confirmados. El prototipo sigue siendo local y demostrativo: no se conecta a servicios productivos de SRI, OCR, firma ni almacenamiento.
