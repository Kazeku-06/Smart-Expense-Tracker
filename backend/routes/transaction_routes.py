from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Transaction, Category, User
from datetime import datetime
from sqlalchemy import func
from utils.currency_utils import get_cached_exchange_rate
from routes.notification_routes import check_budget_limit

transaction_bp = Blueprint('transactions', __name__)

@transaction_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Endpoint untuk mendapatkan semua transaksi user"""
    try:
        user_id = get_jwt_identity()
        
        category_id = request.args.get('category_id')
        month = request.args.get('month')
        
        query = Transaction.query.filter_by(user_id=user_id)
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        if month:
            year, month_num = map(int, month.split('-'))
            query = query.filter(
                db.extract('year', Transaction.date) == year,
                db.extract('month', Transaction.date) == month_num
            )
        
        transactions = query.order_by(Transaction.date.desc()).all()
        
        return jsonify({
            'transactions': [t.to_dict() for t in transactions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    """Endpoint untuk membuat transaksi baru"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('amount') or not data.get('description') or not data.get('category_id'):
            return jsonify({'error': 'Amount, description, dan category_id diperlukan'}), 400
        
        category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
        if not category:
            return jsonify({'error': 'Kategori tidak ditemukan'}), 404
        
        user = User.query.get(user_id)
        base_currency = user.base_currency if user else 'IDR'
        transaction_currency = data.get('currency', base_currency)
        
        from utils.currency_utils import CurrencyConverter
        supported_currencies = CurrencyConverter.get_supported_currencies()
        if transaction_currency not in supported_currencies:
            return jsonify({'error': 'Mata uang tidak didukung'}), 400
        
        if transaction_currency == base_currency:
            exchange_rate = 1.0
        else:
            exchange_rate = get_cached_exchange_rate(transaction_currency, base_currency)
            print(f"Transaction: {data['amount']} {transaction_currency} -> {float(data['amount']) * exchange_rate} {base_currency} (rate: {exchange_rate})")
        
        transaction = Transaction(
            amount=float(data['amount']),
            description=data['description'],
            category_id=data['category_id'],
            user_id=user_id,
            currency=transaction_currency,
            exchange_rate=exchange_rate
        )
        
        if data.get('date'):
            transaction.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        
        db.session.add(transaction)
        db.session.commit()
        
        converted_amount = float(data['amount']) * exchange_rate
        budget_status = check_budget_limit(user_id, converted_amount)
        
        response_data = {
            'message': 'Transaksi berhasil dibuat',
            'transaction': transaction.to_dict(),
            'budget_status': budget_status,
            'conversion_info': {
                'original_amount': float(data['amount']),
                'original_currency': transaction_currency,
                'converted_amount': converted_amount,
                'converted_currency': base_currency,
                'exchange_rate': exchange_rate
            }
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating transaction: {str(e)}")
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/transactions/<transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """Endpoint untuk mengupdate transaksi"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
        if not transaction:
            return jsonify({'error': 'Transaksi tidak ditemukan'}), 404
        
        user = User.query.get(user_id)
        base_currency = user.base_currency if user else 'IDR'
        
        if 'currency' in data:
            transaction_currency = data['currency']
            from utils.currency_utils import CurrencyConverter
            supported_currencies = CurrencyConverter.get_supported_currencies()
            if transaction_currency not in supported_currencies:
                return jsonify({'error': 'Mata uang tidak didukung'}), 400
            
            if transaction_currency == base_currency:
                exchange_rate = 1.0
            else:
                exchange_rate = get_cached_exchange_rate(transaction_currency, base_currency)
            
            transaction.currency = transaction_currency
            transaction.exchange_rate = exchange_rate
        
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'description' in data:
            transaction.description = data['description']
        if 'category_id' in data:
            category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
            if not category:
                return jsonify({'error': 'Kategori tidak ditemukan'}), 404
            transaction.category_id = data['category_id']
        if 'date' in data:
            transaction.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        
        transaction.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transaksi berhasil diupdate',
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/transactions/<transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    """Endpoint untuk menghapus transaksi"""
    try:
        user_id = get_jwt_identity()
        
        transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
        if not transaction:
            return jsonify({'error': 'Transaksi tidak ditemukan'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaksi berhasil dihapus'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/transactions/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Endpoint untuk mendapatkan ringkasan pengeluaran per kategori"""
    try:
        user_id = get_jwt_identity()
        month = request.args.get('month')
        
        if not month:
            return jsonify({'error': 'Parameter month (YYYY-MM) diperlukan'}), 400
        
        year, month_num = map(int, month.split('-'))
        
        summary = db.session.query(
            Category.name,
            Category.color,
            func.sum(Transaction.amount * Transaction.exchange_rate).label('total')
        ).join(Transaction).filter(
            Transaction.user_id == user_id,
            db.extract('year', Transaction.date) == year,
            db.extract('month', Transaction.date) == month_num
        ).group_by(Category.name, Category.color).all()
        
        total_expenses = sum(item.total for item in summary) if summary else 0
        
        categories_summary = []
        for item in summary:
            percentage = (item.total / total_expenses * 100) if total_expenses > 0 else 0
            categories_summary.append({
                'name': item.name,
                'color': item.color,
                'total': float(item.total),
                'percentage': round(percentage, 2)
            })
        
        return jsonify({
            'summary': categories_summary,
            'total_expenses': float(total_expenses),
            'month': month
        }), 200
        
    except Exception as e:
        print(f"Error in get_summary: {str(e)}")
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Endpoint untuk mendapatkan profil user termasuk base currency"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User tidak ditemukan'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Endpoint untuk mengupdate profil user"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User tidak ditemukan'}), 404
        
        if 'base_currency' in data:
            from utils.currency_utils import CurrencyConverter
            supported_currencies = CurrencyConverter.get_supported_currencies()
            if data['base_currency'] not in supported_currencies:
                return jsonify({'error': 'Mata uang tidak didukung'}), 400
            user.base_currency = data['base_currency']
        
        if 'budget_limit' in data:
            user.budget_limit = float(data['budget_limit'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profil berhasil diupdate',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500