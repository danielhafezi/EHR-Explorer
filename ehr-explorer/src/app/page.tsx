'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Patient } from '@/utils/database';
import { Search, Loader2, UserCircle, Calendar, Users, Upload, AlertCircle, XCircle, CheckCircle, Info } from 'lucide-react';

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
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Patient Directory</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          Browse patients in our database or add new ones to the system
        </p>
        
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search patients by name..."
            className="w-full pl-12 p-4 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-muted-foreground transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {/* File Upload Section */}
        <div className="mb-10 p-8 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Upload Patient Data</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Upload patient JSON files to add them to the directory.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group w-full sm:w-auto">
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-all border border-transparent hover:shadow-md">
                <Upload className="h-4 w-4" />
                <span className="font-medium">{uploading ? 'Uploading...' : 'Select File'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  ref={fileInputRef}
                />
              </label>
            </div>
            
            <div className="text-sm mt-3 sm:mt-0 flex-1">
              {uploadStatus.type === 'success' && (
                <div className="flex items-center text-foreground p-3 px-4 bg-secondary/50 rounded-lg border border-border">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                  <span>{uploadStatus.message}</span>
                </div>
              )}
              {uploadStatus.type === 'error' && (
                <div className="flex items-center text-foreground p-3 px-4 bg-secondary/50 rounded-lg border border-border">
                  <XCircle className="h-5 w-5 mr-2 text-destructive flex-shrink-0" />
                  <span>{uploadStatus.message}</span>
                </div>
              )}
              {!uploadStatus.type && (
                <div className="flex items-center text-muted-foreground p-3 px-4 bg-secondary/30 rounded-lg border border-border/50">
                  <Info className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                  <span>Supported format: JSON files with patient data</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="bg-primary/5 p-5 rounded-full inline-flex mb-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-foreground text-lg">Loading patients...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border-l-4 border-destructive p-5 mb-8 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
            <p className="text-foreground">{error}</p>
          </div>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-card border border-border p-6 mb-8 rounded-lg shadow-sm">
          <div className="text-muted-foreground flex items-center">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p>No patients found. Try a different search term or upload patient data.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Link 
              href={`/patients/${patient.id}`} 
              key={patient.id}
              className="block group"
            >
              <div className="border border-border rounded-lg shadow-sm group-hover:shadow-md transition-all p-6 bg-card group-hover:border-primary/20">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{patient.formattedName || patient.name}</h2>
                </div>
                <div className="text-muted-foreground text-sm space-y-3 pl-1">
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Gender:</span>
                    <span>{patient.gender || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-1.5" />
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
