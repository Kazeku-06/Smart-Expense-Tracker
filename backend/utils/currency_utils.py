import requests
import json
from datetime import datetime, timedelta
import os
from models import db

class CurrencyConverter:
    """Utility class untuk handle currency conversion"""
    
    BASE_URL = "https://api.frankfurter.app"
    
    @staticmethod
    def get_exchange_rate(from_currency, to_currency):
        """Dapatkan exchange rate dari API"""
        try:
            # Frankfurter API gratis dan tidak memerlukan API key
            url = f"{CurrencyConverter.BASE_URL}/latest?from={from_currency}&to={to_currency}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data['rates'].get(to_currency, 1.0)
            else:
                print(f"API Error: {response.status_code}")
                return 1.0
                
        except Exception as e:
            print(f"Error getting exchange rate: {str(e)}")
            return 1.0
    
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
        return amount * rate

# Cache sederhana untuk exchange rates
exchange_cache = {}
CACHE_DURATION = 3600  # 1 jam

def get_cached_exchange_rate(from_currency, to_currency):
    """Dapatkan exchange rate dengan cache"""
    cache_key = f"{from_currency}_{to_currency}"
    current_time = datetime.now()
    
    if cache_key in exchange_cache:
        cached_data = exchange_cache[cache_key]
        if current_time - cached_data['timestamp'] < timedelta(seconds=CACHE_DURATION):
            return cached_data['rate']
    
    # Get fresh rate from API
    rate = CurrencyConverter.get_exchange_rate(from_currency, to_currency)
    exchange_cache[cache_key] = {
        'rate': rate,
        'timestamp': current_time
    }
    
    return rate