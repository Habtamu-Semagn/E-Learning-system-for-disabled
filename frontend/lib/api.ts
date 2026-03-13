// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get user from localStorage
export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// Store auth data
export const storeAuth = (token: string, user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Clear auth data
export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: any) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Deprecated: Use login() instead
  loginStudent: (email: string, password: string) =>
    apiRequest('/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginTeacher: (email: string, password: string) =>
    apiRequest('/auth/login/teacher', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginAdmin: (email: string, password: string) =>
    apiRequest('/auth/login/admin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signupStudent: (data: {
    email: string;
    password: string;
    fullName: string;
    schoolId: string;
    disabilityType: string;
  }) =>
    apiRequest('/auth/signup/student', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signupTeacher: (data: {
    email: string;
    password: string;
    fullName: string;
    department: string;
    bio?: string;
  }) =>
    apiRequest('/auth/signup/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersAPI = {
  getAll: (params?: { role?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/users${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => apiRequest(`/users/${id}`),

  create: (data: any) =>
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Approvals API
export const approvalsAPI = {
  getPending: () => apiRequest('/approvals/pending'),

  getAll: (status?: string) =>
    apiRequest(`/approvals${status ? `?status=${status}` : ''}`),

  approve: (id: number) =>
    apiRequest(`/approvals/${id}/approve`, {
      method: 'POST',
    }),

  reject: (id: number, reason?: string) =>
    apiRequest(`/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: {
    category?: string;
    difficulty?: string;
    teacherId?: number;
    status?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/courses${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => apiRequest(`/courses/${id}`),

  create: (data: any) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/courses/${id}`, {
      method: 'DELETE',
    }),

  getTeacherCourses: () => {
    const user = getStoredUser();
    if (!user || user.role !== 'teacher') return Promise.resolve([]);
    return coursesAPI.getAll({ teacherId: user.id });
  },
};

// Lessons API
export const lessonsAPI = {
  getByCourse: (courseId: number) => apiRequest(`/lessons/course/${courseId}`),

  getById: (id: number) => apiRequest(`/lessons/${id}`),

  create: (data: any) =>
    apiRequest('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiRequest(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/lessons/${id}`, {
      method: 'DELETE',
    }),
};

// Enrollments API
export const enrollmentsAPI = {
  getByStudent: (studentId: number) =>
    apiRequest(`/enrollments/student/${studentId}`),

  getByCourse: (courseId: number) =>
    apiRequest(`/enrollments/course/${courseId}`),

  enroll: (courseId: number) =>
    apiRequest('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),

  unenroll: (courseId: number) =>
    apiRequest(`/enrollments/${courseId}`, {
      method: 'DELETE',
    }),
};

// Progress API
export const progressAPI = {
  getByCourse: (courseId: number) => apiRequest(`/progress/course/${courseId}`),

  getByStudent: (studentId: number) =>
    apiRequest(`/progress/student/${studentId}`),

  completeLesson: (lessonId: number, timeSpent?: number) =>
    apiRequest(`/progress/lesson/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    }),

  updateTime: (lessonId: number, timeSpent: number) =>
    apiRequest(`/progress/lesson/${lessonId}/time`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    }),
};

// Quizzes API
export const quizzesAPI = {
  getAvailable: () => apiRequest('/quizzes/available'),

  getByCourse: (courseId: number) => apiRequest(`/quizzes/course/${courseId}`),

  getById: (id: number) => apiRequest(`/quizzes/${id}`),

  create: (data: any) =>
    apiRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitAttempt: (id: number, answers: any) =>
    apiRequest(`/quizzes/${id}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getAttempts: (id: number) => apiRequest(`/quizzes/${id}/attempts`),

  getRecentAttempts: () => apiRequest('/quizzes/student/attempts'),
};

// Feedback API
export const feedbackAPI = {
  getAll: (params?: { status?: string; category?: string; priority?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/feedback${query ? `?${query}` : ''}`);
  },

  getByUser: (userId: number) => apiRequest(`/feedback/user/${userId}`),

  getById: (id: number) => apiRequest(`/feedback/${id}`),

  create: (data: any) =>
    apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string, adminResponse?: string) =>
    apiRequest(`/feedback/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminResponse }),
    }),

  delete: (id: number) =>
    apiRequest(`/feedback/${id}`, {
      method: 'DELETE',
    }),
};

// Audit API
export const auditAPI = {
  getAll: (params?: {
    userId?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/audit${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => apiRequest(`/audit/${id}`),

  getStats: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/audit/stats/summary${query ? `?${query}` : ''}`);
  },
};

// System API
export const systemAPI = {
  getStats: () => apiRequest('/system/stats'),
  getTeacherStats: () => apiRequest('/system/teacher/stats'),
  getStudentStats: () => apiRequest('/system/student/stats'),
};
