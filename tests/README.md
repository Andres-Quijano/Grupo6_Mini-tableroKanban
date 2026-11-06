# Pruebas

Las pruebas usan **Jest** y verifican el dominio, los dos patrones de diseño y el controlador sin necesidad de abrir
el navegador.

## Ejecutar

```bash
npm install
npm test                # ejecuta todas las pruebas
npm run test:coverage   # además muestra el porcentaje de código cubierto
```

## Organización

| Archivo | Qué prueba |
|---|---|
| `task.test.js` | Validación de datos de la tarea, edición y checklists DoR/DoD. |
| `board.test.js` | Flujo del tablero, límite WIP configurable, intercambio de políticas y eventos publicados. |
| `eventBus.test.js` | Patrón **Observer**: suscribir, publicar, cancelar, comodín `*` y aislamiento de errores. |
| `policies.test.js` | Patrón **Strategy**: cada política por separado y creación de una política nueva. |
| `controller.test.js` | Traducción de errores del dominio a resultados para la vista. |
| `utils.test.js` | `escapeHtml` y carga de los datos de ejemplo a través de las políticas. |
| `helpers.js` | Funciones compartidas por las pruebas (no es un archivo de pruebas). |

## Convenciones

- Un archivo `*.test.js` por componente.
- Cada regla de negocio tiene al menos un caso exitoso y uno de error.
- Los nombres de las pruebas describen el comportamiento esperado en español.

El último resultado está en [`docs/evidencias/entrega2/resultado_pruebas.md`](../docs/evidencias/entrega2/resultado_pruebas.md).
