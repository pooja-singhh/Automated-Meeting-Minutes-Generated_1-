import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Plus,
  Users,
  AlertTriangle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { usersAPI, meetingsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    () => usersAPI.getDashboard(),
    { refetchInterval: 30000 }
  );

  const { data: statsData, isLoading: statsLoading } = useQuery(
    'userStats',
    () => usersAPI.getStats(),
    { refetchInterval: 30000 }
  );

  if (dashboardLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const stats = statsData?.data || {};
  const dashboard = dashboardData?.data || {};
  const recentMeetings = dashboard.recentMeetings || [];
  const upcomingMeetings = dashboard.upcomingMeetings || [];

  const statCards = [
    {
      title: 'Total Meetings',
      value: stats.totalMeetings || 0,
      icon: Calendar,
      color: 'primary',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Action Items',
      value: stats.totalActionItems || 0,
      icon: CheckCircle,
      color: 'success',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Completed',
      value: stats.completedActionItems || 0,
      icon: TrendingUp,
      color: 'success',
      change: `${stats.completionRate || 0}%`,
      changeType: 'neutral'
    },
    {
      title: 'Pending',
      value: stats.pendingActionItems || 0,
      icon: Clock,
      color: 'warning',
      change: '-5%',
      changeType: 'negative'
    }
  ];

  const getStatCardColor = (color) => {
    const colors = {
      primary: 'bg-primary-50 text-primary-600',
      success: 'bg-success-50 text-success-600',
      warning: 'bg-warning-50 text-warning-600',
      error: 'bg-error-50 text-error-600'
    };
    return colors[color] || colors.primary;
  };

  const getChangeColor = (type) => {
    const colors = {
      positive: 'text-success-600',
      negative: 'text-error-600',
      neutral: 'text-gray-600'
    };
    return colors[type] || colors.neutral;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your meetings.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/meetings/create" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${getStatCardColor(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Meetings</h3>
                <Link 
                  to="/meetings" 
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentMeetings.length > 0 ? (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(meeting.meetingDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="badge badge-gray">
                            {meeting.actionItems?.length || 0} action items
                          </span>
                          <span className={`badge ${
                            meeting.status === 'published' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/meetings/${meeting._id}`}
                        className="btn-secondary btn-sm"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first meeting.</p>
                  <Link to="/meetings/create" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Upcoming */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <Link to="/meetings/create" className="w-full btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Link>
              <Link to="/meetings" className="w-full btn-secondary">
                <FileText className="h-4 w-4 mr-2" />
                View All Meetings
              </Link>
              <Link to="/profile" className="w-full btn-secondary">
                <Users className="h-4 w-4 mr-2" />
                Manage Profile
              </Link>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
            </div>
            <div className="card-body">
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{meeting.title}</h4>
                        <p className="text-xs text-gray-600">
                          {new Date(meeting.meetingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No upcoming meetings</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Items Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Action Items Summary</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-success-600">
                    {stats.completedActionItems || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium text-warning-600">
                    {stats.inProgressActionItems || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-gray-600">
                    {stats.pendingActionItems || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <span className="text-sm font-medium text-error-600">
                    {stats.overdueActionItems || 0}
                  </span>
                </div>
              </div>
              
              {stats.overdueActionItems > 0 && (
                <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-error-600 mr-2" />
                    <span className="text-sm text-error-800">
                      You have {stats.overdueActionItems} overdue action items
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Chart Placeholder */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Productivity Overview</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="card-body">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization coming soon</p>
              <p className="text-sm text-gray-500">Track your meeting productivity over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
