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

- [x] Hito 0 — Cerrar el contrato de referencias y edades.
- [x] Hito 1 — Corregir la escala temporal y las vistas de las curvas.
- [x] Hito 2 — Mostrar un solo paciente por defecto y permitir comparar pacientes.
- [x] Hito 3 — Reparar la carga y representación de talla y perímetro cefálico.
- [ ] Hito 4 — Ajustar el aspecto de percentiles y líneas de pacientes.
- [ ] Hito 5 — Regresión completa, prueba con la pediatra y cierre.

## Hito 0 — Cerrar el contrato de referencias y edades

**Estado:** Cerrado para este hito.

### Objetivo

Definir qué referencia debe mostrar cada medida en cada tramo de edad antes de modificar los datos de las curvas.

### Situación observada

- La aplicación actual ofrece curvas como máximo hasta 5 años.
- La vista inicial trabaja con 13 semanas y las vistas personalizadas llegan hasta 60 meses.
- La petición habla de meses de 0 a 2 años y de años desde los 25 meses hasta los 18 años.
- La referencia oficial de la OMS para 5–19 años no ofrece exactamente los mismos indicadores para todas las medidas: talla y BMI llegan a 19 años, mientras que peso para la edad llega a 10 años. El perímetro cefálico no aparece como indicador equivalente en esa referencia.

### Decisiones necesarias

- “Tablas” se interpreta en este trabajo como los ejes y el selector de las gráficas; no se añade una tabla numérica nueva.
- Se incorporan datos oficiales posteriores a 5 años cuando existen para el indicador.
- La vista por defecto es 0–24 meses y se conserva una vista explícita de 13 semanas.
- El selector ofrece años de 2 a 18, con límite dinámico por indicador.

### Contrato aplicado

- Peso: OMS 0–5 años y OMS 5–10 años.
- Talla: OMS 0–5 años y OMS 5–19 años, limitada a 18 años en la aplicación.
- Perímetro cefálico: OMS 0–5 años.
- La aplicación no dibuja una curva para un tramo sin referencia respaldada.

### Criterios de aceptación

- Cada indicador tiene una fuente identificada y un rango de edad explícito.
- No se dibuja ni se interpola una curva para un tramo sin datos respaldados.
- La transición entre referencias queda documentada y es comprensible para la persona usuaria.

### Validación

- Revisadas las páginas oficiales de indicadores y percentiles de la OMS.
- Decisiones registradas antes de cerrar la implementación del hito 1.

### Mensaje para la pediatra al cerrar el hito

Este hito queda documentado como la base de referencias del hito 1.

## Hito 1 — Corregir la escala temporal y las vistas de las curvas

**Estado:** Implementado localmente; pendiente de validación externa con la pediatra.

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

- [x] Una medición a los 0, 1, 2, 12 y 24 meses aparece en la posición temporal esperada.
- [x] Las edades posteriores se muestran con marcas de años enteros según el contrato acordado.
- [x] Las etiquetas no dicen “semanas” cuando la vista está expresada en meses.
- [x] Las mediciones cercanas a 24/25 meses no desaparecen ni se asignan al tramo equivocado.
- [x] La vista de 13 semanas funciona como vista explícita y no se confunde con la vista de 0–24 meses.

### Pruebas previstas

- Casos con mediciones exactamente en el nacimiento, 13 semanas, 2 meses, 24 meses y 25 meses.
- Casos con fechas intermedias y fechas posteriores al cambio de unidad.
- Pruebas de peso, talla y perímetro por separado.

### Validación realizada

- 122 aserciones pasan con `pnpm test`.
- `pnpm run lint` pasa.
- `pnpm run compile` pasa.
- `pnpm run build` termina correctamente; Webpack conserva únicamente sus dos avisos de tamaño de bundle.
- El servidor de desarrollo entrega el HTML correctamente en `127.0.0.1:8081`.
- La comprobación Chrome headless no produjo DOM por una limitación del proceso; queda pendiente la comprobación visual manual.

### Mensaje para la pediatra al cerrar el hito

