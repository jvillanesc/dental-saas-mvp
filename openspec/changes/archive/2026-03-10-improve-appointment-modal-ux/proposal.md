# Proposal: Improve Appointment Modal UX

**Date**: 2026-03-10  
**Author**: System  
**Status**: Proposed

## Problem

El modal actual de citas (`AppointmentModal.tsx`) presenta la misma interfaz tanto para crear nuevas citas como para editar citas existentes. Esto genera confusión:

1. **Al crear**: El usuario ve un selector de "Estado" que no es relevante - todas las nuevas citas deben ser "SCHEDULED"
2. **Al editar**: El selector de estado es un simple dropdown que no muestra visualmente los colores/significado de cada estado
3. **Inconsistencia**: Existe un modal separado (`AppointmentStatusModal.tsx`) con una mejor UI para cambiar estados (radio buttons con colores), pero solo se usa para cambios rápidos de estado

## Proposed Solution

Adaptar `AppointmentModal.tsx` para diferenciar entre dos modos:

### Modo: Nueva Cita
- Ocultar completamente el campo "Estado"
- Guardar automáticamente con `status: "SCHEDULED"`
- Mostrar: Paciente, Dentista, Fecha/Hora, Duración, Notas

### Modo: Editar Cita
- Permitir editar TODOS los campos (Paciente, Dentista, Fecha/Hora, Duración, Notas)
- Debajo del campo "Notas", agregar nueva sección: "Seleccione el nuevo estado"
- Mostrar radio buttons con labels coloridos (igual que `AppointmentStatusModal`)
- Pre-seleccionar el estado actual
- No es obligatorio cambiar el estado (puede solo editar otros campos)

### Deprecación
- Marcar `AppointmentStatusModal.tsx` como deprecado
- Agregar comentario indicando que la funcionalidad ahora está en `AppointmentModal`
- Mantener el archivo por compatibilidad temporalmente

## Benefits

1. **Claridad**: El usuario entiende inmediatamente si está creando o editando
2. **Eficiencia**: Puede cambiar cualquier campo de la cita en un solo modal
3. **Consistencia**: UI visual para estados (colores) directamente en el modal principal
4. **Simplicidad**: Elimina la necesidad de múltiples modales para gestionar citas

## Scope

### In Scope
- Modificar `AppointmentModal.tsx` para soportar dos modos
- Agregar componente de radio buttons con colores para estados
- Deprecar `AppointmentStatusModal.tsx`
- Asegurar que el calendario se refresque después de guardar

### Out of Scope
- Cambios en el backend (endpoints existentes funcionan correctamente)
- Modificaciones en `AppointmentCalendar.tsx` (solo llama al modal)
- Eliminar físicamente `AppointmentStatusModal.tsx` (solo deprecar)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Romper funcionalidad existente de creación | Alto | Testing exhaustivo, mantener lógica actual |
| Romper funcionalidad existente de edición | Alto | Testing exhaustivo, mantener lógica actual |
| Modal muy largo en modo edición | Medio | Buen diseño visual, separación clara de secciones |

## Success Criteria

- ✅ Nueva cita: Se crea sin mostrar selector de estado
- ✅ Nueva cita: Se guarda con status "SCHEDULED"
- ✅ Editar cita: Muestra todos los campos editables
- ✅ Editar cita: Muestra radio buttons con colores para estados
- ✅ Editar cita: Estado actual está pre-seleccionado
- ✅ Calendario se refresca automáticamente después de guardar
- ✅ No se rompe ninguna funcionalidad existente
