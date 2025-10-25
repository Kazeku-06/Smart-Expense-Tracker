import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TransactionForm from '../components/TransactionForm';
import ExportButtons from '../components/ExportButtons';  

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [selectedCategory, selectedMonth]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = `/transactions?month=${selectedMonth}`;
      
      if (selectedCategory) {
        url += `&category_id=${selectedCategory}`;
      }
      
      const response = await api.get(url);
      setTransactions(response.data.transactions);
    } catch (err) {
      setError('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Gagal memuat kategori');
    }
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      await api.delete(`/transactions/${transactionId}`);
      fetchTransactions(); // Refresh list
    } catch (err) {
      setError('Gagal menghapus transaksi');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchTransactions(); // Refresh list
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Transaksi</h1>
          <p className="text-gray-600 mt-2">
            Kelola semua transaksi pengeluaran Anda
          </p>
        </div>

        {/* Export Buttons - NEW */}
        <ExportButtons />

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Kategori:
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Bulan:
                </label>
                <input
                  type="month"
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 self-start"
            >
              + Tambah Transaksi
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Daftar Transaksi</h2>
            <div className="text-lg font-medium text-red-600">
              Total: {formatCurrency(totalAmount)}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada transaksi untuk filter yang dipilih
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Deskripsi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Kategori</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Jumlah</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {transaction.description}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: transaction.category_color }}
                          ></div>
                          {transaction.category_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-red-600">
                        - {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            transaction={editingTransaction}
            onSave={handleFormSave}
            onCancel={handleFormClose}
          />
        )}
      </div>
    </div>
  );
};

export default Transactions;