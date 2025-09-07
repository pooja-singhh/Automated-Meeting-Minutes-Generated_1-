import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useMutation } from 'react-query';
import { 
  Upload, 
  FileText, 
  Mic, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader,
  Calendar,
  Users,
  Tag
} from 'lucide-react';
import { uploadAPI, meetingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    duration: '',
    participants: [{ name: '', email: '', role: '' }],
    tags: []
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const uploadMutation = useMutation(uploadAPI.uploadFile, {
    onSuccess: (response) => {
      setUploadedFile(response.data);
      setIsUploading(false);
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  });

  const createMeetingMutation = useMutation(meetingsAPI.create, {
    onSuccess: (response) => {
      toast.success('Meeting created successfully');
      navigate(`/meetings/${response.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create meeting');
    }
  });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...formData.participants];
    newParticipants[index][field] = value;
    setFormData(prev => ({
      ...prev,
      participants: newParticipants
    }));
  };

  const addParticipant = () => {
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, { name: '', email: '', role: '' }]
    }));
  };

  const removeParticipant = (index) => {
    if (formData.participants.length > 1) {
      const newParticipants = formData.participants.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        participants: newParticipants
      }));
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.meetingDate) {
      newErrors.meetingDate = 'Meeting date is required';
    }
    
    if (!uploadedFile && !formData.description.trim()) {
      newErrors.description = 'Either upload a file or provide a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const meetingData = {
      ...formData,
      transcript: uploadedFile ? 'File uploaded - processing...' : formData.description,
      summary: 'Processing...',
      actionItems: [],
      participants: formData.participants.filter(p => p.name.trim()),
      meetingDate: new Date(formData.meetingDate).toISOString()
    };
    
    createMeetingMutation.mutate(meetingData);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Meeting</h1>
        <p className="text-gray-600">Upload a meeting file or enter details manually</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Upload Meeting File</h3>
            <p className="text-sm text-gray-600">Upload audio files (MP3, WAV) or text files</p>
          </div>
          <div className="card-body">
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader className="h-12 w-12 text-primary-600 mx-auto animate-spin" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Uploading...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                      </p>
                      <p className="text-gray-600">or click to browse</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports MP3, WAV, M4A, and TXT files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                  <div>
                    <p className="font-medium text-success-900">{uploadedFile.originalName}</p>
                    <p className="text-sm text-success-700">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeUploadedFile}
                  className="text-success-600 hover:text-success-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Meeting Details</h3>
          </div>
          <div className="card-body space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="label">
                Meeting Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="Enter meeting title"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description (if no file uploaded) */}
            {!uploadedFile && (
              <div>
                <label htmlFor="description" className="label">
                  Meeting Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  placeholder="Enter meeting transcript or description..."
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            )}

            {/* Date and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="meetingDate" className="label">
                  Meeting Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    id="meetingDate"
                    name="meetingDate"
                    className={`input pl-10 ${errors.meetingDate ? 'input-error' : ''}`}
                    value={formData.meetingDate}
                    onChange={handleChange}
                  />
                </div>
                {errors.meetingDate && (
                  <p className="mt-1 text-sm text-error-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.meetingDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="duration" className="label">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  className="input"
                  placeholder="60"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="label mb-0">Participants</label>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="btn-secondary btn-sm"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Add Participant
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.participants.map((participant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      className="input"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="input"
                      value={participant.email}
                      onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                    />
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Role"
                        className="input rounded-r-none"
                        value={participant.role}
                        onChange={(e) => handleParticipantChange(index, 'role', e.target.value)}
                      />
                      {formData.participants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParticipant(index)}
                          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="label">
                Tags
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Type a tag and press Enter"
                  className="input"
                  onKeyDown={handleTagAdd}
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/meetings')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMeetingMutation.isLoading}
            className="btn-primary"
          >
            {createMeetingMutation.isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              'Create Meeting'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMeeting;
