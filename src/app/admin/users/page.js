'use client';

import { useState, useEffect } from 'react';
import DataTable from '../../../components/admin/DataTable';
import { Ban, UserCheck, Eye } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banFilter, setBanFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, search = '', role = '', isBanned = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (isBanned !== '') params.append('isBanned', isBanned);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page, searchTerm, roleFilter, banFilter);
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchUsers(1, search, roleFilter, banFilter);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    fetchUsers(1, searchTerm, role, banFilter);
  };

  const handleBanFilter = (isBanned) => {
    setBanFilter(isBanned);
    fetchUsers(1, searchTerm, roleFilter, isBanned);
  };

  const handleBanUser = async (userId, isBanned, reason = '') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isBanned,
          banReason: reason
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (err) {
        // If not JSON, try to get text (could be HTML error page)
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        data = { error: 'Unexpected server error. Please check server logs.' };
      }

      if (!response.ok) {
        alert(`Error: ${data?.error || 'Failed to update user'}`);
        return;
      }
      // Refresh the users list
      fetchUsers(pagination?.page || 1, searchTerm, roleFilter, banFilter);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-gray-400">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'skillsCount',
      label: 'Skills',
      render: (value) => (
        <span className="text-sm text-white">{value}</span>
      )
    },
    {
      key: 'isBanned',
      label: 'Status',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {value ? 'Banned' : 'Active'}
          </span>
          {value && row.banReason && (
            <span className="text-xs text-gray-500" title={row.banReason}>
              ⚠️
            </span>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
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
          <button
            onClick={() => handleBanUser(row._id, !row.isBanned)}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
              row.isBanned
                ? 'text-green-700 bg-green-100 hover:bg-green-200'
                : 'text-red-700 bg-red-100 hover:bg-red-200'
            }`}
          >
            {row.isBanned ? (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                Unban
              </>
            ) : (
              <>
                <Ban className="h-3 w-3 mr-1" />
                Ban
              </>
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage user accounts, view profiles, and moderate user activity
        </p>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="border border-accent rounded-md px-3 py-2 text-sm bg-transparent text-white focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Status Filter
            </label>
            <select
              value={banFilter}
              onChange={(e) => handleBanFilter(e.target.value)}
              className="border border-accent rounded-md px-3 py-2 text-sm bg-transparent text-white focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Search users by name or email..."
        loading={loading}
      />
    </div>
  );
} 