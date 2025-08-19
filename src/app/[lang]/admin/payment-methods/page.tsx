'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiX, FiCreditCard, FiGlobe, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/modules/store';
import { 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod 
} from '@/modules/private/admin/actions';
import { fetchWithdrawalData } from '@/modules/public/withdrawal_methods/actions';

interface PaymentMethod {
    _id?: string;
    id: string;
    name: string;
    image: string;
    status: 'active' | 'inactive' | 'maintenance';
    message?: string;
    fee: string;
    estimatedTime: string;
    category: 'Mobile Banking' | 'Crypto';
    minAmount: number;
    maxAmount: number;
    currency: string;
    paymentType?: 'manual' | 'auto';
    autoConfig?: {
        provider?: 'binance' | 'ethers' | 'tron' | 'custom';
        apiKey?: string;
        apiSecret?: string;
        walletPrivateKey?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export default function AdminPaymentMethods() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    
    // Redux selectors
    const { methods, loading, error } = useSelector((state: RootState) => state.public.withdrawal_methods);
    const { paymentMethodsLoading, paymentMethodsError } = useSelector((state: RootState) => state.private.admin);
    
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMethod, setNewMethod] = useState<PaymentMethod>({
        id: '',
        name: '',
        image: '',
        status: 'active',
        message: '',
        fee: '0.1%',
        estimatedTime: '30-60 minutes',
        category: 'Mobile Banking',
        minAmount: 50,
        maxAmount: 100000,
        currency: 'BDT',
        paymentType: 'manual',
        autoConfig: { provider: 'binance', apiKey: '', apiSecret: '', walletPrivateKey: '' }
    });