> Hola Marina. Hemos cambiado la vista inicial de Curvas a 0–24 meses y dejamos la vista de 13 semanas como opción independiente. También hemos ampliado el selector por edades: talla hasta 18 años, peso hasta 10 años y perímetro cefálico hasta 5 años, que son los rangos para los que tenemos referencias respaldadas.
>
> Cuando puedas, prueba una niña y un niño con medidas en nacimiento, 2 meses, 24 meses y alguna edad posterior. Comprueba que el eje muestra meses hasta los 24 meses, años enteros después, y que al cambiar a 13 semanas el eje cambia a semanas. En talla prueba también una edad posterior a 5 años; en peso y perímetro comprueba que el selector limita el máximo disponible.
>
> Dime si las posiciones de los puntos y las etiquetas coinciden con tus gráficas de referencia.

### Mensaje acumulado para enviar al terminar

> Hemos cambiado la vista inicial a 0–24 meses y dejamos las 13 semanas como opción independiente. También hemos ampliado el selector por edades: talla hasta 18 años, peso hasta 10 años y perímetro cefálico hasta 5 años. Cuando puedas, prueba medidas en nacimiento, 2 meses, 24 meses y alguna edad posterior, comprobando las etiquetas y las posiciones de los puntos.

## Hito 2 — Mostrar un solo paciente por defecto y permitir comparar pacientes

**Estado:** Implementado localmente; pendiente de validación externa con la pediatra.

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
- Persistir la selección en el navegador mediante una clave separada de los datos médicos.
- Mantener seleccionados los pacientes que temporalmente no sean compatibles y mostrar un aviso.

### Criterios de aceptación

- Al abrir Curvas aparece un solo paciente, no todos.
- Marcar un segundo paciente añade únicamente su serie.
- Desmarcarlo la elimina sin alterar los datos guardados.
- Cambiar de peso a talla o perímetro conserva las selecciones y oculta temporalmente las que no sean compatibles.
- Los pacientes sin fecha de nacimiento, sexo o medida compatible no se presentan como seleccionables.
- Al volver a una medida compatible, el paciente seleccionado vuelve a aparecer marcado.
- Recargar la aplicación conserva la selección; desmarcar todos los pacientes conserva una selección vacía.

### Decisiones de implementación

- La selección se guarda solo en `localStorage`, no en el JSON de copia de seguridad.
- Cada paciente recibe un identificador estable; los datos anteriores se actualizan mediante una migración.
- Si una selección deja de ser compatible, se mantiene internamente y se muestra un aviso accesible; no se cambia automáticamente a otro paciente.
- Si no existe una selección guardada, se selecciona el primer paciente compatible al abrir Curvas.

### Validación realizada

- 134 aserciones pasan con `pnpm test`.
- `pnpm run lint` pasa.
- `pnpm run compile` pasa.
- `pnpm run build` termina correctamente; Webpack conserva únicamente sus dos avisos de tamaño de bundle.
- La comprobación visual manual en navegador queda pendiente.

### Mensaje para la pediatra al cerrar el hito

> Hola Marina. Ahora Curvas muestra un solo paciente compatible por defecto y permite marcar varios para comparar sus líneas. Prueba una niña y un niño con medidas de peso y talla, abre Curvas y comprueba que aparece solo uno; después marca el segundo y verifica que aparecen las dos líneas con sus colores.
>
> También prueba a desmarcarlo, recargar la aplicación y cambiar de medida. Si un paciente no tiene datos para la medida elegida, debería aparecer un aviso y volver a estar seleccionado al regresar a una medida compatible.
>
> Dime si la selección, los colores y la comparación se comportan como esperabas.

### Mensaje acumulado para enviar al terminar

> Ahora Curvas muestra un solo paciente compatible por defecto y permite marcar varios para comparar sus líneas. Prueba una niña y un niño con medidas de peso y talla, abre Curvas y comprueba que aparece solo uno; después marca el segundo y verifica que aparecen las dos líneas con sus colores.
>
> También prueba a desmarcarlo, recargar la aplicación y cambiar de medida. Si un paciente no tiene datos para la medida elegida, debería aparecer un aviso y volver a estar seleccionado al regresar a una medida compatible.

## Hito 3 — Reparar la carga y representación de talla y perímetro cefálico

