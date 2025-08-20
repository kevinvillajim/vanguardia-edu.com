import { apiClient } from '../api/apiService';

export interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface UserSearchParams {
  search?: string;
  role?: number;
  active?: boolean;
  page?: number;
  per_page?: number;
}

class UserServiceV2 {
  private baseUrl = '/v2/users';

  async getUsers(params: UserSearchParams = {}) {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  async getUsersByRole(role: string): Promise<{ data: User[] }> {
    let roleNumber: number;
    
    switch (role) {
      case 'admin':
        roleNumber = 1;
        break;
      case 'student':
        roleNumber = 2;
        break;
      case 'teacher':
        roleNumber = 3;
        break;
      default:
        throw new Error('Invalid role');
    }

    const response = await apiClient.get(`${this.baseUrl}/role/${roleNumber}`);
    return response.data;
  }

  async getUser(id: number) {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async searchUsers(query: string, params: UserSearchParams = {}) {
    const response = await apiClient.get(`${this.baseUrl}/search`, {
      params: { q: query, ...params }
    });
    return response.data;
  }

  async createUser(userData: Partial<User>) {
    const response = await apiClient.post(this.baseUrl, userData);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async resetPassword(id: number) {
    const response = await apiClient.put(`${this.baseUrl}/${id}/reset-password`);
    return response.data;
  }

  async setActive(id: number, active: boolean) {
    const response = await apiClient.put(`${this.baseUrl}/${id}/set-active`, { active });
    return response.data;
  }

  async importUsers(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Convenience methods
  async getStudents() {
    return this.getUsersByRole('student');
  }

  async getTeachers() {
    return this.getUsersByRole('teacher');
  }

  async getAdmins() {
    return this.getUsersByRole('admin');
  }
}

export const userService = new UserServiceV2();
export { userService as userServiceV2 };