    // Fetch payment methods on component mount
    useEffect(() => {
        dispatch(fetchWithdrawalData() as any);
    }, [dispatch]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (paymentMethodsError) {
            toast.error(paymentMethodsError);
        }
    }, [error, paymentMethodsError]);

    const handleAddMethod = async () => {
        try {
            dispatch(createPaymentMethod(newMethod));
            setShowAddForm(false);
            setNewMethod({
                id: '',
                name: '',
                image: '',
                status: 'active',
                message: '',
                fee: '0.1%',
                estimatedTime: '30-60 minutes',
                category: 'Mobile Banking',
                minAmount: 50,
                maxAmount: 100000,
                currency: 'BDT'
            });
            toast.success('Payment method added successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to add payment method');
        }
    };

    const handleUpdateMethod = async (method: PaymentMethod) => {
        if (!method.id) {
            toast.error('Invalid payment method ID');
            return;
        }

        try {
            dispatch(updatePaymentMethod(method.id, method));
            setEditingMethod(null);
            toast.success('Payment method updated successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update payment method');
        }
    };

    const handleDeleteMethod = async (id: string) => {
        if (!id) {
            toast.error('Invalid payment method ID');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this payment method?')) return;

        try {
            dispatch(deletePaymentMethod(id));
            toast.success('Payment method deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete payment method');
        }
    };

    const getStatusColor = (status: PaymentMethod['status']) => {
        switch (status) {
            case 'active':
                return 'text-green-500 bg-green-500/10';
            case 'inactive':
                return 'text-red-500 bg-red-500/10';
            case 'maintenance':
                return 'text-yellow-500 bg-yellow-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusText = (status: PaymentMethod['status']) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'inactive':
                return 'Inactive';
            case 'maintenance':
                return 'Maintenance';
            default:
                return 'Unknown';
        }
    };

    const isLoading = loading || paymentMethodsLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
                            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Payment Methods</h1>
                    <p className="text-gray-400">Manage your available payment options</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Method
                </button>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {methods.map((method) => (
                <motion.div 
                        key={method._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-600"
                                >
                                    <img 
                                        src={method.image} 
                                        alt={method.name}
                                        className="w-8 h-8 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/default-payment.png';
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{method.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(method.status)}`}>
                                        {getStatusText(method.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingMethod(method)}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => method._id && handleDeleteMethod(method._id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                    disabled={!method._id}
                                >
                                    <FiTrash2 className="w-4 h-4" />
                    </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Category:</span>
                                <span className="text-white">{method.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Fee:</span>
                                <span className="text-white">{method.fee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Processing Time:</span>
                                <span className="text-white">{method.estimatedTime}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Min Amount:</span>
                                <span className="text-white">{method.minAmount} {method.currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Max Amount:</span>
                                <span className="text-white">{method.maxAmount} {method.currency}</span>
                            </div>
                            {method.message && (
                                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-400 text-sm">{method.message}</p>
                                </div>
                            )}
                        </div>
                </motion.div>
                ))}
            </div>

            {/* Add Method Modal */}
                <AnimatePresence>
                {showAddForm && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white">Add Payment Method</h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                                        </div>
                                        
                            <form onSubmit={(e) => { e.preventDefault(); handleAddMethod(); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newMethod.name}
                                        onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                            </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        value={newMethod.image}
                                        onChange={(e) => setNewMethod({...newMethod, image: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        required
                                                            />
                                                        </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <select
                                        value={newMethod.category}
                                        onChange={(e) => setNewMethod({...newMethod, category: e.target.value as any})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Mobile Banking">Mobile Banking</option>
                                        <option value="Crypto">Crypto</option>
                                    </select>
                                            </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select
                                        value={newMethod.status}
                                        onChange={(e) => setNewMethod({...newMethod, status: e.target.value as any})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                        </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Message (Optional)</label>
                                    <input
                                        type="text"
                                        value={newMethod.message}
                                        onChange={(e) => setNewMethod({...newMethod, message: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Maintenance message..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                            <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
                                        <input
                                            type="number"
                                            value={newMethod.minAmount}
                                            onChange={(e) => setNewMethod({...newMethod, minAmount: Number(e.target.value)})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                                                    </div>
                                                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
                                        <input
                                            type="number"
                                            value={newMethod.maxAmount}
                                            onChange={(e) => setNewMethod({...newMethod, maxAmount: Number(e.target.value)})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
            </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Fee</label>
                            <input
                                type="text"
                                            value={newMethod.fee}
                                            onChange={(e) => setNewMethod({...newMethod, fee: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            placeholder="0.1%"
                                            required
                            />
                            </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                            <input
                                type="text"
                                            value={newMethod.currency}
                                            onChange={(e) => setNewMethod({...newMethod, currency: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            placeholder="BDT"
                                            required
                            />
                            </div>
                            </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Processing Time</label>
                                    <input
                                        type="text"
                                        value={newMethod.estimatedTime}
                                        onChange={(e) => setNewMethod({ ...newMethod, estimatedTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="30-60 minutes"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Payment Type</label>
                                        <select
                                            value={newMethod.paymentType}
                                            onChange={(e) => setNewMethod({ ...newMethod, paymentType: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Auto Provider</label>
                                        <select
                                            value={newMethod.autoConfig?.provider}
                                            onChange={(e) => setNewMethod({ ...newMethod, autoConfig: { ...(newMethod.autoConfig || {}), provider: e.target.value as any } })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            disabled={newMethod.paymentType !== 'auto'}
                                        >
                                            <option value="binance">Binance</option>
                                            <option value="ethers">Ethers (EVM)</option>
                                            <option value="tron">TRON</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                </div>

                                {newMethod.paymentType === 'auto' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">API Key / Private Key</label>
                                            <input
                                                type="text"
                                                value={newMethod.autoConfig?.apiKey || ''}
                                                onChange={(e) => setNewMethod({ ...newMethod, autoConfig: { ...(newMethod.autoConfig || {}), apiKey: e.target.value } })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                placeholder="Enter API Key or Private Key"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">API Secret (optional)</label>
                                            <input
                                                type="password"
                                                value={newMethod.autoConfig?.apiSecret || ''}
                                                onChange={(e) => setNewMethod({ ...newMethod, autoConfig: { ...(newMethod.autoConfig || {}), apiSecret: e.target.value } })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                placeholder="Enter API Secret"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                <button
                                        type="button"
                                    onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add Method
                                </button>
                            </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Method Modal */}
            <AnimatePresence>
                {editingMethod && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white">Edit Payment Method</h2>
                            <button
                                    onClick={() => setEditingMethod(null)}
                                    className="text-gray-400 hover:text-white"
                            >
                                    <FiX className="w-6 h-6" />
                            </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleUpdateMethod(editingMethod); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                        value={editingMethod.name}
                                        onChange={(e) => setEditingMethod({...editingMethod, name: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        required
                                />
                            </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        value={editingMethod.image}
                                        onChange={(e) => setEditingMethod({...editingMethod, image: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <select
                                        value={editingMethod.category}
                                        onChange={(e) => setEditingMethod({...editingMethod, category: e.target.value as any})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Mobile Banking">Mobile Banking</option>
                                        <option value="Crypto">Crypto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select
                                        value={editingMethod.status}
                                        onChange={(e) => setEditingMethod({...editingMethod, status: e.target.value as any})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Message (Optional)</label>
                                    <input
                                        type="text"
                                        value={editingMethod.message || ''}
                                        onChange={(e) => setEditingMethod({...editingMethod, message: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Maintenance message..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
                                        <input
                                            type="number"
                                            value={editingMethod.minAmount}
                                            onChange={(e) => setEditingMethod({...editingMethod, minAmount: Number(e.target.value)})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
                                        <input
                                            type="number"
                                            value={editingMethod.maxAmount}
                                            onChange={(e) => setEditingMethod({...editingMethod, maxAmount: Number(e.target.value)})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Fee</label>
                                        <input
                                            type="text"
                                            value={editingMethod.fee}
                                            onChange={(e) => setEditingMethod({...editingMethod, fee: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            placeholder="0.1%"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                                    <input
                                            type="text"
                                            value={editingMethod.currency}
                                            onChange={(e) => setEditingMethod({...editingMethod, currency: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            placeholder="BDT"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Processing Time</label>
                                    <input
                                        type="text"
                                        value={editingMethod.estimatedTime}
                                        onChange={(e) => setEditingMethod({...editingMethod, estimatedTime: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="30-60 minutes"
                                        required
                                    />
                        </div>

                                <div className="flex gap-3 pt-4">
                            <button
                                        type="button"
                                        onClick={() => setEditingMethod(null)}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                        Update Method
                            </button>
                    </div>
                            </form>
                        </motion.div>
                    </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
} 