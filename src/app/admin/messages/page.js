'use client';

import { useState, useEffect } from 'react';
import DataTable from '../../../components/admin/DataTable';
import { Send, MessageSquare, AlertCircle, Info } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    priority: 'info',
    startDate: '',
    endDate: '',
    sendFCM: false
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/admin/messages?${params}`);
      const data = await response.json();
      
      setMessages(data.messages || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchMessages(page);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Message sent successfully! FCM: ${result.fcmSent ? 'Yes' : 'No'}`);
        setFormData({
          message: '',
          priority: 'info',
          startDate: '',
          endDate: '',
          sendFCM: false
        });
        setShowForm(false);
        fetchMessages();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'message',
      label: 'Message',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-gray-400">
            Sent by {row.sentBy?.name || 'Unknown'} on {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getPriorityIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(value)}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'fcmSent',
      label: 'FCM',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Sent' : 'Not Sent'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Messages</h1>
          <p className="mt-1 text-sm text-gray-400">
            Send platform-wide notifications and announcements to all users
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {/* Message Form */}
      {showForm && (
        <div className="glass p-6 rounded-lg shadow-sm border border-transparent hover:border-accent transition-all">
          <h3 className="text-lg font-medium text-white mb-4">Send Platform Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full border border-accent rounded-md px-3 py-2 text-sm bg-transparent text-white focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="Enter your platform message..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.message.length}/500 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send FCM Push
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sendFCM}
                    onChange={(e) => setFormData({ ...formData, sendFCM: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Send push notification to all users
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-accent rounded-md text-sm font-medium text-white bg-transparent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages Table */}
      <DataTable
        data={messages}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
        showSearch={false}
      />
    </div>
  );
} 