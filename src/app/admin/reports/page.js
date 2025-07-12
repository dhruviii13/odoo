'use client';

import { useState } from 'react';
import { Download, FileText, Users, Activity, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    {
      id: 'users',
      name: 'Users Report',
      description: 'Complete list of all registered users with their details',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'swaps',
      name: 'Swaps Report',
      description: 'All swap requests and their current status',
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      id: 'skills',
      name: 'Skills Report',
      description: 'Analysis of skills offered and wanted across the platform',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      id: 'summary',
      name: 'Summary Report',
      description: 'Platform statistics and key metrics overview',
      icon: BarChart3,
      color: 'bg-indigo-500'
    }
  ];

  const handleGenerateReport = async (type, format = 'json') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        format
      });

      if (format === 'csv') {
        // For CSV, trigger download directly
        window.open(`/api/admin/reports?${params}`, '_blank');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();
      
      setReportData({
        type,
        data: data.data,
        filename: data.filename,
        generatedAt: data.generatedAt
      });
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (type, format = 'csv') => {
    const params = new URLSearchParams({
      type,
      format
    });
    window.open(`/api/admin/reports?${params}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Generate and download comprehensive reports about platform activity
        </p>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className="glass p-6 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${report.color}`}>
                <report.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{report.name}</h3>
                <p className="text-sm text-gray-400">{report.description}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleGenerateReport(report.id, 'json')}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Preview'}
              </button>
              <button
                onClick={() => handleDownloadReport(report.id, 'csv')}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="glass p-6 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-white">
                {reportTypes.find(r => r.id === reportData.type)?.name} Preview
              </h3>
              <p className="text-sm text-gray-400">
                Generated on {new Date(reportData.generatedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDownloadReport(reportData.type, 'csv')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            {reportData.type === 'summary' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.data.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-white">{item.metric}</h4>
                    <p className="text-2xl font-bold text-indigo-600">{item.value}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {reportData.data.length > 0 && 
                      Object.keys(reportData.data[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, valueIndex) => (
                        <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof value === 'string' && value.length > 50 
                            ? `${value.substring(0, 50)}...` 
                            : String(value)
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {reportData.data.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing first 10 rows of {reportData.data.length} total records. 
                Download the full report for complete data.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="glass p-6 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all mt-6">
        <h3 className="text-lg font-medium text-white mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {reportTypes.length}
            </div>
            <div className="text-sm text-gray-400">Report Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">CSV</div>
            <div className="text-sm text-gray-400">Download Format</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">JSON</div>
            <div className="text-sm text-gray-400">Preview Format</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">Real-time</div>
            <div className="text-sm text-gray-400">Data Freshness</div>
          </div>
        </div>
      </div>
    </div>
  );
} 