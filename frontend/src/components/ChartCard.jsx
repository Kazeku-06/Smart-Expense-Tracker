import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { currencyFormatter } from '../utils/currencyFormatter';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartCard = ({ summary, currency = 'IDR' }) => {
  if (!summary || summary.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Ringkasan Pengeluaran</h3>
        <div className="text-center text-gray-500 py-8">
          Tidak ada data transaksi untuk bulan ini
        </div>
      </div>
    );
  }

  const data = {
    labels: summary.map(item => item.name),
    datasets: [
      {
        data: summary.map(item => item.total),
        backgroundColor: summary.map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${currencyFormatter(value, currency)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">
        Ringkasan Pengeluaran per Kategori
        <span className="text-sm font-normal text-gray-500 ml-2">
          (dalam {currency})
        </span>
      </h3>
      <div className="h-80">
        <Pie data={data} options={options} />
      </div>
      
      {/* Detail Summary */}
      <div className="mt-6 space-y-2">
        {summary.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {currencyFormatter(item.total, currency)}
              </div>
              <div className="text-xs text-gray-500">
                {item.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartCard;