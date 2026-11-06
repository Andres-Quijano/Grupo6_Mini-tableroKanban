# Verificación manual en el navegador — Entrega 2

Ejecución con `npm start` y `http://localhost:3000`. Cada caso se hizo sobre el tablero recién cargado con las
tareas de ejemplo.

| # | Caso | Resultado esperado | Patrón ||
|---|---|---|---|---|
| 1 | Pulsar `→` en "#3 Definir checklist DoD" con la DoR incompleta | La tarea no se mueve; aparece *Bloqueado [Definición de Listo]* con los ítems que faltan | Strategy + Observer | 
| 2 | Marcar los ítems pendientes de la DoR de #3 y pulsar `→` | La tarea pasa a "En curso" y se notifica el movimiento | Strategy + Observer | 
| 3 | Pulsar `→` en "#1" (Revisión) con la DoD incompleta | Bloqueado por *Definición de Hecho* | Strategy |
| 4 | Enviar el formulario sin título | Mensaje *"La tarea debe tener un título."* bajo el formulario; no se crea nada | Validación |
| 5 | Pulsar `✎` en #2, cambiar el título y guardar | La tarjeta muestra el título nuevo y se notifica *"Tarea #2 actualizada"* | Observer | 
| 6 | Poner límite WIP 1 en "En curso" cuando tiene 2 tareas | Error *"ya tiene 2 tareas; el límite no puede ser menor"* y el campo vuelve a su valor | Validación |
| 7 | Poner límite WIP 1 en "Revisión" (con 1 tarea) | Se notifica el cambio y la advertencia *"llegó a su límite WIP"*; la columna se marca en rojo | Observer |
| 8 | Abrir la página a 375 px de ancho (celular) y a 1024 px | Sin desplazamiento horizontal; las columnas se acomodan | — | 
| 9 | Consola del navegador | Sin errores | — | ✅ |
