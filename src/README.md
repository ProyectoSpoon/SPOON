Estructura del Código Fuente
Este directorio contiene el código fuente principal de la aplicación de gestión de restaurantes. La aplicación está construida utilizando Next.js 14 con el App Router, TypeScript y React.
🏗️ Estructura de Directorios
Copysrc/
├── app/                    # Páginas y rutas de Next.js
├── components/            # Componentes globales
├── context/              # Contextos de React globales
├── firebase/             # Configuración e integraciones de Firebase
├── hooks/               # Hooks globales
├── lib/                 # Utilidades y configuraciones
├── shared/              # Recursos compartidos
└── __tests__/          # Pruebas unitarias y de integración
📚 Convenciones de Código
Nomenclatura de Archivos

Componentes React: Usar PascalCase
typescriptCopyMenuItem.tsx
RestaurantCard.tsx

Hooks: Usar camelCase con prefijo "use"
typescriptCopyuseMenu.ts
useAuthentication.ts

Utilidades: Usar kebab-case
typescriptCopydate-utils.ts
string-helpers.ts


Estructura de Componentes
Cada módulo de características sigue esta estructura:
Copyfeature/
├── components/     # Componentes específicos del módulo
├── hooks/         # Hooks específicos del módulo
├── types/         # Tipos y interfaces
└── utils/         # Utilidades específicas
🛠️ Guías de Desarrollo
Creación de Nuevos Componentes

Crear en la carpeta apropiada:

Componentes compartidos en shared/components
Componentes específicos en su módulo correspondiente


Incluir tipos TypeScript:
typescriptCopyinterface ComponentProps {
  // definir props
}

export const Component: React.FC<ComponentProps> = () => {
  // implementación
}


Manejo de Estado

Usar React Context para estado global
Hooks personalizados para lógica reutilizable
Estado local con useState para componentes simples

Estilos

Utilizar Tailwind CSS para estilos base
Componentes de shadcn/ui para UI consistente
Personalización a través de spoon-theme.ts

🔍 Imports y Exports

Usar imports absolutos desde la raíz del proyecto
typescriptCopyimport { Button } from '@/shared/components/ui/button'

Exportar componentes y utilidades desde archivos index.ts

📝 Documentación

Documentar componentes con JSDoc
Incluir ejemplos de uso en componentes complejos
Mantener los README.md actualizados

🧪 Testing

Escribir pruebas para:

Componentes UI
Hooks personalizados
Utilidades
Flujos de integración



🚀 Performance

Implementar lazy loading para rutas grandes
Optimizar imágenes con Next.js Image
Minimizar re-renders innecesarios

📦 Dependencias Principales

Next.js 14
TypeScript
React
Tailwind CSS
shadcn/ui
Firebase
Lucide React
React Day Picker
date-fns

🤝 Contribución

Crear una rama desde main
Seguir las convenciones de código establecidas
Documentar cambios significativos
Asegurar que las pruebas pasen
Crear Pull Request con descripción clara