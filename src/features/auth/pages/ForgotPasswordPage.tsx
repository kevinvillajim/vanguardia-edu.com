import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../shared/components/ui/Input/Input';
import { Button } from "@/shared/components/ui/Button/Button";
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '../../../shared/components/ui/Card/Card';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('El email no es válido');
      return;
    }

    try {
      await forgotPassword({ email });
      setSent(true);
      console.log('Password reset email sent');
    } catch (error: any) {
      console.error('Password reset error:', error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
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
            Vanguardia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Recupera el acceso a tu cuenta
          </motion.p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recuperar Contraseña</CardTitle>
            <CardDescription>
              {sent 
                ? 'Te hemos enviado las instrucciones a tu email'
                : 'Ingresa tu email para recibir las instrucciones'
              }
            </CardDescription>
          </CardHeader>
          <CardBody>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email enviado
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Hemos enviado las instrucciones de recuperación a{' '}
                    <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Si no lo encuentras, revisa tu carpeta de spam
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setSent(false);
                      setEmail('');
                    }}
                    variant="secondary"
                    fullWidth
                  >
                    Enviar a otro email
                  </Button>
                  <Link to="/auth/login">
                    <Button variant="ghost" fullWidth>
                      Volver al login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  error={error}
                  fullWidth
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                >
                  Enviar Instrucciones
                </Button>

                <div className="text-center">
                  <Link
                    to="/auth/login"
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    ← Volver al login
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;