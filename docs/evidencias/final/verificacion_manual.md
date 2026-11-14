# Verificación del funcionamiento: versión final

Pruebas hechas el 2026-11-14 sobre la versión final, en el navegador (Microsoft Edge) y con el ejecutable para
Windows. Las capturas de esta carpeta se tomaron automáticamente durante la verificación.

## Aplicación en el navegador (`npm start`)

| # | Caso | Resultado esperado | Patrón | Evidencia |
|---|---|---|---|---|
| 1 | Abrir `http://localhost:3000` | Se muestra la página de presentación y la consola no registra errores | Integración | `01_portada.png`, `02_pagina_completa.png` |
| 2 | Pulsar *Abrir tablero* | La página baja a la sección del tablero con tres tareas de ejemplo | Integración | `03_tablero.png` |
| 3 | Pulsar → en "#03 Definir checklist DoD" con la DoR incompleta | La tarea no se mueve, la tarjeta se sacude y el aviso dice qué ítems faltan | Strategy + Observer | `04_bloqueo_por_dor.png` |
| 4 | Completar la DoD de "#01" y pulsar → | La tarea pasa a "Hecho" y recibe el sello 済 | Strategy + Observer | `05_tarea_terminada_con_sello.png` |
| 5 | Escribir 1 en el límite de "En curso" (con 1 tarea) | Se avisa el cambio y la columna se marca como llena | Observer | `06_limite_wip_lleno.png` |
| 6 | Escribir 1 en el límite de "En curso" con 2 tareas | Error "el límite no puede ser menor" y el campo vuelve a su valor | Validación | Prueba `no permite un límite menor que las tareas actuales` |
| 7 | Pulsar ✎ en "#02" | El formulario pasa a modo edición con los datos de la tarea | Integración | `07_edicion_de_tarea.png` |
| 8 | Enviar el formulario sin título | Mensaje "La tarea debe tener un título." bajo el formulario; no se crea nada | Validación | Prueba `un dato inválido se devuelve como mensaje no notificado` |
| 9 | Sistema en modo oscuro | La página y el tablero cambian a la paleta oscura | Diseño | `08_modo_oscuro_portada.png`, `09_modo_oscuro_tablero.png` |
| 10 | Pantalla de celular (390 px) | Sin desplazamiento horizontal; el tablero se apila en una columna | Diseño | `10_celular_portada.png`, `11_celular_tablero.png` |
| 11 | Activar *reducir movimiento* en el sistema | Las secciones aparecen sin animaciones | Accesibilidad | Configuración usada en todas las capturas |

## Ejecutable para Windows (`npm run build:exe`)

| # | Caso | Resultado esperado | Resultado |
|---|---|---|---|
| 12 | Copiar `MiniTableroKanban.exe` a una carpeta vacía y ejecutarlo | Abre una consola con la dirección del tablero y abre el navegador | Correcto |
| 13 | Pedir `/`, `/styles.css` y las fuentes `.woff2` | Responden 200 con su tipo correcto, sin depender de los archivos del proyecto | Correcto |
| 14 | Pedir una ruta inexistente o con `..` | Responde 404 o 400; no se puede leer fuera de la app | Correcto |
| 15 | Ejecutarlo con el puerto 3000 ocupado | Usa el siguiente puerto libre (3001) | Correcto |
| 16 | Cerrar la consola | El servidor se detiene | Correcto |

## Pruebas automatizadas

60 pruebas aprobadas: ver [`resultado_pruebas.md`](resultado_pruebas.md).
