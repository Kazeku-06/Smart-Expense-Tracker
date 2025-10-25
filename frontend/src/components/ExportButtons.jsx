import React, { useState } from 'react';
import api from '../utils/api';

const ExportButtons = () => {
  const [loading, setLoading] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleExport = async (type) => {
    try {
      setLoading(type);
      
     
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('start_date', dateRange.startDate);
      if (dateRange.endDate) params.append('end_date', dateRange.endDate);
      
      const response = await api.get(`/export/${type}?${params.toString()}`, {
        responseType: 'blob'
      });
      
      
      if (response.data.type && response.data.type === 'application/json') {
        const errorText = await new Response(response.data).text();
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Gagal mengunduh file ${type}`);
      }
      
     
      const blob = new Blob([response.data], { 
        type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
     
      const contentDisposition = response.headers['content-disposition'];
      let filename = `laporan_pengeluaran.${type}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        } else {
          const filenameMatch2 = contentDisposition.match(/filename=([^;]+)/);
          if (filenameMatch2) {
            filename = filenameMatch2[1];
          }
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      
      alert(`✅ File ${type.toUpperCase()} berhasil diunduh: ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      
      
      let errorMessage = error.message || `Gagal mengunduh file ${type.toUpperCase()}`;
      
      if (error.response) {
        try {
          const errorData = await error.response.data.text();
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.error || errorMessage;
        } catch (e) {
          
        }
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading('');
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Export Data</h3>
      
      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Selesai
          </label>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        {dateRange.startDate && dateRange.endDate 
          ? `Export data dari ${dateRange.startDate} hingga ${dateRange.endDate}`
          : 'Export semua data (kosongkan tanggal untuk semua data)'}
      </p>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleExport('pdf')}
          disabled={loading === 'pdf'}
          className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'pdf' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Membuat PDF...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Export PDF</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleExport('excel')}
          disabled={loading === 'excel'}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'excel' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Membuat Excel...</span>
            </>
          ) : (
            <>
              <span>📊</span>
              <span>Export Excel</span>
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tips:</strong> Kosongkan tanggal untuk mengexport semua data. 
          File akan berisi data transaksi dengan format yang rapi dan siap untuk dianalisa.
        </p>
      </div>
    </div>
  );
};

export default ExportButtons;