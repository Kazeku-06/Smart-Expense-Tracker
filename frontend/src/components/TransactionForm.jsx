import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CurrencySelector from './CurrencySelector';
import { getCurrencySymbol } from '../utils/currencyFormatter';
import toast from 'react-hot-toast';

const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    currency: 'IDR',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [userCurrency, setUserCurrency] = useState('IDR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchUserProfile();
    
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        category_id: transaction.category_id,
        currency: transaction.currency || 'IDR',
        date: transaction.date.split('T')[0]
      });
    }
  }, [transaction]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
      
      // Set default category jika tidak ada transaksi
      if (!transaction && response.data.categories.length > 0) {
        setFormData(prev => ({
          ...prev,
          category_id: response.data.categories[0].id
        }));
      }
    } catch (err) {
      setError('Gagal memuat kategori');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profile');
      const baseCurrency = response.data.user.base_currency || 'IDR';
      setUserCurrency(baseCurrency);
      
      // Set default currency ke base currency user jika membuat transaksi baru
      if (!transaction) {
        setFormData(prev => ({
          ...prev,
          currency: baseCurrency
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      let response;
      if (transaction) {
        // Update transaksi
        response = await api.put(`/transactions/${transaction.id}`, payload);
        toast.success('Transaksi berhasil diupdate');
      } else {
        // Buat transaksi baru
        response = await api.post('/transactions', payload);
        
        // Show budget notifications if any
        if (response.data.budget_status && response.data.budget_status.notifications) {
          response.data.budget_status.notifications.forEach(notification => {
            if (notification.type === 'danger') {
              toast.error(notification.message, { duration: 6000 });
            } else if (notification.type === 'warning') {
              toast.warning(notification.message, { duration: 5000 });
            } else {
              toast.success(notification.message, { duration: 4000 });
            }
          });
        } else {
          toast.success('Transaksi berhasil dibuat');
        }
      }

      onSave();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Terjadi kesalahan';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`0.00 (${getCurrencySymbol(formData.currency)})`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi transaksi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Uang
              </label>
              <CurrencySelector
                value={formData.currency}
                onChange={(e) => handleChange({ target: { name: 'currency', value: e.target.value } })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Base currency Anda: <span className="font-medium">{userCurrency}</span>
                {formData.currency !== userCurrency && (
                  <span className="text-blue-600 ml-1">
                    (akan dikonversi otomatis ke {userCurrency})
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ringkasan Transaksi:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Jumlah:</span>
                  <span className="font-medium">
                    {getCurrencySymbol(formData.currency)} {formData.amount || '0'}
                  </span>
                </div>
                {formData.currency !== userCurrency && (
                  <div className="flex justify-between text-blue-600">
                    <span>Konversi ke {userCurrency}:</span>
                    <span className="font-medium">
                      {getCurrencySymbol(userCurrency)} ...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="font-medium">
                    {categories.find(cat => cat.id === formData.category_id)?.name || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;