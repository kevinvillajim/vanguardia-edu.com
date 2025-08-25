import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { LoginCredentials, AuthResponse } from '../../domain/entities/User';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validaciones de negocio
    this.validateCredentials(credentials);
    
    try {
      // Ejecutar login
      const authResponse = await this.userRepository.login(credentials);
      
      // Validar respuesta
      this.validateAuthResponse(authResponse);
      
      return authResponse;
    } catch (error) {
      throw this.handleLoginError(error);
    }
  }

  private validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Formato de email inválido');
    }

    if (credentials.password.length < 6) {
      throw new Error('Contraseña debe tener al menos 6 caracteres');
    }
  }

  private validateAuthResponse(response: AuthResponse): void {
    if (!response.user || !response.token) {
      throw new Error('Respuesta de autenticación inválida');
    }

    if (!response.user.active) {
      throw new Error('Usuario inactivo. Contacte al administrador');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleLoginError(error: any): Error {
    if (error.status === 401) {
      return new Error('Credenciales incorrectas');
    }
    
    if (error.status === 429) {
      return new Error('Demasiados intentos. Intente más tarde');
    }
    
    return new Error(error.message || 'Error inesperado en el login');
  }
}