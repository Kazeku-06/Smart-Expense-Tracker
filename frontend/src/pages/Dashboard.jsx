import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ChartCard from '../components/ChartCard';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary data
      const summaryResponse = await api.get(`/transactions/summary?month=${selectedMonth}`);
      setSummary(summaryResponse.data);
      
      // Fetch recent transactions
      const transactionsResponse = await api.get(`/transactions?month=${selectedMonth}&limit=5`);
      setRecentTransactions(transactionsResponse.data.transactions.slice(0, 5));
      
    } catch (err) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Ringkasan pengeluaran bulanan Anda
        </p>
        
        {/* Month Selector */}
        <div className="mt-4">
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Bulan:
          </label>
          <input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Pengeluaran</h3>
          <p className="text-3xl font-bold">
            {summary ? formatCurrency(summary.total_expenses) : 'Rp 0'}
          </p>
          <p className="text-blue-100 text-sm mt-2">
            Bulan {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Jumlah Kategori</h3>
          <p className="text-3xl font-bold">
            {summary ? summary.summary.length : '0'}
          </p>
          <p className="text-green-100 text-sm mt-2">
            Kategori pengeluaran
          </p>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Transaksi Terbaru</h3>
          <p className="text-3xl font-bold">
            {recentTransactions.length}
          </p>
          <p className="text-purple-100 text-sm mt-2">
            5 transaksi terakhir
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div>
          <ChartCard summary={summary?.summary} />
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Transaksi Terbaru</h3>
          
          {recentTransactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Belum ada transaksi untuk bulan ini
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: transaction.category_color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.category_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      - {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <a 
              href="/transactions" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Lihat semua transaksi →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;