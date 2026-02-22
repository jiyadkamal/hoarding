'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, Shield, Loader2 } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { confirmPayment } from '@/lib/firebase/firestore';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    bookingId: string;
    amount: number;
}

type PaymentStep = 'details' | 'processing' | 'success';

export default function PaymentModal({
    isOpen,
    onClose,
    onSuccess,
    bookingId,
    amount
}: PaymentModalProps) {
    const [step, setStep] = useState<PaymentStep>('details');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStep('processing');

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            // Confirm payment in Firestore
            await confirmPayment(bookingId);
            setStep('success');

            // Wait for success animation
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (error) {
            console.error('Payment error:', error);
            setStep('details');
        }
    };

    const resetModal = () => {
        setStep('details');
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setCardName('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={step === 'processing' ? () => { } : resetModal}
            title={step === 'success' ? 'Payment Successful' : 'Complete Payment'}
            size="md"
            showClose={step !== 'processing'}
        >
            <AnimatePresence mode="wait">
                {step === 'details' && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-1"
                    >
                        {/* Amount Summary */}
                        <div className="relative p-7 mb-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            {/* Accent Bar */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Amount to Pay
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-emerald-600">₹</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <CreditCard className="w-7 h-7" />
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Card Number"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                icon={<CreditCard className="w-4 h-4" />}
                                required
                            />

                            <Input
                                label="Cardholder Name"
                                placeholder="John Doe"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Expiry Date"
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                    maxLength={5}
                                    required
                                />
                                <Input
                                    label="CVV"
                                    placeholder="123"
                                    type="password"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    maxLength={3}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-4">
                                <Shield className="w-4 h-4" />
                                <span>Your payment information is secure and encrypted</span>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="secondary" fullWidth onClick={resetModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" fullWidth>
                                    Pay ₹{amount.toLocaleString()}
                                </Button>
                            </div>
                        </form>

                        {/* Demo Note */}
                        <p className="text-xs text-center text-slate-400 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            🎭 This is a demo payment. No real transaction will occur.
                            <br />
                            Use any card details to proceed.
                        </p>
                    </motion.div>
                )}

                {step === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-12 text-center"
                    >
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            Processing Payment
                        </h3>
                        <p className="text-sm text-slate-500">
                            Please wait while we confirm your payment...
                        </p>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-12 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center"
                        >
                            <Check className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            Payment Successful!
                        </h3>
                        <p className="text-sm text-slate-500">
                            Your booking has been confirmed.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
}
