import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { meetingsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Meetings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: meetingsData, isLoading, error } = useQuery(
    ['meetings', { search: searchTerm, status: statusFilter, page: currentPage }],
    () => meetingsAPI.getAll({ 
      search: searchTerm, 
      status: statusFilter, 
      page: currentPage,
      limit: 10 
    }),
    { keepPreviousData: true }
  );

  const meetings = meetingsData?.data || [];
  const pagination = meetingsData?.pagination || {};

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-gray',
      published: 'badge-success',
      archived: 'badge-warning'
    };
    return badges[status] || 'badge-gray';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-gray',
      medium: 'badge-warning',
      high: 'badge-error'
    };
    return badges[priority] || 'badge-gray';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading meetings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading meetings</h3>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Manage and view all your meetings</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/meetings/create" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            {pagination.total || 0} meetings found
          </h3>
        </div>
        <div className="card-body p-0">
          {meetings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          <Link 
                            to={`/meetings/${meeting._id}`}
                            className="hover:text-primary-600"
                          >
                            {meeting.title}
                          </Link>
                        </h4>
                        <span className={`badge ${getStatusBadge(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {meeting.summary}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(meeting.meetingDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {meeting.participants?.length || 0} participants
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {meeting.actionItems?.length || 0} action items
                        </div>
                        {meeting.duration && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {meeting.duration} min
                          </div>
                        )}
                      </div>
                      
                      {meeting.tags && meeting.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {meeting.tags.map((tag, index) => (
                            <span key={index} className="badge badge-gray">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/meetings/${meeting._id}`}
                        className="btn-secondary btn-sm"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <button className="btn-secondary btn-sm">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search criteria.' 
                  : 'Get started by creating your first meeting.'
                }
              </p>
              <Link to="/meetings/create" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Link>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={!pagination.hasNext}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;
