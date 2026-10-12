# CONT MARJO · Web

Aplicación web de demostración para contribuyentes, contadores, gestores de contadores y superadministración.

## Requisitos

- Node.js LTS
- pnpm 10+

## Desarrollo

```powershell
pnpm install
pnpm dev
```

## Validación

```powershell
pnpm lint
pnpm test
pnpm build
```

Las operaciones de SRI, OCR, firma digital y persistencia son simulaciones locales; esta app no transmite documentos ni credenciales a esos servicios.

## Recorrido de demostración

1. Registra una cuenta de **Contador**. Completa **Mi verificación** y adjunta PDF/JPG/PNG ficticios (máximo 10 MB por archivo). Los archivos quedan en IndexedDB de este navegador.
2. Desde el selector **Demo** del encabezado, entra como **Gestor de contadores**. Revisa el expediente, habilita la entrevista, vuelve al contador para escoger fecha y regresa al gestor para registrar el resultado y aprobar.
3. El contador aprobado puede enviar una propuesta desde **Oportunidades**. Entra como contribuyente, acepta esa propuesta y abre **Mis trabajos**. Las propuestas antiguas de profesionales ilustrativos se muestran para comparar, pero no generan un trabajo interactivo.
4. Alterna entre contador y contribuyente para entregar un archivo, pedir cambios, aceptar la entrega y calificar con estrellas. Cada trabajo conserva sus mensajes y versiones.
5. Como contribuyente, abre **Mi negocio** para consultar los resúmenes estimados y **Firmar PDF** para colocar una marca de demostración en cualquier página y descargar una copia.

El balance financiero muestra la información disponible y señala los saldos faltantes. La marca sobre PDF es visible y descargable, pero no es una firma criptográfica. La app Expo independiente aún no comparte estos flujos.
