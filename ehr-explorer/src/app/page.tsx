'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Patient } from '@/utils/database';

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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

    fetchPatients();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-4">Patient Directory</h1>
        <p className="text-black mb-6">
          Select a patient to view their health records and AI-generated insights.
        </p>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search patients by name..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-700"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-black">Loading patients...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>No patients found. Try a different search term.</p>
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
                <h2 className="text-xl font-semibold text-black mb-2">{patient.name}</h2>
                <div className="text-black text-sm">
                  <p>Gender: {patient.gender || 'Unknown'}</p>
                  <p>DOB: {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
