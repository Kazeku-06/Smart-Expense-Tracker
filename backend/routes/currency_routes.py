from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Transaction
from utils.currency_utils import CurrencyConverter, get_cached_exchange_rate
from datetime import datetime

currency_bp = Blueprint('currency', __name__)

@currency_bp.route('/currency/supported', methods=['GET'])
def get_supported_currencies():
    """Endpoint untuk mendapatkan daftar mata uang yang didukung"""
    try:
        currencies = CurrencyConverter.get_supported_currencies()
        return jsonify({'currencies': currencies}), 200
    except Exception as e:
        return jsonify({'error': f'Gagal mengambil daftar mata uang: {str(e)}'}), 500

@currency_bp.route('/currency/exchange-rate', methods=['GET'])
def get_exchange_rate():
    """Endpoint untuk mendapatkan exchange rate"""
    try:
        from_currency = request.args.get('from', 'USD')
        to_currency = request.args.get('to', 'IDR')
        
        rate = get_cached_exchange_rate(from_currency, to_currency)
        
        return jsonify({
            'from_currency': from_currency,
            'to_currency': to_currency,
            'exchange_rate': rate,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Gagal mengambil exchange rate: {str(e)}'}), 500

@currency_bp.route('/currency/base-currency', methods=['PUT'])
@jwt_required()
def set_base_currency():
    """Endpoint untuk mengatur base currency user"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('base_currency'):
            return jsonify({'error': 'Base currency diperlukan'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User tidak ditemukan'}), 404
        
        # Validasi currency
        supported_currencies = CurrencyConverter.get_supported_currencies()
        if data['base_currency'] not in supported_currencies:
            return jsonify({'error': 'Mata uang tidak didukung'}), 400
        
        user.base_currency = data['base_currency']
        db.session.commit()
        
        return jsonify({
            'message': 'Base currency berhasil diupdate',
            'base_currency': user.base_currency
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Gagal mengatur base currency: {str(e)}'}), 500

@currency_bp.route('/currency/convert', methods=['POST'])
@jwt_required()
def convert_amount():
    """Endpoint untuk konversi amount"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or data.get('amount') is None or not data.get('from_currency') or not data.get('to_currency'):
            return jsonify({'error': 'Amount, from_currency, dan to_currency diperlukan'}), 400
        
        amount = float(data['amount'])
        from_currency = data['from_currency']
        to_currency = data['to_currency']
        
        converted_amount = CurrencyConverter.convert_amount(amount, from_currency, to_currency)
        
        return jsonify({
            'original_amount': amount,
            'original_currency': from_currency,
            'converted_amount': converted_amount,
            'converted_currency': to_currency,
            'exchange_rate': converted_amount / amount if amount > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Gagal mengkonversi amount: {str(e)}'}), 500