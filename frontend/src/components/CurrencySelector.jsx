import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getCurrencySymbol } from '../utils/currencyFormatter';

const CurrencySelector = ({ value, onChange, className = '' }) => {
  const [currencies, setCurrencies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/currency/supported');
      setCurrencies(response.data.currencies);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Fallback currencies
      setCurrencies({
        'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp' },
        'USD': { name: 'US Dollar', symbol: '$' },
        'EUR': { name: 'Euro', symbol: '€' }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select 
        className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        disabled
      >
        <option>Loading currencies...</option>
      </select>
    );
  }

  return (
    <select 
      value={value} 
      onChange={onChange}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {Object.entries(currencies).map(([code, info]) => (
        <option key={code} value={code}>
          {code} - {info.symbol} ({info.name})
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;