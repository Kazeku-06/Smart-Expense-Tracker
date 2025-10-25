from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.auth_routes import auth_bp
from routes.transaction_routes import transaction_bp
from routes.category_routes import category_bp
from routes.export_routes import export_bp  
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """Factory function untuk membuat Flask app"""
    app = Flask(__name__)
    
    # Konfigurasi
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key-change-in-production')
    
    # Inisialisasi extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)  
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')
    app.register_blueprint(category_bp, url_prefix='/api')
    app.register_blueprint(export_bp, url_prefix='/api')  
    
    # Route untuk health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Smart Expense Tracker API is running'})
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint tidak ditemukan'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Terjadi kesalahan internal server'}), 500
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)