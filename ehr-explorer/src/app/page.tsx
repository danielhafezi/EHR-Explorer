'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Patient } from '@/utils/database';
import { Search, Loader2, UserCircle, Calendar, Users, Upload, AlertCircle, XCircle, CheckCircle } from 'lucide-react';

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000;
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch patients data
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients${searchQuery ? `?search=${searchQuery}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data.patients);
    } catch (err) {
      setError('Error loading patients. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  // Connect to the EventSource for real-time updates
  const connectEventSource = () => {
    // Clear any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      console.log('Connecting to event source...');
      const eventSource = new EventSource('/api/data-events');
      eventSourceRef.current = eventSource;
      
      // Listen for data change events
      eventSource.addEventListener('message', (event) => {
        console.log('Data change detected, refreshing patients list...');
        fetchPatients();
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current = 0;
      });
      
      // Handle connection opened
      eventSource.addEventListener('open', () => {
        console.log('EventSource connection established');
        reconnectAttemptsRef.current = 0;
      });
      
      // Handle errors
      eventSource.addEventListener('error', (e) => {
        console.error('Error in event source connection', e);
        eventSource.close();
        eventSourceRef.current = null;
        
        // Implement exponential backoff for reconnection
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectEventSource();
          }, delay);
        } else {
          console.error('Maximum reconnection attempts reached');
        }
      });
    } catch (err) {
      console.error('Failed to create EventSource:', err);
    }
  };

  // Setup event source for real-time updates
  useEffect(() => {
    connectEventSource();
    
    // Cleanup on component unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.name.endsWith('.json')) {
      setUploadStatus({
        type: 'error',
        message: 'Only JSON files are allowed'
      });
      return;
    }
    
    try {
      setUploading(true);
      setUploadStatus({ type: null, message: null });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-patient', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }
      
      setUploadStatus({
        type: 'success',
        message: `${file.name} uploaded successfully!`
      });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // We don't need to manually refresh the patients list here
      // as our file watcher will detect the new file and trigger an update
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload file'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear upload status after 5 seconds
  useEffect(() => {
    if (uploadStatus.type) {
      const timer = setTimeout(() => {
        setUploadStatus({ type: null, message: null });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Users className="h-7 w-7 mr-2 text-blue-500" />
          <h1 className="text-3xl font-bold text-black">Patient Directory</h1>
        </div>
        <p className="text-black mb-6">
          Select a patient to view their health records and AI-generated insights.
        </p>
        
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients by name..."
            className="w-full pl-10 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-700"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {/* File Upload Section */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center mb-2">
            <Upload className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-lg font-medium text-black">Upload Patient Data</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload Synthea patient JSON files to add them to the directory.
          </p>
          
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors">
              <span>{uploading ? 'Uploading...' : 'Select File'}</span>
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
                ref={fileInputRef}
              />
            </label>
            <div className="text-sm">
              {uploadStatus.type === 'success' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>{uploadStatus.message}</span>
                </div>
              )}
              {uploadStatus.type === 'error' && (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>{uploadStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <p className="mt-4 text-black">Loading patients...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>No patients found. Try a different search term or upload patient data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Link 
              href={`/patients/${patient.id}`} 
              key={patient.id}
              className="block"
            >
              <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 bg-white">
                <div className="flex items-center mb-3">
                  <UserCircle className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-black">{patient.formattedName || patient.name}</h2>
                </div>
                <div className="text-black text-sm space-y-1">
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Gender:</span>
                    <span>{patient.gender || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="w-12 font-medium">DOB:</span>
                    <span>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
