from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.auth_routes import auth_bp
from routes.transaction_routes import transaction_bp
from routes.category_routes import category_bp
from routes.export_routes import export_bp
from routes.notification_routes import notification_bp
from routes.currency_routes import currency_bp
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key-change-in-production')
    
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')
    app.register_blueprint(category_bp, url_prefix='/api')
    app.register_blueprint(export_bp, url_prefix='/api')
    app.register_blueprint(notification_bp, url_prefix='/api')
    app.register_blueprint(currency_bp, url_prefix='/api')
    
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Smart Expense Tracker API is running'})
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint tidak ditemukan'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Terjadi kesalahan internal server'}), 500
    
    with app.app_context():
        try:
            import sqlite3
            conn = sqlite3.connect('db.sqlite3')
            cursor = conn.cursor()
            
            cursor.execute("PRAGMA table_info(user)")
            user_columns = [column[1] for column in cursor.fetchall()]
            
            if 'budget_limit' not in user_columns:
                print("Auto-migration: Menambah kolom budget_limit...")
                cursor.execute('ALTER TABLE user ADD COLUMN budget_limit FLOAT DEFAULT 0.0')
            
            if 'base_currency' not in user_columns:
                print("Auto-migration: Menambah kolom base_currency...")  
                cursor.execute('ALTER TABLE user ADD COLUMN base_currency VARCHAR(3) DEFAULT "IDR"')
            
            cursor.execute("PRAGMA table_info(transaction)")
            transaction_columns = [column[1] for column in cursor.fetchall()]
            
            if 'currency' not in transaction_columns:
                print("Auto-migration: Menambah kolom currency...")
                cursor.execute('ALTER TABLE transaction ADD COLUMN currency VARCHAR(3) DEFAULT "IDR"')
            
            if 'exchange_rate' not in transaction_columns:
                print("Auto-migration: Menambah kolom exchange_rate...")
                cursor.execute('ALTER TABLE transaction ADD COLUMN exchange_rate FLOAT DEFAULT 1.0')
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS budget_notification (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user (id)
                )
            """)
            
            conn.commit()
            conn.close()
            print("✅ Auto-migration completed!")
            
        except Exception as e:
            print(f"⚠️ Auto-migration skipped: {e}")
        
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)