**Estado:** Implementado localmente; pendiente de validación externa con la pediatra.

### Objetivo

Asegurar que las curvas de talla y perímetro cefálico cargan los datos del paciente y los colocan en la edad correcta.

### Trabajo realizado

- Se centralizó la generación de series de pacientes para que la vista activa
  siempre use el accessor de su indicador (`length`, `head` o `weight`).
- Se corrigió el filtrado temporal: se ignoran mediciones anteriores al
  nacimiento y posteriores al último punto visible de la referencia.
- Se mantienen huecos como `null`, sin convertirlos en cero ni en `NaN`.
- Se corrigió la agregación para conservar valores numéricos cero.
- El cambio de gráfica reconstruye las series a partir de la configuración
  activa, evitando reutilizar datos de talla o perímetro de otra medida.

### Criterios de aceptación

- [x] Una medición de talla aparece en la curva de talla en su edad correcta.
- [x] Una medición de perímetro cefálico aparece en la curva de perímetro en su edad correcta.
- [x] Cambiar entre peso, talla y perímetro reconstruye la serie activa y conserva la selección de pacientes.
- [x] Los datos fuera del rango de una referencia se omiten y no se dibujan en una posición engañosa.
- [x] Los datos de talla y perímetro pueden coexistir en la misma visita sin ocultarse entre sí.

### Pruebas realizadas

- Niña y niño, con talla y perímetro cefálico separados y combinados.
- Mediciones al nacimiento, a 1–2 meses, a 24 meses y fuera del tramo en 25 meses.
- Vistas neonatales por semanas y vistas mensuales recortadas a 24 meses.
- Huecos de datos, fechas anteriores al nacimiento y valores cero.

### Validación realizada

- 145 aserciones pasan con `pnpm test`.
- `pnpm run lint` pasa.
- `pnpm run compile` pasa.
- `pnpm run build` termina correctamente; Webpack conserva únicamente sus dos avisos de tamaño de bundle.
- La comprobación visual manual en navegador queda pendiente.

### Mensaje para la pediatra al cerrar el hito

> Hola Marina. Hemos revisado la carga de las curvas de talla y perímetro cefálico. Ahora cada gráfica usa su propia medida, aunque en una misma visita falte una de ellas, y las mediciones se colocan desde la fecha de nacimiento en semanas o meses según la vista.
>
> Cuando puedas, prueba una niña y un niño con una medición al nacimiento, otra a 1–2 meses y otra alrededor de 24 meses. Haz una prueba con solo talla, otra con solo perímetro cefálico y otra visita con ambas medidas. Comprueba también que al cambiar entre talla, perímetro y peso no se conserva una línea de la gráfica anterior.
>
> Si puedes, revisa además una vista de 13 semanas y una personalizada de 0–24 meses, y dime si algún punto aparece desplazado, desaparece o se dibuja aunque no exista ese dato.

### Mensaje acumulado para enviar al terminar

> Hemos revisado la carga de las curvas de talla y perímetro cefálico. Ahora cada gráfica usa su propia medida, incluso cuando una visita solo tiene uno de los datos, y las mediciones se colocan desde la fecha de nacimiento en semanas o meses según la vista. Prueba una niña y un niño con medidas al nacimiento, a 1–2 meses y alrededor de 24 meses; cambia entre talla, perímetro y peso y comprueba también las vistas de 13 semanas y 0–24 meses.

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
| 2026-09-08 | Plan inicial | `d4da8ba` | Documento creado; `Percentiles.pdf` excluido | Cerrado |
| 2026-09-09 | Hitos 0–1 | `274de09`, `45c67fa` | 122 aserciones, lint, compile, build y servidor local verificados; `Percentiles.pdf` excluido | Implementado localmente; pendiente de validación externa |
| 2026-09-09 | Hito 2 | `bc40cfb`, `24d0715` | 134 aserciones, lint, compile y build verificados; `Percentiles.pdf` excluido | Implementado localmente; pendiente de validación externa |
| 2026-09-09 | Hito 3 | `bfb8c34` | 145 aserciones, lint, compile y build verificados; `Percentiles.pdf` excluido | Implementado localmente; pendiente de validación externa |
