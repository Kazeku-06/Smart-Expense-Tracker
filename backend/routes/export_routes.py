from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import io
from utils.export_utils import generate_pdf_report, generate_excel_report

export_bp = Blueprint('export', __name__)

@export_bp.route('/export/pdf', methods=['GET'])
@jwt_required()
def export_pdf():
    """Endpoint untuk export data ke PDF"""
    try:
        user_id = get_jwt_identity()
        
        # Get filter parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Parse dates
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else None
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None
        
        # Generate PDF
        pdf_buffer, filename = generate_pdf_report(start_date, end_date, user_id)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except ValueError as e:
        return jsonify({'error': 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'}), 400
    except Exception as e:
        return jsonify({'error': f'Gagal generate PDF: {str(e)}'}), 500

@export_bp.route('/export/excel', methods=['GET'])
@jwt_required()
def export_excel():
    """Endpoint untuk export data ke Excel"""
    try:
        user_id = get_jwt_identity()
        
        # Get filter parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Parse dates
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else None
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None
        
        # Generate Excel
        excel_buffer, filename = generate_excel_report(start_date, end_date, user_id)
        
        return send_file(
            excel_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except ValueError as e:
        return jsonify({'error': 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'}), 400
    except Exception as e:
        return jsonify({'error': f'Gagal generate Excel: {str(e)}'}), 500

@export_bp.route('/export/test', methods=['GET'])
@jwt_required()
def test_export():
    """Endpoint untuk test export functionality"""
    try:
        user_id = get_jwt_identity()
        
        # Count user transactions for testing
        from models import Transaction
        transaction_count = Transaction.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'message': 'Export functionality is working',
            'user_id': user_id,
            'transaction_count': transaction_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500