import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<void> {
    try {
      // Logout en el servidor
      await this.userRepository.logout();
      
      // Limpiar datos locales
      this.clearLocalData();
      
    } catch (error) {
      // Aunque falle el logout del servidor, limpiamos local
      console.warn('Server logout failed, clearing local data:', error);
      this.clearLocalData();
    }
  }

  private clearLocalData(): void {
    // Limpiar localStorage
    const keysToRemove = [
      'vanguardia_auth_token',
      'vanguardia_user_data',
      'vanguardia_theme'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpiar sessionStorage
    sessionStorage.clear();

    // Limpiar cookies relacionadas con auth si existen
    this.clearAuthCookies();
  }

  private clearAuthCookies(): void {
    // Limpiar cookies de autenticación
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}