from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint untuk registrasi user baru"""
    try:
        data = request.get_json()
        
        # Validasi input
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, dan password diperlukan'}), 400
        
        # Cek apakah username atau email sudah ada
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username sudah digunakan'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email sudah digunakan'}), 400
        
        # Buat user baru
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Buat default categories untuk user baru
        default_categories = [
            {'name': 'Makanan & Minuman', 'color': '#EF4444'},
            {'name': 'Transportasi', 'color': '#3B82F6'},
            {'name': 'Belanja', 'color': '#10B981'},
            {'name': 'Hiburan', 'color': '#8B5CF6'},
            {'name': 'Kesehatan', 'color': '#06B6D4'},
            {'name': 'Lainnya', 'color': '#6B7280'}
        ]
        
        from models import Category
        for cat_data in default_categories:
            category = Category(
                name=cat_data['name'],
                color=cat_data['color'],
                user_id=user.id
            )
            db.session.add(category)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User berhasil dibuat',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint untuk login user"""
    try:
        data = request.get_json()
        
        # Validasi input
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username dan password diperlukan'}), 400
        
        # Cari user
        user = User.query.filter_by(username=data['username']).first()
        
        # Verifikasi user dan password
        if user and user.check_password(data['password']):
            # Buat JWT token
            access_token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(days=7)
            )
            
            return jsonify({
                'message': 'Login berhasil',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Username atau password salah'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Endpoint untuk mendapatkan profil user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User tidak ditemukan'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500