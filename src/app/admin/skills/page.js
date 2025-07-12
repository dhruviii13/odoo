'use client';

import { useState, useEffect } from 'react';
import DataTable from '../../../components/admin/DataTable';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async (search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/skills?${params}`);
      const data = await response.json();
      
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchSkills(search);
  };

  const handleRemoveSkill = async (skillName) => {
    if (!confirm(`Are you sure you want to remove the skill "${skillName}" from all users?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill: skillName }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully removed "${skillName}" from ${result.removedCount} users`);
        // Refresh the skills list
        fetchSkills(searchTerm);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      alert('Failed to remove skill');
    }
  };

  const columns = [
    {
      key: 'skill',
      label: 'Skill Name',
      render: (value) => (
        <div className="font-medium text-white">{value}</div>
      )
    },
    {
      key: 'count',
      label: 'Usage Count',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value} users
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRemoveSkill(row.skill)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            title={`Remove "${row.skill}" from all users`}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Skill Moderation</h1>
        <p className="mt-1 text-sm text-gray-400">
          Review and remove inappropriate or spammy skill descriptions from user profiles
        </p>
      </div>

      {/* Warning Banner */}
      <div className="glass p-4 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-300">
              Important Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-200">
              <p>
                Removing a skill will delete it from all users' profiles (both offered and wanted skills). 
                This action cannot be undone. Please review carefully before removing any skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <DataTable
        data={skills}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search skills..."
        loading={loading}
        showSearch={true}
      />

      {/* Statistics */}
      {skills.length > 0 && (
        <div className="glass p-4 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all mt-6">
          <h3 className="text-lg font-medium text-white mb-2">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total Unique Skills</p>
              <p className="text-2xl font-bold text-white">{skills.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Most Used Skill</p>
              <p className="text-lg font-medium text-white">
                {skills[0]?.skill || 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Skill Usage</p>
              <p className="text-2xl font-bold text-white">
                {skills.reduce((sum, skill) => sum + skill.count, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 