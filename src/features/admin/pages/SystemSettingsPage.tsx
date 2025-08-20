import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from '../../../shared/components/ui/Input/Input';

export const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Vanguardia',
    siteDescription: 'Plataforma de educación en ciberseguridad',
    allowRegistration: true,
    requireEmailVerification: true,
    maxUploadSize: '10',
    sessionTimeout: '30',
    enableMaintenanceMode: false,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Aquí iría la lógica para guardar la configuración
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuración del Sistema
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración General */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuración General
            </h2>
            <div className="space-y-4">
              <Input
                name="siteName"
                label="Nombre del Sitio"
                value={settings.siteName}
                onChange={handleInputChange}
                fullWidth
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción del Sitio
                </label>
                <textarea
                  name="siteDescription"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowRegistration"
                    checked={settings.allowRegistration}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Permitir registro de nuevos usuarios
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Requerir verificación de email
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableMaintenanceMode"
                    checked={settings.enableMaintenanceMode}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Activar modo de mantenimiento
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Configuración de Archivos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuración de Archivos
            </h2>
            <div className="space-y-4">
              <Input
                name="maxUploadSize"
                label="Tamaño máximo de subida (MB)"
                type="number"
                value={settings.maxUploadSize}
                onChange={handleInputChange}
                fullWidth
              />

              <Input
                name="sessionTimeout"
                label="Tiempo de sesión (minutos)"
                type="number"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                fullWidth
              />
            </div>
          </div>

          {/* Configuración de Email */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuración de Email
            </h2>
            <div className="space-y-4">
              <Input
                name="smtpHost"
                label="Servidor SMTP"
                value={settings.smtpHost}
                onChange={handleInputChange}
                fullWidth
              />

              <Input
                name="smtpPort"
                label="Puerto SMTP"
                type="number"
                value={settings.smtpPort}
                onChange={handleInputChange}
                fullWidth
              />

              <Input
                name="smtpUser"
                label="Usuario SMTP"
                value={settings.smtpUser}
                onChange={handleInputChange}
                fullWidth
              />

              <Input
                name="smtpPassword"
                label="Contraseña SMTP"
                type="password"
                value={settings.smtpPassword}
                onChange={handleInputChange}
                fullWidth
              />
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Estado del Sistema
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Uptime
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    2.1GB
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Uso de memoria
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Almacenamiento</span>
                  <span className="text-gray-900 dark:text-white">45.2 GB / 100 GB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" size="sm" fullWidth>
                  Limpiar Cache
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  Optimizar Base de Datos
                </Button>
                <Button variant="danger" size="sm" fullWidth>
                  Reiniciar Sistema
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="secondary">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemSettingsPage;