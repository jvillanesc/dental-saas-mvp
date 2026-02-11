# 📘 ESPECIFICACIONES TÉCNICAS - FRONTEND

**Proyecto**: Dental SaaS MVP  
**Tecnología**: React 18.2 + TypeScript 5.3 + Vite 5.0  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 🎯 Objetivos

SPA (Single Page Application) moderna con:
- ✅ React 18 con TypeScript estricto
- ✅ Vite como build tool (dev server rápido)
- ✅ Tailwind CSS para estilos
- ✅ React Router para navegación
- ✅ Axios para API calls
- ✅ Context API para estado global (AuthContext)

---

## 📦 Dependencias (package.json)

```json
{
  "name": "dental-saas-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 📁 Estructura de Proyecto

```
frontend/
├── public/
│   └── vite.svg
│
├── src/
│   ├── App.tsx                              # Componente raíz + Router
│   ├── main.tsx                             # Entry point
│   ├── index.css                            # Tailwind imports
│   ├── vite-env.d.ts                        # ⚠️ IMPORTANTE: Vite types
│   │
│   ├── pages/                               # Páginas/vistas
│   │   ├── Login.tsx                        # Página de login
│   │   ├── Dashboard.tsx                    # Dashboard principal
│   │   │
│   │   ├── patients/                        # Gestión de pacientes
│   │   │   ├── PatientsPage.tsx
│   │   │   └── PatientModal.tsx
│   │   │
│   │   ├── staff/                           # Gestión de staff
│   │   │   ├── StaffPage.tsx
│   │   │   └── StaffModal.tsx
│   │   │
│   │   └── appointments/                    # Agenda de citas
│   │       ├── AppointmentsPage.tsx
│   │       ├── AppointmentModal.tsx
│   │       └── AppointmentCalendar.tsx
│   │
│   ├── components/                          # Componentes reutilizables
│   │   ├── common/                          # Componentes UI básicos
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   └── layout/                          # Layout components
│   │       ├── Layout.tsx                   # Layout principal
│   │       ├── Header.tsx                   # Header con logout
│   │       └── Sidebar.tsx                  # Menu lateral
│   │
│   ├── context/                             # React Context
│   │   └── AuthContext.tsx                  # Estado de autenticación
│   │
│   ├── services/                            # API calls
│   │   ├── api.ts                           # Axios instance + interceptor
│   │   ├── authService.ts                   # Login
│   │   ├── patientService.ts                # CRUD pacientes
│   │   ├── staffService.ts                  # CRUD staff
│   │   ├── appointmentService.ts            # CRUD citas
│   │   └── userService.ts                   # Get dentists
│   │
│   ├── types/                               # TypeScript types
│   │   ├── auth.types.ts                    # User, LoginRequest, LoginResponse
│   │   ├── patient.types.ts                 # Patient, CreatePatientDTO
│   │   ├── staff.types.ts                   # ⚠️ Staff (separado de User)
│   │   └── appointment.types.ts             # Appointment, AppointmentDTO
│   │
│   └── utils/                               # Utilidades
│       └── formatters.ts                    # Formateo de fechas, etc.
│
├── .env                                     # Variables de entorno
├── vite.config.ts                           # Configuración Vite
├── tsconfig.json                            # Configuración TypeScript
├── tailwind.config.js                       # Configuración Tailwind
└── package.json
```

---

## ⚙️ Configuraciones

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### vite-env.d.ts ⚠️ IMPORTANTE
```typescript
/// <reference types="vite/client" />
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

---

## 🔐 Autenticación (AuthContext.tsx)

```typescript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LoginRequest } from '../types/auth.types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🌐 API Service (api.ts)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📝 TypeScript Types

### auth.types.ts
```typescript
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
```

### staff.types.ts ⚠️ SEPARADO de User
```typescript
export interface Staff {
  id: string;
  tenantId: string;
  userId?: string;              // Relación opcional con User
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialty: string;
  licenseNumber: string;
  hireDate?: string;
  active: boolean;
}

export interface CreateStaffDTO {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialty: string;
  licenseNumber: string;
  hireDate?: string;
  active: boolean;
  createUser?: boolean;         // Si crear usuario asociado
  userEmail?: string;
  userPassword?: string;
  userRole?: 'DENTIST' | 'ASSISTANT';
}

export const SPECIALTIES = [
  { value: 'GENERAL_DENTISTRY', label: 'Odontología General' },
  { value: 'ENDODONTICS', label: 'Endodoncia' },
  { value: 'ORTHODONTICS', label: 'Ortodoncia' },
  { value: 'PERIODONTICS', label: 'Periodoncia' },
  { value: 'ORAL_SURGERY', label: 'Cirugía Oral' },
  { value: 'PROSTHODONTICS', label: 'Prostodoncia' },
  { value: 'PEDIATRIC_DENTISTRY', label: 'Odontopediatría' },
  { value: 'COSMETIC_DENTISTRY', label: 'Odontología Estética' },
];
```

---

## 🎨 Componentes Comunes

### Button.tsx
```typescript
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Input.tsx
```typescript
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

---

## ✅ Checklist de Implementación

### Setup Inicial
- [ ] Crear proyecto con `npm create vite@latest`
- [ ] Instalar dependencias: `npm install`
- [ ] Configurar Tailwind CSS
- [ ] Crear vite-env.d.ts ⚠️ IMPORTANTE

### Estructura
- [ ] Crear carpetas: pages, components, services, types, context
- [ ] Crear componentes comunes (Button, Input, Select, Modal)
- [ ] Crear Layout con Header + Sidebar

### Autenticación
- [ ] Implementar AuthContext
- [ ] Crear página Login
- [ ] Configurar api.ts con interceptores JWT
- [ ] Implementar authService

### Rutas
- [ ] Configurar React Router en App.tsx
- [ ] Rutas protegidas con AuthContext
- [ ] Redirección a login si no autenticado

### Páginas
- [ ] Dashboard
- [ ] PatientsPage + PatientModal
- [ ] StaffPage + StaffModal ⚠️ Separado de Users
- [ ] AppointmentsPage + Calendar + Modal

### Types
- [ ] Definir todos los tipos TypeScript
- [ ] ⚠️ CRÍTICO: Staff types separados de User types

### Services
- [ ] patientService (CRUD)
- [ ] staffService (CRUD)
- [ ] appointmentService (CRUD)
- [ ] userService (getDentists con userId no nulo)

---

## 🐛 Errores Comunes y Soluciones

### Error: "Cannot find module 'vite/client'"
**Solución**: Crear src/vite-env.d.ts:
```typescript
/// <reference types="vite/client" />
```

### Error: "React is not defined" en componentes
**Solución**: NO importar React si no se usa, TypeScript 5 + Vite lo maneja automáticamente

### Error: CORS en llamadas API
**Solución**: Configurar proxy en vite.config.ts:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

---

**🎯 Siguiente paso**: Ejecutar `sdd/specs-docker-database.md`
