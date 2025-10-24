from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Category

category_bp = Blueprint('categories', __name__)

@category_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Endpoint untuk mendapatkan semua kategori user"""
    try:
        user_id = get_jwt_identity()
        
        categories = Category.query.filter_by(user_id=user_id).order_by(Category.name).all()
        
        return jsonify({
            'categories': [c.to_dict() for c in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@category_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """Endpoint untuk membuat kategori baru"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validasi input
        if not data or not data.get('name'):
            return jsonify({'error': 'Nama kategori diperlukan'}), 400
        
        # Cek apakah kategori dengan nama yang sama sudah ada
        existing_category = Category.query.filter_by(name=data['name'], user_id=user_id).first()
        if existing_category:
            return jsonify({'error': 'Kategori dengan nama tersebut sudah ada'}), 400
        
        # Buat kategori baru
        category = Category(
            name=data['name'],
            description=data.get('description', ''),
            color=data.get('color', '#6B7280'),
            user_id=user_id
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Kategori berhasil dibuat',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@category_bp.route('/categories/<category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Endpoint untuk mengupdate kategori"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Cari kategori
        category = Category.query.filter_by(id=category_id, user_id=user_id).first()
        if not category:
            return jsonify({'error': 'Kategori tidak ditemukan'}), 404
        
        # Update fields
        if 'name' in data:
            # Cek duplikat nama
            existing = Category.query.filter_by(name=data['name'], user_id=user_id).first()
            if existing and existing.id != category_id:
                return jsonify({'error': 'Kategori dengan nama tersebut sudah ada'}), 400
            category.name = data['name']
        
        if 'description' in data:
            category.description = data['description']
        if 'color' in data:
            category.color = data['color']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Kategori berhasil diupdate',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

@category_bp.route('/categories/<category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Endpoint untuk menghapus kategori"""
    try:
        user_id = get_jwt_identity()
        
        # Cari kategori
        category = Category.query.filter_by(id=category_id, user_id=user_id).first()
        if not category:
            return jsonify({'error': 'Kategori tidak ditemukan'}), 404
        
        # Cek apakah kategori digunakan oleh transaksi
        if category.transactions:
            return jsonify({
                'error': 'Tidak dapat menghapus kategori yang masih digunakan oleh transaksi'
            }), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Kategori berhasil dihapus'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500