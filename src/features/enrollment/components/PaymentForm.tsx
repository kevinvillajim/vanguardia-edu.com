import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../../../shared/components/ui/Input/Input';
import { Card } from '../../../shared/components/ui/Card/Card';

interface PaymentFormProps {
  amount: number;
  onPaymentMethodChange: (method: 'card' | 'paypal') => void;
  onPaymentDetailsChange: (details: any) => void;
  selectedMethod: string;
}

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    icon: '💳',
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Paga de forma segura con tu cuenta PayPal'
  }
];

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentMethodChange,
  onPaymentDetailsChange,
  selectedMethod
}) => {
  const [cardDetails, setCardDetails] = useState({
    card_number: '',
    card_holder: '',
    expiry_date: '',
    cvv: '',
    billing_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'ES'
    }
  });

  const handleCardDetailChange = (field: string, value: string) => {
    if (field.startsWith('billing_address.')) {
      const addressField = field.replace('billing_address.', '');
      const newCardDetails = {
        ...cardDetails,
        billing_address: {
          ...cardDetails.billing_address,
          [addressField]: value
        }
      };
      setCardDetails(newCardDetails);
      onPaymentDetailsChange(newCardDetails);
    } else {
      const newCardDetails = { ...cardDetails, [field]: value };
      setCardDetails(newCardDetails);
      onPaymentDetailsChange(newCardDetails);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length >= 2) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}`;
    }
    return numericValue;
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Método de Pago</h4>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <motion.label
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedMethod === method.id
                  ? 'border-[var(--color-primary)] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => onPaymentMethodChange(e.target.value as any)}
                className="sr-only"
              />
              
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              
              {selectedMethod === method.id && (
                <div className="text-[var(--color-primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.label>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      {selectedMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Información de la Tarjeta</h4>
            
            <div className="space-y-4">
              {/* Card Number */}
              <Input
                label="Número de Tarjeta"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardDetails.card_number)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  if (value.length <= 16) {
                    handleCardDetailChange('card_number', value);
                  }
                }}
                maxLength={19}
                required
                fullWidth
              />

              {/* Card Holder */}
              <Input
                label="Nombre del Titular"
                placeholder="Juan Pérez"
                value={cardDetails.card_holder}
                onChange={(e) => handleCardDetailChange('card_holder', e.target.value)}
                required
                fullWidth
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <Input
                  label="Fecha de Vencimiento"
                  placeholder="MM/AA"
                  value={formatExpiryDate(cardDetails.expiry_date)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      handleCardDetailChange('expiry_date', value);
                    }
                  }}
                  maxLength={5}
                  required
                />

                {/* CVV */}
                <Input
                  label="CVV"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      handleCardDetailChange('cvv', value);
                    }
                  }}
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Dirección de Facturación</h4>
            
            <div className="space-y-4">
              <Input
                label="Dirección"
                placeholder="Calle Principal 123"
                value={cardDetails.billing_address.street}
                onChange={(e) => handleCardDetailChange('billing_address.street', e.target.value)}
                required
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ciudad"
                  placeholder="Madrid"
                  value={cardDetails.billing_address.city}
                  onChange={(e) => handleCardDetailChange('billing_address.city', e.target.value)}
                  required
                />

                <Input
                  label="Provincia/Estado"
                  placeholder="Madrid"
                  value={cardDetails.billing_address.state}
                  onChange={(e) => handleCardDetailChange('billing_address.state', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Código Postal"
                  placeholder="28001"
                  value={cardDetails.billing_address.postal_code}
                  onChange={(e) => handleCardDetailChange('billing_address.postal_code', e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select
                    value={cardDetails.billing_address.country}
                    onChange={(e) => handleCardDetailChange('billing_address.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  >
                    <option value="ES">España</option>
                    <option value="US">Estados Unidos</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CL">Chile</option>
                    <option value="CO">Colombia</option>
                    <option value="PE">Perú</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {selectedMethod === 'paypal' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 text-center">
            <div className="text-6xl mb-4">🅿️</div>
            <h4 className="font-medium text-gray-900 mb-2">Pago con PayPal</h4>
            <p className="text-gray-600 mb-4">
              Serás redirigido a PayPal para completar tu pago de forma segura
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 text-blue-800 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Pago 100% seguro y protegido por PayPal</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Payment Summary */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Total a pagar:</span>
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            ${amount.toFixed(2)}
          </span>
        </div>
      </Card>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h5 className="font-medium text-green-900">Pago Seguro</h5>
            <p className="text-sm text-green-800 mt-1">
              Tu información está protegida con encriptación SSL de 256 bits y no almacenamos datos de tarjetas de crédito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};