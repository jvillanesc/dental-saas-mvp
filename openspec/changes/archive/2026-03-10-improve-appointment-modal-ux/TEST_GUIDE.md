# Quick Test Guide

## Start Servers

### Backend (Terminal 1)
```powershell
Set-Location C:\git_proyectos\dental-saas-mvp\backend
.\run-backend.ps1
```

### Frontend (Terminal 2)
```powershell
Set-Location C:\git_proyectos\dental-saas-mvp\frontend
npm run dev
```

## Test URL
```
http://localhost:5173
```

## Quick Test Checklist

### ✅ Create Mode
- [ ] Click empty calendar slot → Modal opens with "Nueva Cita"
- [ ] Status field is HIDDEN
- [ ] Fill form → Click "Crear"
- [ ] Appointment appears BLUE (SCHEDULED)

### ✅ Edit Mode
- [ ] Click existing appointment → Modal opens with "Editar Cita"
- [ ] All fields pre-filled
- [ ] **NEW**: "Seleccione el nuevo estado" section visible
- [ ] 6 radio buttons with colored badges shown
- [ ] Current status pre-selected
- [ ] Change status → Click "Actualizar"
- [ ] Calendar refreshes with new color

### ✅ Key Behaviors
- [ ] Can edit fields without changing status
- [ ] Can change both fields and status
- [ ] Cancel button works (no save, no refresh)
- [ ] Validation still works
- [ ] Calendar auto-refreshes after save

## Visual Verification

**Create Mode Layout:**
```
┌─────────────────────────┐
│ Nueva Cita         [X]  │
├─────────────────────────┤
│ Paciente: [dropdown]    │
│ Dentista: [dropdown]    │
│ Fecha/Hora  | Duración  │  ← Only 2 columns
│ Notas (opcional)        │
│ [Cancelar]    [Crear]   │
└─────────────────────────┘
```

**Edit Mode Layout:**
```
┌─────────────────────────┐
│ Editar Cita        [X]  │
├─────────────────────────┤
│ Paciente: [dropdown]    │
│ Dentista: [dropdown]    │
│ Fecha/Hora  | Duración  │
│ Notas (opcional)        │
│                         │
│ Seleccione el nuevo estado │ ← NEW SECTION
│ ● Programada  [blue]    │
│ ○ Confirmada  [green]   │
│ ○ En Progreso [yellow]  │
│ ○ Completada  [gray]    │
│ ○ Cancelada   [red]     │
│ ○ No Asistió  [orange]  │
│                         │
│ [Cancelar] [Actualizar] │
└─────────────────────────┘
```

## Status Colors Reference

- **SCHEDULED** (Programada): Blue
- **CONFIRMED** (Confirmada): Green
- **IN_PROGRESS** (En Progreso): Yellow
- **COMPLETED** (Completada): Gray
- **CANCELLED** (Cancelada): Red
- **NO_SHOW** (No Asistió): Orange

## Expected Console Output

No errors should appear in browser console.

## Issues?

If you encounter problems:
1. Check browser console for errors
2. Verify backend is running and responsive
3. Check network tab for API calls
4. Review [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)

## After Testing

Once testing is complete:
```
/opsx:archive
```
