# Pruebas

Las pruebas unitarias usan **Jest** y verifican el núcleo del dominio (`src/domain/`) y el controlador,
sin necesidad de abrir el navegador.

## Ejecutar

```bash
npm install
npm test
```

## Organización

| Archivo | Qué prueba |
|---|---|
| `board.test.js` | Creación de tareas, movimiento entre columnas y límite WIP. |

## Convenciones

- Un archivo `*.test.js` por componente.
- Cada regla de negocio debe tener al menos un caso exitoso y uno de error.
- En las siguientes entregas se agregarán pruebas para los comandos (deshacer/rehacer), el notificador y las
  políticas DoR/DoD.
