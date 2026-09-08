# Plan de acción: feedback sobre percentiles

> Documento de seguimiento basado en el correo recibido de la pediatra el 8 de septiembre de 2026.
>
> El correo original está en `Percentiles.pdf` en la raíz, pero ese archivo es material de trabajo local y **no debe entrar en ningún commit**.

## Cómo usaremos este documento

- Cada hito se trabajará por separado y no se marcará como completado hasta tener una comprobación reproducible.
- Las decisiones sobre referencias de crecimiento se cerrarán antes de incorporar datos nuevos.
- Al cerrar un hito se añadirá aquí la evidencia de validación y el mensaje que se puede enviar a la pediatra para que pruebe la mejora.
- Los commits serán pequeños, focalizados y descriptivos. Nunca se incluirá `Percentiles.pdf`.
- Se distinguirá entre una corrección funcional confirmada, una comprobación visual y una cuestión clínica pendiente de decisión.

## Estado general

- [ ] Hito 0 — Cerrar el contrato de referencias y edades.
- [ ] Hito 1 — Corregir la escala temporal y las vistas de las curvas.
- [ ] Hito 2 — Mostrar un solo paciente por defecto y permitir comparar pacientes.
- [ ] Hito 3 — Reparar la carga y representación de talla y perímetro cefálico.
- [ ] Hito 4 — Ajustar el aspecto de percentiles y líneas de pacientes.
- [ ] Hito 5 — Regresión completa, prueba con la pediatra y cierre.

## Hito 0 — Cerrar el contrato de referencias y edades

**Estado:** Pendiente de decisión.

### Objetivo

Definir qué referencia debe mostrar cada medida en cada tramo de edad antes de modificar los datos de las curvas.

### Situación observada

- La aplicación actual ofrece curvas como máximo hasta 5 años.
- La vista inicial trabaja con 13 semanas y las vistas personalizadas llegan hasta 60 meses.
- La petición habla de meses de 0 a 2 años y de años desde los 25 meses hasta los 18 años.
- La referencia oficial de la OMS para 5–19 años no ofrece exactamente los mismos indicadores para todas las medidas: talla y BMI llegan a 19 años, mientras que peso para la edad llega a 10 años. El perímetro cefálico no aparece como indicador equivalente en esa referencia.

### Decisiones necesarias

- Confirmar si “tablas” se refiere al eje y selector de las gráficas, a una tabla numérica de percentiles, o a ambos.
- Confirmar qué referencia usar para peso después de los 10 años.
- Confirmar qué referencia usar para perímetro cefálico después de los 5 años, si realmente se necesita ese tramo.
- Confirmar si la vista por defecto debe ser 0–24 meses, conservando las 13 semanas como vista específica opcional.

### Criterios de aceptación

- Cada indicador tiene una fuente identificada y un rango de edad explícito.
- No se dibuja ni se interpola una curva para un tramo sin datos respaldados.
- La transición entre referencias queda documentada y es comprensible para la persona usuaria.

### Validación

- Revisar las tablas y documentación oficiales seleccionadas.
- Registrar la decisión final en este documento antes de implementar el hito 1.

### Mensaje para la pediatra al cerrar el hito

Pendiente. Se preparará cuando se haya acordado el alcance de las referencias.

## Hito 1 — Corregir la escala temporal y las vistas de las curvas

**Estado:** Pendiente.

### Objetivo

Representar correctamente la edad del paciente: meses entre 0 y 24 meses y años a partir del tramo acordado, hasta el límite definido en el hito 0.

### Trabajo previsto

- Revisar el modelo de rangos disponibles y eliminar el límite fijo actual de 5 años cuando el nuevo contrato lo permita.
- Mostrar etiquetas de edad coherentes con la unidad real del tramo.
- Resolver la transición en 24/25 meses sin desplazar los datos del paciente.
- Revisar la vista inicial de 13 semanas frente a la vista esperada de 0–24 meses.
- Separar, si procede, la resolución de los datos de referencia de la unidad visual del eje.
- Mantener correctamente el cambio de referencia de longitud a partir de los 2 años.

### Criterios de aceptación

- Una medición a los 0, 1, 2, 12 y 24 meses aparece en la posición temporal esperada.
- Las edades posteriores se muestran en años según el contrato acordado.
- Las etiquetas no dicen “semanas” cuando la vista está expresada en meses.
- Las mediciones cercanas a 24/25 meses no desaparecen ni se asignan al tramo equivocado.
- La vista de 13 semanas, si se conserva, sigue funcionando como vista explícita y no se confunde con la vista de 0–24 meses.

### Pruebas previstas

- Casos con mediciones exactamente en el nacimiento, 13 semanas, 2 meses, 24 meses y 25 meses.
- Casos con fechas intermedias y fechas posteriores al cambio de unidad.
- Pruebas de peso, talla y perímetro por separado.

### Mensaje para la pediatra al cerrar el hito

Pendiente. Se preparará con pasos concretos para comprobar las etiquetas, los cambios de unidad y las edades límite.

## Hito 2 — Mostrar un solo paciente por defecto y permitir comparar pacientes

**Estado:** Pendiente.

### Objetivo

