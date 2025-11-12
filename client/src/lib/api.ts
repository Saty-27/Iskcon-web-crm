import { apiRequest } from './queryClient';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

// Generic CRUD operations
export const fetchData = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await apiRequest(endpoint, 'GET', undefined);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createData = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await apiRequest(endpoint, 'POST', data);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateData = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await apiRequest(endpoint, 'PUT', data);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteData = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await apiRequest(endpoint, 'DELETE', undefined);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Specific API endpoints
export const authApi = {
  login: (data: { username: string; password: string }) => 
    createData('/api/auth/login', data),
  
  register: (data: any) => 
    createData('/api/auth/register', data),
  
  logout: () => 
    apiRequest('/api/auth/logout', 'POST', {}),
  
  getProfile: () => 
    fetchData('/api/user/profile'),
  
  updateProfile: (data: any) => 
    updateData('/api/user/profile', data),
};

export const bannersApi = {
  getAll: () => fetchData('/api/banners'),
  get: (id: number) => fetchData(`/api/banners/${id}`),
  create: (data: any) => createData('/api/banners', data),
  update: (id: number, data: any) => updateData(`/api/banners/${id}`, data),
  delete: (id: number) => deleteData(`/api/banners/${id}`),
};

export const quotesApi = {
  getAll: () => fetchData('/api/quotes'),
  get: (id: number) => fetchData(`/api/quotes/${id}`),
  create: (data: any) => createData('/api/quotes', data),
  update: (id: number, data: any) => updateData(`/api/quotes/${id}`, data),
  delete: (id: number) => deleteData(`/api/quotes/${id}`),
};

export const donationCategoriesApi = {
  getAll: () => fetchData('/api/donation-categories'),
  get: (id: number) => fetchData(`/api/donation-categories/${id}`),
  create: (data: any) => createData('/api/donation-categories', data),
  update: (id: number, data: any) => updateData(`/api/donation-categories/${id}`, data),
  delete: (id: number) => deleteData(`/api/donation-categories/${id}`),
};

export const eventsApi = {
  getAll: () => fetchData('/api/events'),
  get: (id: number) => fetchData(`/api/events/${id}`),
  create: (data: any) => createData('/api/events', data),
  update: (id: number, data: any) => updateData(`/api/events/${id}`, data),
  delete: (id: number) => deleteData(`/api/events/${id}`),
};

export const galleryApi = {
  getAll: () => fetchData('/api/gallery'),
  get: (id: number) => fetchData(`/api/gallery/${id}`),
  create: (data: any) => createData('/api/gallery', data),
  update: (id: number, data: any) => updateData(`/api/gallery/${id}`, data),
  delete: (id: number) => deleteData(`/api/gallery/${id}`),
};

export const videosApi = {
  getAll: () => fetchData('/api/videos'),
  get: (id: number) => fetchData(`/api/videos/${id}`),
  create: (data: any) => createData('/api/videos', data),
  update: (id: number, data: any) => updateData(`/api/videos/${id}`, data),
  delete: (id: number) => deleteData(`/api/videos/${id}`),
};

export const testimonialsApi = {
  getAll: () => fetchData('/api/testimonials'),
  get: (id: number) => fetchData(`/api/testimonials/${id}`),
  create: (data: any) => createData('/api/testimonials', data),
  update: (id: number, data: any) => updateData(`/api/testimonials/${id}`, data),
  delete: (id: number) => deleteData(`/api/testimonials/${id}`),
};

export const contactApi = {
  submitMessage: (data: any) => createData('/api/contact', data),
  getMessages: () => fetchData('/api/contact-messages'),
  markAsRead: (id: number) => updateData(`/api/contact-messages/${id}`, { isRead: true }),
  delete: (id: number) => deleteData(`/api/contact-messages/${id}`),
};

export const socialLinksApi = {
  getAll: () => fetchData('/api/social-links'),
  get: (id: number) => fetchData(`/api/social-links/${id}`),
  create: (data: any) => createData('/api/social-links', data),
  update: (id: number, data: any) => updateData(`/api/social-links/${id}`, data),
  delete: (id: number) => deleteData(`/api/social-links/${id}`),
};

export const donationsApi = {
  create: (data: any) => createData('/api/donations', data),
  getAll: () => fetchData('/api/donations'),
  getUserDonations: () => fetchData('/api/user/donations'),
  updateStatus: (id: number, status: string) => 
    updateData(`/api/donations/${id}`, { status }),
};

export const subscriptionsApi = {
  subscribe: (email: string) => createData('/api/subscribe', { email }),
};

export const dashboardApi = {
  getStats: () => fetchData('/api/admin/dashboard-stats'),
};

export const userManagementApi = {
  getAll: () => fetchData('/api/admin/users'),
  update: (id: number, data: any) => updateData(`/api/admin/users/${id}`, data),
  delete: (id: number) => deleteData(`/api/admin/users/${id}`),
};
