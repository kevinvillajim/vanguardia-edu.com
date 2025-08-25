import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { CreateUserData, AuthResponse } from '../../domain/entities/User';
import { BUSINESS_RULES } from '../../shared/constants';

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userData: CreateUserData): Promise<AuthResponse> {
    // Validaciones de negocio
    this.validateUserData(userData);
    
    try {
      // Ejecutar registro
      const authResponse = await this.userRepository.register(userData);
      
      return authResponse;
    } catch (error) {
      throw this.handleRegisterError(error);
    }
  }

  private validateUserData(userData: CreateUserData): void {
    // Validar campos requeridos
    if (!userData.name || !userData.email || !userData.password) {
      throw new Error('Nombre, email y contraseña son requeridos');
    }

    // Validar email
    if (!this.isValidEmail(userData.email)) {
      throw new Error('Formato de email inválido');
    }

    // Validar contraseña
    if (userData.password.length < BUSINESS_RULES.PASSWORD_MIN_LENGTH) {
      throw new Error(`Contraseña debe tener al menos ${BUSINESS_RULES.PASSWORD_MIN_LENGTH} caracteres`);
    }

    // Validar confirmación de contraseña
    if (userData.password !== userData.password_confirmation) {
      throw new Error('Las contraseñas no coinciden');
    }

    // Validar fortaleza de contraseña
    if (!this.isStrongPassword(userData.password)) {
      throw new Error('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
    }

    // Validar nombre
    if (userData.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers;
  }

  private handleRegisterError(error: any): Error {
    if (error.status === 422) {
      if (error.errors?.email) {
        return new Error('El email ya está registrado');
      }
      return new Error('Datos de registro inválidos');
    }
    
    return new Error(error.message || 'Error inesperado en el registro');
  }
}