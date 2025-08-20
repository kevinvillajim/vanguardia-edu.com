import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { enrollmentService } from '../../../services/enrollment/enrollmentService';
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from '../../../shared/components/ui/Input/Input';

interface CouponInputProps {
  courseId: number;
  onCouponApplied: (couponData: any) => void;
  onError: (error: string) => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  courseId,
  onCouponApplied,
  onError
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [showInput, setShowInput] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplying(true);
    onError('');

    try {
      const response = await enrollmentService.applyCoupon(courseId, couponCode.trim());
      
      if (response.valid) {
        setAppliedCoupon(response);
        onCouponApplied(response);
        setShowInput(false);
      } else {
        onError('Cupón inválido o expirado');
      }
    } catch (error: any) {
      onError(error.message || 'Error aplicando el cupón');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setShowInput(false);
    // Reset pricing to original
    onCouponApplied({
      original_price: appliedCoupon.original_price,
      final_price: appliedCoupon.original_price,
      discount_type: null,
      discount_value: 0,
      coupon_details: { code: '' }
    });
  };

  const formatDiscount = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <span>🎟️</span>
          Cupón de Descuento
        </h4>
        
        {!appliedCoupon && !showInput && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(true)}
          >
            Agregar Cupón
          </Button>
        )}
      </div>

      <AnimatePresence>
        {appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600 font-mono font-medium">
                    {appliedCoupon.coupon_details.code}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    -{formatDiscount(appliedCoupon.discount_type, appliedCoupon.discount_value)} OFF
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  {appliedCoupon.coupon_details.description || 'Cupón aplicado exitosamente'}
                </p>
                <div className="text-sm text-green-600 mt-1">
                  Ahorro: <span className="font-medium">
                    ${(appliedCoupon.original_price - appliedCoupon.final_price).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:text-green-700"
              >
                ✕
              </Button>
            </div>
          </motion.div>
        )}

        {showInput && !appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex gap-3">
              <Input
                placeholder="Ingresa tu código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="flex-1"
              />
              
              <Button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isApplying}
                loading={isApplying}
                variant="primary"
              >
                {isApplying ? 'Verificando...' : 'Aplicar'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => {
                  setShowInput(false);
                  setCouponCode('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
              
              <p className="text-gray-500">
                Los cupones no son sensibles a mayúsculas/minúsculas
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!appliedCoupon && !showInput && (
        <p className="text-sm text-gray-500">
          ¿Tienes un cupón de descuento? Úsalo para obtener un precio especial.
        </p>
      )}
    </div>
  );
};