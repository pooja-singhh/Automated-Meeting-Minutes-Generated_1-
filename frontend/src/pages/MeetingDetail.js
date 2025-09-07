import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Edit,
  ArrowLeft,
  FileText,
  Tag
} from 'lucide-react';
import { meetingsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MeetingDetail = () => {
  const { id } = useParams();
  
  const { data: meeting, isLoading, error } = useQuery(
    ['meeting', id],
    () => meetingsAPI.getById(id),
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading meeting..." />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Meeting not found</h3>
        <p className="text-gray-600 mb-4">The meeting you're looking for doesn't exist.</p>
        <Link to="/meetings" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meetings
        </Link>
      </div>
    );
  }

  const meetingData = meeting.data;

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

  const downloadMinutes = () => {
    // In a real app, this would generate and download the minutes
    const minutes = `MEETING MINUTES\n================\n\nTitle: ${meetingData.title}\nDate: ${new Date(meetingData.meetingDate).toLocaleDateString()}\nDuration: ${meetingData.duration || 'N/A'} minutes\n\nPARTICIPANTS:\n${meetingData.participants.map(p => `- ${p.name}${p.email ? ` (${p.email})` : ''}`).join('\n')}\n\nSUMMARY:\n${meetingData.summary}\n\nACTION ITEMS:\n${meetingData.actionItems.map((item, index) => `${index + 1}. ${item.task}\n   Assigned to: ${item.person || 'Unassigned'}\n   Deadline: ${item.deadline || 'No deadline'}\n   Status: ${item.status}\n   Priority: ${item.priority}\n`).join('\n')}`;
    
    const blob = new Blob([minutes], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minutes-${meetingData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/meetings" className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meetingData.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`badge ${getStatusBadge(meetingData.status)}`}>
                {meetingData.status}
              </span>
              <span className="text-sm text-gray-600">
                {new Date(meetingData.meetingDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button onClick={downloadMinutes} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <Link to={`/meetings/${id}/edit`} className="btn-primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Meeting Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Meeting Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(meetingData.meetingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {meetingData.duration ? `${meetingData.duration} minutes` : 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="font-medium text-gray-900">
                  {meetingData.participants?.length || 0} people
                </p>
              </div>
            </div>
          </div>
          
          {meetingData.tags && meetingData.tags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {meetingData.tags.map((tag, index) => (
                  <span key={index} className="badge badge-gray">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      {meetingData.participants && meetingData.participants.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetingData.participants.map((participant, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{participant.name}</p>
                    {participant.email && (
                      <p className="text-sm text-gray-600">{participant.email}</p>
                    )}
                    {participant.role && (
                      <p className="text-xs text-gray-500">{participant.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Meeting Summary</h3>
        </div>
        <div className="card-body">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{meetingData.summary}</p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
            <span className="badge badge-primary">
              {meetingData.actionItems?.length || 0} items
            </span>
          </div>
        </div>
        <div className="card-body">
          {meetingData.actionItems && meetingData.actionItems.length > 0 ? (
            <div className="space-y-4">
              {meetingData.actionItems.map((item, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{item.task}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {item.person && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {item.person}
                            </div>
                          )}
                          {item.deadline && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {item.deadline}
                            </div>
                          )}
                          <span className={`badge ${getPriorityBadge(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className={`badge ${
                            item.status === 'completed' ? 'badge-success' : 
                            item.status === 'in_progress' ? 'badge-warning' : 'badge-gray'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No action items</h3>
              <p className="text-gray-600">No action items were identified in this meeting.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transcript */}
      {meetingData.transcript && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Full Transcript</h3>
          </div>
          <div className="card-body">
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {meetingData.transcript}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetail;
