// Utility untuk format currency
export const currencyFormatter = (amount, currency = 'IDR') => {
  const formatters = {
    'IDR': new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    'USD': new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }),
    'EUR': new Intl.NumberFormat('de-DE', {
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2
    }),
    'GBP': new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }),
    'JPY': new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }),
    'SGD': new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2
    }),
    'MYR': new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }),
    'AUD': new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD', 
      minimumFractionDigits: 2
    }),
    'CAD': new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }),
    'CHF': new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    })
  };

  const formatter = formatters[currency] || formatters['IDR'];
  return formatter.format(amount);
};

export const getCurrencySymbol = (currency = 'IDR') => {
  const symbols = {
    'IDR': 'Rp',
    'USD': '$',
    'EUR': '€', 
    'GBP': '£',
    'JPY': '¥',
    'SGD': 'S$',
    'MYR': 'RM',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF'
  };
  
  return symbols[currency] || 'Rp';
};