Que la gráfica muestre inicialmente un único paciente y permita seleccionar uno o varios pacientes mediante casillas de verificación para comparar hermanos.

### Situación observada

Actualmente se generan series para todos los niños compatibles con la medida y el sexo seleccionados.

### Trabajo previsto

- Añadir una selección explícita de pacientes para la gráfica.
- Seleccionar inicialmente un único paciente compatible.
- Mostrar casillas solo para pacientes con datos aplicables a la gráfica actual.
- Permitir marcar varios pacientes para comparar sus curvas.
- Mantener el color elegido para cada paciente en la línea, puntos y leyenda.
- Revisar qué ocurre al cambiar de medida, sexo o rango de edad.

### Criterios de aceptación

- Al abrir Curvas aparece un solo paciente, no todos.
- Marcar un segundo paciente añade únicamente su serie.
- Desmarcarlo la elimina sin alterar los datos guardados.
- Cambiar de peso a talla o perímetro conserva solo selecciones válidas.
- Los pacientes sin fecha de nacimiento, sexo o medida compatible no se presentan como seleccionables.

### Mensaje para la pediatra al cerrar el hito

Pendiente. Incluirá cómo abrir Curvas, comprobar el paciente seleccionado y comparar dos hermanos.

## Hito 3 — Reparar la carga y representación de talla y perímetro cefálico

**Estado:** Pendiente de reproducción.

### Objetivo

Asegurar que las curvas de talla y perímetro cefálico cargan los datos del paciente y los colocan en la edad correcta.

### Trabajo previsto

- Reproducir el fallo con datos mínimos y con varios pacientes.
- Verificar selección de medida, sexo, rango, función de acceso al dato y generación de series.
- Comprobar la vista inicial y las vistas de meses/años.
- Probar mediciones solo de talla, solo de perímetro y mediciones mixtas.
- Revisar los límites y offsets de las curvas de longitud 0–2 y 2–5 años.
- Evitar que un dato ausente en una medida oculte datos válidos de otra.

### Criterios de aceptación

- Una medición de talla aparece en la curva de talla en su edad correcta.
- Una medición de perímetro cefálico aparece en la curva de perímetro en su edad correcta.
- Cambiar entre peso, talla y perímetro no deja una gráfica anterior ni pierde la serie seleccionada.
- Los datos fuera del rango de una referencia se tratan de forma explícita y no se dibujan en una posición engañosa.

### Pruebas previstas

- Niña y niño.
- Medición al nacimiento y mediciones en torno a 2 años.
- Vista inicial, vista mensual y vista posterior a 2 años.
- Un solo paciente y comparación de dos pacientes.

### Mensaje para la pediatra al cerrar el hito

Pendiente. Se preparará con una prueba específica de talla y otra de perímetro cefálico.

## Hito 4 — Ajustar el aspecto de percentiles y líneas de pacientes

**Estado:** Pendiente.

### Objetivo

Acercar la representación visual a la referencia de la pediatra sin perder legibilidad ni distinguir las curvas de los pacientes.

### Requisitos del correo

- Todas las líneas de percentiles en negro.
- Percentil 50 con mayor grosor.
- Resto de percentiles con menor grosor.
- Líneas de los pacientes con el color elegido para cada uno.
- Puntos y leyenda coherentes con esas líneas.

### Criterios de aceptación

- P3, P15, P50, P85 y P97 se distinguen visualmente sin depender solo del color.
- P50 es claramente más grueso.
- Las líneas de pacientes no se confunden con las referencias.
- El resultado es legible en tema claro, tema oscuro y pantalla pequeña.
- La leyenda identifica correctamente percentiles y pacientes seleccionados.

### Mensaje para la pediatra al cerrar el hito

Pendiente. Se preparará para que compare el grosor, color y leyenda con sus gráficas de referencia.

## Hito 5 — Regresión completa, prueba con la pediatra y cierre

**Estado:** Pendiente.

### Objetivo

Verificar que las mejoras funcionan juntas y entregar una prueba controlada a la pediatra.

### Validación técnica

- [ ] `pnpm test`
- [ ] `pnpm run lint`
- [ ] `pnpm run compile`
- [ ] `pnpm run build`
- [ ] Prueba manual en navegador con datos nuevos y datos importados.
- [ ] Comprobación responsive de selector, checks, gráfica y leyenda.
- [ ] Comprobación de que `Percentiles.pdf` no aparece en el staging.

### Validación funcional conjunta

- [ ] Peso.
- [ ] Talla.
- [ ] Perímetro cefálico.
- [ ] 0–24 meses.
- [ ] Transición posterior a 24/25 meses.
- [ ] Paciente único por defecto.
- [ ] Comparación de hermanos.
- [ ] Colores de pacientes.
- [ ] Percentiles negros y P50 destacado.

### Mensaje final para la pediatra

Se preparará después de completar los hitos anteriores, con una lista breve de escenarios y datos de prueba.

## Registro de cambios y commits

| Fecha | Hito | Commit | Evidencia | Estado |
| --- | --- | --- | --- | --- |
| 2026-09-08 | Plan inicial | Pendiente | Documento creado; `Percentiles.pdf` excluido | En curso |

