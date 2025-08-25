import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../shared/layouts';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../../shared/components';
import { RegisterUseCase } from '../../application/auth/RegisterUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { CreateUserData } from '../../domain/entities/User';
import { UserRole } from '../../shared/types';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms: boolean;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
  });

  const [errors, setErrors] = useState<Partial<RegisterForm>>({});

  // Initialize use case - memoized to prevent recreation on every render
  const { userRepository, registerUseCase } = useMemo(() => {
    const userRepo = new UserRepository();
    return {
      userRepository: userRepo,
      registerUseCase: new RegisterUseCase(userRepo)
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!form.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    if (!form.terms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userData: CreateUserData = {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: UserRole.STUDENT, // Default role for registration
      };

      const result = await registerUseCase.execute(userData);

      if (result.user) {
        // Auto-login after registration, redirect to student dashboard
        navigate('/student/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({ email: error.message || 'Error al crear la cuenta. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            VanguardIA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Únete a la plataforma educativa del futuro
          </motion.p>
        </div>

        <Card variant="elevated" padding="none" className="overflow-hidden">
          <CardHeader padding="lg">
            <CardTitle className="text-center">Crear Cuenta</CardTitle>
          </CardHeader>
          <CardContent padding="lg" className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                name="name"
                type="text"
                label="Nombre completo"
                placeholder="Tu nombre"
                value={form.name}
                onChange={handleInputChange}
                error={errors.name}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleInputChange}
                error={errors.email}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                name="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={form.password}
                onChange={handleInputChange}
                error={errors.password}
                helperText="Mínimo 8 caracteres"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Input
                name="password_confirmation"
                type="password"
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={handleInputChange}
                error={errors.password_confirmation}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <div className="space-y-2">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={form.terms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      términos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      política de privacidad
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                fullWidth
              >
                Crear Cuenta
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;