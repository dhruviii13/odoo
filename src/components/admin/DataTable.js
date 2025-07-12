'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function DataTable({
  data = [],
  columns = [],
  pagination = null,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = true,
  showDownload = false,
  onDownload,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="glass shadow-sm rounded-2xl border border-transparent hover:border-accent transition-all">
      {/* Header with search and actions */}
      <div className="px-6 py-4 border-b border-accent/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-accent rounded-md focus:ring-2 focus:ring-accent focus:border-accent w-64 bg-transparent text-white placeholder:text-gray-400"
                />
              </div>
            )}
          </div>
          {showDownload && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 border border-accent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-accent hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-accent/20">
          <thead className="bg-transparent">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-accent uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-accent/10">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-accent/5 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 border-t border-accent/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center px-3 py-2 border border-accent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-accent/20 hover:bg-accent/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-gray-300">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="inline-flex items-center px-3 py-2 border border-accent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-accent/20 hover:bg-accent/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 