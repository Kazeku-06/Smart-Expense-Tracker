from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Transaction, Category
from datetime import datetime

transaction_bp = Blueprint('transactions', __name__)

@transaction_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Endpoint untuk mendapatkan semua transaksi user"""
    try:
        user_id = get_jwt_identity()
        
        # Filter by category jika ada
        category_id = request.args.get('category_id')
        # Filter by bulan jika ada
        month = request.args.get('month')
        
        query = Transaction.query.filter_by(user_id=user_id)
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        if month:
            # Format: YYYY-MM
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
        
        # Validasi input
        if not data or not data.get('amount') or not data.get('description') or not data.get('category_id'):
            return jsonify({'error': 'Amount, description, dan category_id diperlukan'}), 400
        
        # Validasi category
        category = Category.query.filter_by(id=data['category_id'], user_id=user_id).first()
        if not category:
            return jsonify({'error': 'Kategori tidak ditemukan'}), 404
        
        # Buat transaksi baru
        transaction = Transaction(
            amount=float(data['amount']),
            description=data['description'],
            category_id=data['category_id'],
            user_id=user_id
        )
        
        # Set tanggal jika disediakan
        if data.get('date'):
            transaction.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaksi berhasil dibuat',
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@transaction_bp.route('/transactions/<transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """Endpoint untuk mengupdate transaksi"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Cari transaksi
        transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
        if not transaction:
            return jsonify({'error': 'Transaksi tidak ditemukan'}), 404
        
        # Update fields
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'description' in data:
            transaction.description = data['description']
        if 'category_id' in data:
            # Validasi category
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
        
        # Cari transaksi
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
        
        # Query untuk mendapatkan total pengeluaran per kategori
        from sqlalchemy import func
        summary = db.session.query(
            Category.name,
            Category.color,
            func.sum(Transaction.amount).label('total')
        ).join(Transaction).filter(
            Transaction.user_id == user_id,
            db.extract('year', Transaction.date) == year,
            db.extract('month', Transaction.date) == month_num
        ).group_by(Category.name, Category.color).all()
        
        # Hitung total semua pengeluaran
        total_expenses = sum(item.total for item in summary)
        
        # Format response
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
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500