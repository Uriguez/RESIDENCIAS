import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Course } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  courses: Course[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cursos de ejemplo para demostración
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Seguridad Laboral Básica',
    description: 'Fundamentos de seguridad en el lugar de trabajo',
    category: { id: 'cat-1', name: 'Seguridad' },
    difficulty: 'beginner',
    estimatedTime: 120,
    isActive: true,
    createdAt: '2024-01-01',
    status: 'published'
  },
  {
    id: '2',
    title: 'Procedimientos de Emergencia',
    description: 'Qué hacer en situaciones de emergencia',
    category: { id: 'cat-1', name: 'Seguridad' },
    difficulty: 'intermediate',
    estimatedTime: 90,
    isActive: true,
    createdAt: '2024-01-15',
    status: 'published'
  },
  {
    id: '3',
    title: 'Cultura Organizacional',
    description: 'Valores y principios de Griver',
    category: { id: 'cat-2', name: 'Cultura' },
    difficulty: 'beginner',
    estimatedTime: 60,
    isActive: true,
    createdAt: '2024-02-01',
    status: 'published'
  },
];

// Usuarios de ejemplo para demostración
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador Griver',
    email: 'admin@griver.com',
    role: 'admin',
    status: 'active',
    department: 'Administración',
    hireDate: '2020-01-15',
    lastLogin: new Date().toISOString(),
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzM1NzA5Mnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2', 
    name: 'Ana García López',
    email: 'ana.garcia@griver.com',
    role: 'employee',
    position: 'Analista de Ventas',
    assignedCourses: ['1', '2', '3'],
    status: 'active',
    department: 'Ventas',
    hireDate: '2021-03-10',
    completedCourses: ['1'],
    progress: [
      { courseId: '1', progress: 100 },
      { courseId: '2', progress: 65 },
      { courseId: '3', progress: 30 }
    ],
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1754298949882-216a1c92dbb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3MzQzNTgzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@griver.com', 
    role: 'employee',
    position: 'Desarrollador Senior',
    assignedCourses: ['1', '2'],
    status: 'active',
    department: 'IT',
    hireDate: '2019-07-22',
    completedCourses: ['1', '2'],
    progress: [
      { courseId: '1', progress: 100 },
      { courseId: '2', progress: 100 }
    ],
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzI3NzUwM3ww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    name: 'María Fernández',
    email: 'maria.fernandez@griver.com',
    role: 'rh',
    position: 'Especialista en RRHH',
    status: 'active',
    department: 'Recursos Humanos',
    hireDate: '2020-11-05',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    avatar: 'https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU3MzE4MjA0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    name: 'Luis Martínez',
    email: 'luis.martinez@griver.com',
    role: 'intern',
    assignedCourses: ['1', '3'],
    status: 'active',
    department: 'Marketing',
    hireDate: '2023-09-01',
    progress: [
      { courseId: '1', progress: 45 },
      { courseId: '3', progress: 0 }
    ],
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1638452033979-14fba9e17fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGludGVybiUyMHN0dWRlbnQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU3MzU3MTAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '6',
    name: 'Javier Herrera Uscanga',
    email: 'javierherrerauscanga308@gmail.com',
    role: 'admin',
    status: 'active',
    department: 'Administración',
    hireDate: '2018-01-10',
    lastLogin: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    // Sin avatar para mostrar que funciona el fallback con iniciales
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar credenciales (en producción esto sería una llamada real a la API)
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === '123456') { // Password de ejemplo
      // Actualizar último login
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      setUser(updatedUser);
      setToken('mock-jwt-token-' + Date.now());
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // En producción, también invalidar el token en el servidor
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    // Simular llamada a API para actualizar usuario
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Actualizar el usuario en el estado local
    setUser(updatedUser);
    
    // En producción, aquí iría la llamada real a la API
    // await apiClient.updateUser(updatedUser.id, updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users: mockUsers, 
      courses: mockCourses, 
      login, 
      logout, 
      updateUser, 
      isLoading, 
      token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}