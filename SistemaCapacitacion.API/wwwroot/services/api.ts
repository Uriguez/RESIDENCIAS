import { User, Course, Progress, Certificate, Activity } from '../types';

/**
 * Servicio API simulado para el sistema Griver
 * En producción, esto se conectaría a endpoints reales
 */

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.griver.com';
const API_VERSION = 'v1';

class ApiService {
  private baseUrl = `${API_BASE_URL}/${API_VERSION}`;

  // Headers por defecto
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'web'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Método genérico para hacer requests
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== AUTH ====================
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulación - en producción sería una llamada real
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      user: {
        id: '1',
        name: 'Usuario Demo',
        email,
        role: 'employee',
        status: 'active',
        assignedCourses: ['1', '2']
      } as User,
      token: 'mock-jwt-token-' + Date.now()
    };
  }

  async logout(token: string): Promise<void> {
    // En producción invalidaría el token en el servidor
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { token: 'new-mock-jwt-token-' + Date.now() };
  }

  // ==================== USERS ====================
  async getUsers(token: string, filters?: any): Promise<User[]> {
    return this.request<User[]>('/users', { method: 'GET' }, token);
  }

  async getUser(userId: string, token: string): Promise<User> {
    return this.request<User>(`/users/${userId}`, { method: 'GET' }, token);
  }

  async createUser(userData: Partial<User>, token: string): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, token);
  }

  async updateUser(userId: string, userData: Partial<User>, token: string): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, token);
  }

  async deleteUser(userId: string, token: string): Promise<void> {
    await this.request(`/users/${userId}`, { method: 'DELETE' }, token);
  }

  // ==================== COURSES ====================
  async getCourses(token: string, filters?: any): Promise<Course[]> {
    return this.request<Course[]>('/courses', { method: 'GET' }, token);
  }

  async getCourse(courseId: string, token: string): Promise<Course> {
    return this.request<Course>(`/courses/${courseId}`, { method: 'GET' }, token);
  }

  async createCourse(courseData: Partial<Course>, token: string): Promise<Course> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    }, token);
  }

  async updateCourse(courseId: string, courseData: Partial<Course>, token: string): Promise<Course> {
    return this.request<Course>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    }, token);
  }

  async deleteCourse(courseId: string, token: string): Promise<void> {
    await this.request(`/courses/${courseId}`, { method: 'DELETE' }, token);
  }

  // ==================== PROGRESS ====================
  async getUserProgress(userId: string, token: string): Promise<Progress[]> {
    return this.request<Progress[]>(`/users/${userId}/progress`, { method: 'GET' }, token);
  }

  async updateProgress(userId: string, courseId: string, progressData: Partial<Progress>, token: string): Promise<Progress> {
    return this.request<Progress>(`/users/${userId}/progress/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData)
    }, token);
  }

  // ==================== CERTIFICATES ====================
  async getUserCertificates(userId: string, token: string): Promise<Certificate[]> {
    return this.request<Certificate[]>(`/users/${userId}/certificates`, { method: 'GET' }, token);
  }

  async generateCertificate(userId: string, courseId: string, token: string): Promise<Certificate> {
    return this.request<Certificate>(`/certificates/generate`, {
      method: 'POST',
      body: JSON.stringify({ userId, courseId })
    }, token);
  }

  // ==================== ANALYTICS ====================
  async getAnalytics(token: string, params?: any): Promise<any> {
    const queryParams = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/analytics${queryParams}`, { method: 'GET' }, token);
  }

  async getCourseAnalytics(courseId: string, token: string): Promise<any> {
    return this.request<any>(`/courses/${courseId}/analytics`, { method: 'GET' }, token);
  }

  // ==================== ACTIVITIES ====================
  async getUserActivities(userId: string, token: string, limit = 50): Promise<Activity[]> {
    return this.request<Activity[]>(`/users/${userId}/activities?limit=${limit}`, { method: 'GET' }, token);
  }

  async logActivity(activityData: Partial<Activity>, token: string): Promise<Activity> {
    return this.request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    }, token);
  }

  // ==================== FILE UPLOAD ====================
  async uploadFile(file: File, token: string, type: 'course-content' | 'avatar' | 'certificate'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// Exportar clases de error personalizadas
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}