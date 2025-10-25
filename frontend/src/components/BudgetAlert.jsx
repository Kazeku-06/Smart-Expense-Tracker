import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { currencyFormatter } from '../utils/currencyFormatter';

const BudgetAlert = () => {
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState('');

  useEffect(() => {
    fetchBudgetStatus();
  }, []);

  const fetchBudgetStatus = async () => {
    try {
      const response = await api.get('/notifications/budget-check');
      setBudgetStatus(response.data);
    } catch (error) {
      console.error('Error fetching budget status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await api.put('/notifications/budget-limit', {
        budget_limit: parseFloat(budgetLimit)
      });
      setShowBudgetModal(false);
      setBudgetLimit('');
      fetchBudgetStatus(); // Refresh status
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Gagal mengatur budget limit');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!budgetStatus || budgetStatus.budget_limit <= 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">💰</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Atur Budget Bulanan
              </h3>
              <p className="text-sm text-blue-600">
                Tambahkan budget limit untuk mendapatkan notifikasi pengeluaran
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Atur Budget
          </button>
        </div>
      </div>
    );
  }

  const { budget_limit, current_spending, percentage, notifications } = budgetStatus;

  // Progress bar color based on percentage
  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 90) return 'bg-orange-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertType = (percent) => {
    if (percent >= 100) return 'danger';
    if (percent >= 90) return 'warning';
    if (percent >= 80) return 'info';
    return 'success';
  };

  const alertType = getAlertType(percentage);
  const alertConfig = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '🔴'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200', 
      text: 'text-orange-800',
      icon: '🟠'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: '🔵'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '🟢'
    }
  };

  const config = alertConfig[alertType] || alertConfig.info;

  return (
    <>
      <div className={`${config.bg} ${config.border} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{config.icon}</span>
            <div>
              <h3 className={`text-sm font-medium ${config.text}`}>
                Budget Tracking
              </h3>
              <p className={`text-sm ${config.text} opacity-80`}>
                {currencyFormatter(current_spending)} / {currencyFormatter(budget_limit)}
                {' '}({percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Edit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor(percentage)} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mt-3 space-y-2">
            {notifications.map((notification, index) => (
              <div 
                key={index}
                className={`text-sm ${
                  notification.type === 'danger' ? 'text-red-700 bg-red-100' :
                  notification.type === 'warning' ? 'text-orange-700 bg-orange-100' :
                  'text-blue-700 bg-blue-100'
                } px-3 py-2 rounded`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Atur Budget Bulanan</h2>
              
              <form onSubmit={handleSetBudget}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Limit Bulanan
                  </label>
                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan budget limit"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBudgetModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetAlert;