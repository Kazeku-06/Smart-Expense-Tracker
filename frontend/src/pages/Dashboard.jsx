import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ChartCard from '../components/ChartCard';
import BudgetAlert from '../components/BudgetAlert';
import { currencyFormatter } from '../utils/currencyFormatter';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [userCurrency, setUserCurrency] = useState('IDR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const summaryResponse = await api.get(`/transactions/summary?month=${selectedMonth}`);
      setSummary(summaryResponse.data);
      
      const transactionsResponse = await api.get(`/transactions?month=${selectedMonth}`);
      setRecentTransactions(transactionsResponse.data.transactions.slice(0, 5));
      
    } catch (err) {
      setError('Gagal memuat data dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUserCurrency(response.data.user.base_currency || 'IDR');
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-600">Memuat dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Ringkasan pengeluaran bulanan Anda</p>
              <p className="text-sm text-blue-600 mt-1">Mata uang dasar: <strong>{userCurrency}</strong></p>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">Pilih Bulan:</label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <BudgetAlert />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Pengeluaran</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {summary ? currencyFormatter(summary.total_expenses, userCurrency) : currencyFormatter(0, userCurrency)}
              </dd>
              <p className="text-xs text-gray-500 mt-1">Dalam {userCurrency}</p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Jumlah Kategori</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{summary ? summary.summary.length : '0'}</dd>
              <p className="text-xs text-gray-500 mt-1">Kategori digunakan</p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Transaksi Terbaru</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{recentTransactions.length}</dd>
              <p className="text-xs text-gray-500 mt-1">5 transaksi terakhir</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Pengeluaran per Kategori
              <span className="text-sm font-normal text-gray-500 ml-2">(dalam {userCurrency})</span>
            </h3>
            <ChartCard summary={summary?.summary} currency={userCurrency} />
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
            
            {recentTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Belum ada transaksi untuk bulan ini</div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: transaction.category_color }}></div>
                      <div>
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.category_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">- {currencyFormatter(transaction.amount, transaction.currency)}</div>
                      <div className="text-xs text-gray-500">{transaction.currency} • {new Date(transaction.date).toLocaleDateString('id-ID')}</div>
                      {transaction.currency !== userCurrency && (
                        <div className="text-xs text-blue-600">≈ {currencyFormatter(transaction.amount * transaction.exchange_rate, userCurrency)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <a href="/transactions" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Lihat semua transaksi →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;