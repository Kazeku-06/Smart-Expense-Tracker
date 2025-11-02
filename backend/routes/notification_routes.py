from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Transaction, BudgetNotification
from datetime import datetime
from sqlalchemy import extract, func

notification_bp = Blueprint('notifications', __name__)

def check_budget_limit(user_id, transaction_amount=0):
    """Cek apakah pengeluaran sudah mendekati/melampaui budget limit"""
    try:
        user = User.query.get(user_id)
        if not user or user.budget_limit <= 0:
            return None
        
        # Hitung total pengeluaran bulan ini
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        monthly_expenses = db.session.query(func.sum(Transaction.amount * Transaction.exchange_rate)).filter(
            Transaction.user_id == user_id,
            extract('year', Transaction.date) == current_year,
            extract('month', Transaction.date) == current_month
        ).scalar() or 0
        
        # Tambahkan transaksi baru jika ada
        total_with_new = monthly_expenses + transaction_amount
        
        budget_limit = user.budget_limit
        percentage = (total_with_new / budget_limit) * 100 if budget_limit > 0 else 0
        
        # Cek kondisi notifikasi
        notifications = []
        
        if percentage >= 100:
            notifications.append({
                'type': 'danger',
                'message': f'⚠️ Budget terlampaui! Pengeluaran {percentage:.1f}% dari budget bulanan (Rp {total_with_new:,.0f} / Rp {budget_limit:,.0f})',
                'percentage': percentage
            })
        elif percentage >= 90:
            notifications.append({
                'type': 'warning', 
                'message': f'💰 Budget hampir habis! Pengeluaran {percentage:.1f}% dari budget bulanan (Rp {total_with_new:,.0f} / Rp {budget_limit:,.0f})',
                'percentage': percentage
            })
        elif percentage >= 80:
            notifications.append({
                'type': 'info',
                'message': f'📊 Pengeluaran {percentage:.1f}% dari budget bulanan (Rp {total_with_new:,.0f} / Rp {budget_limit:,.0f})',
                'percentage': percentage
            })
        
        return {
            'budget_limit': budget_limit,
            'current_spending': total_with_new,
            'percentage': percentage,
            'notifications': notifications
        }
        
    except Exception as e:
        print(f"Error checking budget: {str(e)}")
        return None

@notification_bp.route('/notifications/budget-check', methods=['GET'])
@jwt_required()
def get_budget_status():
    """Endpoint untuk mendapatkan status budget"""
    try:
        user_id = get_jwt_identity()
        budget_status = check_budget_limit(user_id)
        
        if budget_status:
            return jsonify(budget_status), 200
        else:
            return jsonify({
                'budget_limit': 0,
                'current_spending': 0,
                'percentage': 0,
                'notifications': []
            }), 200
            
    except Exception as e:
        return jsonify({'error': f'Gagal memeriksa budget: {str(e)}'}), 500

@notification_bp.route('/notifications/budget-limit', methods=['PUT'])
@jwt_required()
def set_budget_limit():
    """Endpoint untuk mengatur budget limit"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or data.get('budget_limit') is None:
            return jsonify({'error': 'Budget limit diperlukan'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User tidak ditemukan'}), 404
        
        user.budget_limit = float(data['budget_limit'])
        db.session.commit()
        
        # Cek status budget setelah update
        budget_status = check_budget_limit(user_id)
        
        return jsonify({
            'message': 'Budget limit berhasil diupdate',
            'budget_limit': user.budget_limit,
            'budget_status': budget_status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Gagal mengatur budget limit: {str(e)}'}), 500

@notification_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Endpoint untuk mendapatkan notifikasi"""
    try:
        user_id = get_jwt_identity()
        
        notifications = BudgetNotification.query.filter_by(
            user_id=user_id
        ).order_by(BudgetNotification.created_at.desc()).limit(10).all()
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Gagal mengambil notifikasi: {str(e)}'}), 500