'use client';

import { useState, useEffect } from 'react';
import DataTable from '../../../components/admin/DataTable';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AdminSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async (page = 1, search = '', status = '', skill = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (skill) params.append('skill', skill);

      const response = await fetch(`/api/admin/swaps?${params}`);
      const data = await response.json();
      
      setSwaps(data.swaps || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchSwaps(page, searchTerm, statusFilter, skillFilter);
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchSwaps(1, search, statusFilter, skillFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchSwaps(1, searchTerm, status, skillFilter);
  };

  const handleSkillFilter = (skill) => {
    setSkillFilter(skill);
    fetchSwaps(1, searchTerm, statusFilter, skill);
  };

  const handleUpdateSwapStatus = async (swapId, newStatus, reason = '') => {
    try {
      const response = await fetch('/api/admin/swaps', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          swapId,
          status: newStatus,
          reason
        }),
      });

      if (response.ok) {
        alert(`Swap ${newStatus} successfully`);
        // Refresh the swaps list
        fetchSwaps(pagination?.page || 1, searchTerm, statusFilter, skillFilter);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating swap:', error);
      alert('Failed to update swap status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'users',
      label: 'Users',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">
            {row.fromUser?.name || 'Unknown'} → {row.toUser?.name || 'Unknown'}
          </div>
          <div className="text-sm text-gray-400">
            {row.fromUser?.email} → {row.toUser?.email}
          </div>
        </div>
      )
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">
            {row.offeredSkill} ↔ {row.requestedSkill}
          </div>
          {row.message && (
            <div className="text-sm text-gray-400 mt-1">
              "{row.message}"
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <span className="text-sm text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateSwapStatus(row._id, 'accepted')}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </button>
              <button
                onClick={() => handleUpdateSwapStatus(row._id, 'rejected')}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Swap Monitoring</h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor and moderate all swap activity between users
        </p>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border border-accent rounded-md px-3 py-2 text-sm bg-transparent text-white focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Skill Filter
            </label>
            <input
              type="text"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => handleSkillFilter(e.target.value)}
              className="border border-accent rounded-md px-3 py-2 text-sm bg-transparent text-white focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Swaps Table */}
      <DataTable
        data={swaps}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Search swaps..."
        loading={loading}
      />
    </div>
  );
} 