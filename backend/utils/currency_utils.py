import requests
import json
from datetime import datetime, timedelta
import os

class CurrencyConverter:
    """Utility class untuk handle currency conversion"""
    
    BASE_URL = "https://api.frankfurter.app"
    
    @staticmethod
    def get_exchange_rate(from_currency, to_currency):
        """Dapatkan exchange rate dari API"""
        try:
            if from_currency == to_currency:
                return 1.0
                
            url = f"{CurrencyConverter.BASE_URL}/latest?from={from_currency}&to={to_currency}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                rate = data['rates'].get(to_currency, 1.0)
                print(f"Exchange rate {from_currency} to {to_currency}: {rate}")
                return rate
            else:
                print(f"API Error: {response.status_code}")
                return CurrencyConverter.get_fallback_rate(from_currency, to_currency)
                
        except Exception as e:
            print(f"Error getting exchange rate: {str(e)}")
            return CurrencyConverter.get_fallback_rate(from_currency, to_currency)
    
    @staticmethod
    def get_fallback_rate(from_currency, to_currency):
        """Fallback rates jika API error"""
        fallback_rates = {
            'USD_IDR': 15000,
            'EUR_IDR': 16500,
            'GBP_IDR': 19000,
            'JPY_IDR': 100,
            'SGD_IDR': 11000,
            'MYR_IDR': 3200,
            'AUD_IDR': 10000,
            'CAD_IDR': 11000,
            'CHF_IDR': 17000,
            'IDR_USD': 0.000067,
            'IDR_EUR': 0.000061,
            'IDR_GBP': 0.000053,
            'IDR_JPY': 0.01,
            'IDR_SGD': 0.000091,
            'IDR_MYR': 0.00031,
            'IDR_AUD': 0.00010,
            'IDR_CAD': 0.000091,
            'IDR_CHF': 0.000059
        }
        
        fallback_key = f"{from_currency}_{to_currency}"
        return fallback_rates.get(fallback_key, 1.0)
    
    @staticmethod
    def get_supported_currencies():
        """Daftar mata uang yang didukung"""
        return {
            'IDR': {'name': 'Indonesian Rupiah', 'symbol': 'Rp'},
            'USD': {'name': 'US Dollar', 'symbol': '$'},
            'EUR': {'name': 'Euro', 'symbol': '€'},
            'GBP': {'name': 'British Pound', 'symbol': '£'},
            'JPY': {'name': 'Japanese Yen', 'symbol': '¥'},
            'SGD': {'name': 'Singapore Dollar', 'symbol': 'S$'},
            'MYR': {'name': 'Malaysian Ringgit', 'symbol': 'RM'},
            'AUD': {'name': 'Australian Dollar', 'symbol': 'A$'},
            'CAD': {'name': 'Canadian Dollar', 'symbol': 'C$'},
            'CHF': {'name': 'Swiss Franc', 'symbol': 'CHF'}
        }
    
    @staticmethod
    def convert_amount(amount, from_currency, to_currency):
        """Konversi amount dari satu currency ke currency lain"""
        if from_currency == to_currency:
            return amount
        
        rate = CurrencyConverter.get_exchange_rate(from_currency, to_currency)
        converted = amount * rate
        print(f"Converted {amount} {from_currency} to {converted} {to_currency} (rate: {rate})")
        return converted

# Cache sederhana untuk exchange rates
exchange_cache = {}
CACHE_DURATION = 3600

def get_cached_exchange_rate(from_currency, to_currency):
    """Dapatkan exchange rate dengan cache"""
    if from_currency == to_currency:
        return 1.0
        
    cache_key = f"{from_currency}_{to_currency}"
    current_time = datetime.now()
    
    if cache_key in exchange_cache:
        cached_data = exchange_cache[cache_key]
        if current_time - cached_data['timestamp'] < timedelta(seconds=CACHE_DURATION):
            return cached_data['rate']
    
    rate = CurrencyConverter.get_exchange_rate(from_currency, to_currency)
    exchange_cache[cache_key] = {
        'rate': rate,
        'timestamp': current_time
    }
    
    return rate