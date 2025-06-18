import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PortfolioCharts = ({ assets, currentAllocation }) => {
  // Verifica se ci sono dati da mostrare
  if (!assets?.length) {
    return null;
  }

  // Colori per i grafici
  const colors = [
    'rgba(79, 70, 229, 0.8)', // Indigo
    'rgba(45, 212, 191, 0.8)', // Teal
    'rgba(251, 113, 133, 0.8)', // Rose
    'rgba(139, 92, 246, 0.8)', // Purple
    'rgba(34, 197, 94, 0.8)',  // Green
    'rgba(249, 115, 22, 0.8)', // Orange
    'rgba(236, 72, 153, 0.8)', // Pink
  ];

  // Prepara i dati per i grafici
  const labels = assets.map(asset => asset.name);
  const targetValues = assets.map(asset => parseFloat(asset.targetPercentage) || 0);
  
  // Calcola i valori attuali
  const currentValues = currentAllocation?.map(asset => asset.currentPercentage || 0) || 
    assets.map(() => 0);

  // Configurazione comune per i grafici a torta
  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `${context.label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Dati per il grafico allocazione target
  const targetData = {
    labels,
    datasets: [{
      data: targetValues,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.8', '1')),
      borderWidth: 1,
    }],
  };

  // Dati per il grafico allocazione attuale
  const currentData = {
    labels,
    datasets: [{
      data: currentValues,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.8', '1')),
      borderWidth: 1,
    }],
  };

  // Dati per il grafico di confronto
  const comparisonData = {
    labels,
    datasets: [
      {
        label: 'Allocazione Target',
        data: targetValues,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
      {
        label: 'Allocazione Attuale',
        data: currentValues,
        backgroundColor: 'rgba(45, 212, 191, 0.8)',
        borderColor: 'rgba(45, 212, 191, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 mt-8">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-full w-full">
        <h3 className="text-lg font-semibold mb-4 text-center">Allocazione Target</h3>
        <div className="relative h-64 w-full">
          <Pie data={targetData} options={pieOptions} />
        </div>
        {/* Lista percentuali target */}
        <div className="mt-4 space-y-2">
          {labels.map((label, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{label}:</span>
              <span className="font-medium">{targetValues[index]?.toFixed(1) || '0.0'}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-center">Allocazione Attuale</h3>
        <div className="h-64">
          <Pie data={currentData} options={pieOptions} />
        </div>
        {/* Lista percentuali attuali */}
        <div className="mt-4 space-y-2">
          {labels.map((label, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{label}:</span>
              <span className="font-medium">{currentValues[index]?.toFixed(1) || '0.0'}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-center">Confronto Allocazioni</h3>
        <div className="h-80">
          <Bar data={comparisonData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts; 