/**
 * Servicio de seguridad centralizado
 * Protección contra XSS, CSRF, injection attacks y más
 */

import { logger } from '../utils/logger';
import { globalRateLimiter, apiRateLimiter, authRateLimiter } from './RateLimiter';

export interface SecurityConfig {
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableInputSanitization: boolean;
  enableContentSecurityPolicy: boolean;
  enableRateLimiting: boolean;
  enableIntegrityChecks: boolean;
  trustedDomains: string[];
  maxUploadSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
}

export interface SecurityViolation {
  type: 'xss' | 'csrf' | 'injection' | 'rate_limit' | 'file_upload' | 'integrity' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export interface SecurityReport {
  violations: SecurityViolation[];
  period: string;
  stats: {
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    blockedRequests: number;
    suspiciousPatterns: string[];
  };
}

const DEFAULT_CONFIG: SecurityConfig = {
  enableXSSProtection: true,
  enableCSRFProtection: true,
  enableInputSanitization: true,
  enableContentSecurityPolicy: true,
  enableRateLimiting: true,
  enableIntegrityChecks: true,
  trustedDomains: [],
  maxUploadSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'ppt', 'pptx'],
  sessionTimeout: 30 * 60 * 1000 // 30 minutos
};

export class SecurityService {
  private config: SecurityConfig;
  private violations: SecurityViolation[] = [];
  private csrfToken: string | null = null;
  private sessionStartTime = Date.now();
  private suspiciousPatterns: RegExp[] = [];

  constructor(config?: Partial<SecurityConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeSecurity();
    this.loadSuspiciousPatterns();
  }

  /**
   * Inicializar medidas de seguridad
   */
  private initializeSecurity(): void {
    if (typeof window === 'undefined') return;

    // CSP Headers
    if (this.config.enableContentSecurityPolicy) {
      this.setContentSecurityPolicy();
    }

    // CSRF Token
    if (this.config.enableCSRFProtection) {
      this.generateCSRFToken();
    }

    // Event listeners para detectar ataques
    this.setupSecurityListeners();

    logger.info('🛡️ Security service initialized with config:', {
      xss: this.config.enableXSSProtection,
      csrf: this.config.enableCSRFProtection,
      rateLimiting: this.config.enableRateLimiting
    });
  }

  /**
   * Cargar patrones sospechosos
   */
  private loadSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      // SQL Injection patterns
      /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bunion\b|\bdrop\b).*(\bfrom\b|\bwhere\b|\binto\b)/gi,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript\s*:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /(exec|execute)\s*\(/gi,
      /\bOR\b.*\b=\b.*\b(OR|AND)\b/gi,
      /'.*(\bor\b|\band\b).*'/gi
    ];

    logger.debug('🔍 Security patterns loaded:', { count: this.suspiciousPatterns.length });
  }

  /**
   * Configurar CSP
   */
  private setContentSecurityPolicy(): void {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https: wss: ws:",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    // En un entorno real, esto se configuraría en el servidor
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);

    logger.debug('🔒 Content Security Policy set');
  }

  /**
   * Generar token CSRF
   */
  private generateCSRFToken(): void {
    this.csrfToken = this.generateSecureToken();
    
    // Agregar a meta tag para acceso desde JavaScript
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = this.csrfToken;
    document.head.appendChild(meta);

    logger.debug('🛡️ CSRF token generated');
  }

  /**
   * Configurar listeners de seguridad
   */
  private setupSecurityListeners(): void {
    // Detectar intentos de XSS
    document.addEventListener('DOMNodeInserted', (event) => {
      const target = event.target as Element;
      if (target.nodeType === Node.ELEMENT_NODE) {
        this.scanElementForXSS(target);
      }
    });

    // Detectar cambios sospechosos en inputs
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.validateInput(target.value, target.name || 'unknown');
      }
    });

    // Detectar navegación sospechosa
    window.addEventListener('beforeunload', () => {
      this.checkSessionIntegrity();
    });

    logger.debug('👂 Security listeners configured');
  }

  /**
   * Escanear elemento por XSS
   */
  private scanElementForXSS(element: Element): void {
    if (!this.config.enableXSSProtection) return;

    const innerHTML = element.innerHTML;
    const dangerousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(innerHTML)) {
        this.recordViolation({
          type: 'xss',
          severity: 'high',
          message: 'Potential XSS attempt detected',
          details: {
            pattern: pattern.toString(),
            content: innerHTML.substring(0, 200),
            element: element.tagName
          }
        });
        
        // Sanitizar elemento
        element.innerHTML = this.sanitizeHTML(innerHTML);
        break;
      }
    }
  }

  /**
   * Validar input del usuario
   */
  validateInput(value: string, fieldName: string): boolean {
    if (!this.config.enableInputSanitization) return true;

    // Verificar patrones sospechosos
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(value)) {
        this.recordViolation({
          type: 'injection',
          severity: 'medium',
          message: 'Suspicious input pattern detected',
          details: {
            field: fieldName,
            pattern: pattern.toString(),
            value: value.substring(0, 100)
          }
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitizar HTML
   */
  sanitizeHTML(html: string): string {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  /**
   * Sanitizar entrada de usuario
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) return input;

    return input
      .replace(/[<>]/g, '') // Remover < >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+\s*=/gi, '') // Remover event handlers
      .replace(/eval\s*\(/gi, '') // Remover eval
      .trim();
  }

  /**
   * Validar token CSRF
   */
  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) return true;

    const isValid = token === this.csrfToken;
    
    if (!isValid) {
      this.recordViolation({
        type: 'csrf',
        severity: 'high',
        message: 'Invalid CSRF token',
        details: {
          provided: token,
          expected: this.csrfToken?.substring(0, 10) + '...'
        }
      });
    }

    return isValid;
  }

  /**
   * Obtener token CSRF
   */
  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Validar archivo subido
   */
  validateFileUpload(file: File): {
    valid: boolean;
    reason?: string;
  } {
    // Tamaño del archivo
    if (file.size > this.config.maxUploadSize) {
      this.recordViolation({
        type: 'file_upload',
        severity: 'medium',
        message: 'File size exceeds limit',
        details: {
          filename: file.name,
          size: file.size,
          limit: this.config.maxUploadSize
        }
      });
      
      return {
        valid: false,
        reason: `File size exceeds ${this.config.maxUploadSize / (1024 * 1024)}MB limit`
      };
    }

    // Tipo de archivo
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !this.config.allowedFileTypes.includes(extension)) {
      this.recordViolation({
        type: 'file_upload',
        severity: 'medium',
        message: 'Invalid file type',
        details: {
          filename: file.name,
          extension,
          allowedTypes: this.config.allowedFileTypes
        }
      });
      
      return {
        valid: false,
        reason: `File type .${extension} is not allowed`
      };
    }

    // Verificar nombre de archivo sospechoso
    const suspiciousName = /[<>:"|?*\\\/]/.test(file.name) || file.name.includes('..');
    if (suspiciousName) {
      this.recordViolation({
        type: 'file_upload',
        severity: 'high',
        message: 'Suspicious filename detected',
        details: {
          filename: file.name
        }
      });
      
      return {
        valid: false,
        reason: 'Invalid filename characters'
      };
    }

    return { valid: true };
  }

  /**
   * Verificar rate limiting
   */
  async checkRateLimit(identifier: string, type: 'global' | 'api' | 'auth' = 'global'): Promise<{
    allowed: boolean;
    retryAfter?: number;
  }> {
    if (!this.config.enableRateLimiting) {
      return { allowed: true };
    }

    let limiter;
    switch (type) {
      case 'api':
        limiter = apiRateLimiter;
        break;
      case 'auth':
        limiter = authRateLimiter;
        break;
      default:
        limiter = globalRateLimiter;
    }

    const result = await limiter.isAllowed(identifier);
    
    if (!result.allowed) {
      this.recordViolation({
        type: 'rate_limit',
        severity: 'medium',
        message: `Rate limit exceeded for ${type}`,
        details: {
          identifier,
          type,
          info: result.info
        }
      });
    }

    return {
      allowed: result.allowed,
      retryAfter: result.info.retryAfter
    };
  }

  /**
   * Verificar integridad de la sesión
   */
  private checkSessionIntegrity(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    if (sessionDuration > this.config.sessionTimeout) {
      this.recordViolation({
        type: 'suspicious',
        severity: 'low',
        message: 'Session timeout exceeded',
        details: {
          duration: sessionDuration,
          timeout: this.config.sessionTimeout
        }
      });
    }
  }

  /**
   * Verificar integridad de datos
   */
  verifyDataIntegrity(data: string, hash: string): boolean {
    if (!this.config.enableIntegrityChecks) return true;

    // En un entorno real, usarías una librería de hashing como crypto-js
    const computedHash = btoa(data).slice(0, 16);
    const isValid = computedHash === hash;
    
    if (!isValid) {
      this.recordViolation({
        type: 'integrity',
        severity: 'high',
        message: 'Data integrity check failed',
        details: {
          expected: hash,
          computed: computedHash
        }
      });
    }

    return isValid;
  }

  /**
   * Generar token seguro
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Registrar violación de seguridad
   */
  private recordViolation(violation: Omit<SecurityViolation, 'timestamp' | 'userAgent' | 'ip'>): void {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      // IP se obtendría del backend en un caso real
      ip: 'unknown'
    };

    this.violations.push(fullViolation);
    
    // Mantener solo las últimas 1000 violaciones
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }

    // Log según severidad
    if (fullViolation.severity === 'critical' || fullViolation.severity === 'high') {
      logger.error('🚨 Security Violation:', fullViolation);
    } else {
      logger.warn('⚠️ Security Warning:', fullViolation);
    }
  }

  /**
   * Obtener violaciones
   */
  getViolations(): SecurityViolation[] {
    return [...this.violations];
  }

  /**
   * Limpiar violaciones
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Generar reporte de seguridad
   */
  generateSecurityReport(period: string = 'session'): SecurityReport {
    const stats = {
      totalViolations: this.violations.length,
      violationsByType: {} as Record<string, number>,
      violationsBySeverity: {} as Record<string, number>,
      blockedRequests: 0,
      suspiciousPatterns: this.suspiciousPatterns.map(p => p.toString())
    };

    // Calcular estadísticas
    this.violations.forEach(violation => {
      stats.violationsByType[violation.type] = (stats.violationsByType[violation.type] || 0) + 1;
      stats.violationsBySeverity[violation.severity] = (stats.violationsBySeverity[violation.severity] || 0) + 1;
      
      if (violation.type === 'rate_limit' || violation.type === 'csrf' || violation.type === 'injection') {
        stats.blockedRequests++;
      }
    });

    const report: SecurityReport = {
      violations: this.getViolations(),
      period,
      stats
    };

    logger.info('📊 Security report generated:', {
      totalViolations: stats.totalViolations,
      criticalCount: stats.violationsBySeverity.critical || 0,
      period
    });

    return report;
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    logger.info('⚙️ Security config updated:', newConfig);
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Destruir servicio
   */
  destroy(): void {
    this.violations = [];
    this.csrfToken = null;
    
    logger.info('💀 Security service destroyed');
  }
}

// Instancia global del servicio de seguridad
export const globalSecurityService = new SecurityService({
  trustedDomains: [
    'localhost',
    '127.0.0.1',
    window.location.hostname
  ]
});

// Helpers para uso fácil
export const sanitizeInput = (input: string): string => {
  return globalSecurityService.sanitizeInput(input);
};

export const validateCSRF = (token: string): boolean => {
  return globalSecurityService.validateCSRFToken(token);
};

export const checkRateLimit = async (identifier: string, type?: 'global' | 'api' | 'auth') => {
  return await globalSecurityService.checkRateLimit(identifier, type);
};

export const validateFileUpload = (file: File) => {
  return globalSecurityService.validateFileUpload(file);
};