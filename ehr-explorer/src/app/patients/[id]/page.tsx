'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Patient, Medication, Condition } from '@/utils/database';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PatientSummary {
  medicationCount: number;
  conditionCount: number;
  encounterCount: number;
}

interface PatientDetailProps {
  params: {
    id: string;
  };
}

export default function PatientDetail({ params }: PatientDetailProps) {
  // Use the useParams hook to get the id parameter
  const routeParams = useParams<{ id: string }>();
  const id = routeParams.id || params.id; // Fallback to props.params for backward compatibility
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  
  // Chat-related state
  const [chatQuery, setChatQuery] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{query: string, response: string}>>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient details
        const patientResponse = await fetch(`/api/patients/${id}`);
        if (!patientResponse.ok) {
          throw new Error('Failed to fetch patient details');
        }
        const patientData = await patientResponse.json();
        setPatient(patientData.patient);
        setSummary(patientData.summary);
        
        // Fetch medications
        const medicationsResponse = await fetch(`/api/patients/${id}/medications`);
        if (!medicationsResponse.ok) {
          throw new Error('Failed to fetch medications');
        }
        const medicationsData = await medicationsResponse.json();
        setMedications(medicationsData.medications);
        
        // Fetch conditions
        const conditionsResponse = await fetch(`/api/patients/${id}/conditions`);
        if (!conditionsResponse.ok) {
          throw new Error('Failed to fetch conditions');
        }
        const conditionsData = await conditionsResponse.json();
        setConditions(conditionsData.conditions);
        
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [id]);

  const fetchInsights = async (type: string) => {
    try {
      setInsightsLoading(true);
      setInsights(null);
      
      let endpoint = '';
      switch (type) {
        case 'medications':
          endpoint = `/api/patients/${id}/insights/medications`;
          break;
        case 'conditions':
          endpoint = `/api/patients/${id}/insights/conditions`;
          break;
        case 'comprehensive':
          endpoint = `/api/patients/${id}/insights/comprehensive`;
          break;
        default:
          throw new Error('Invalid insight type');
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} insights`);
      }
      
      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      console.error(`Error fetching ${type} insights:`, err);
      setError(`Failed to load ${type} insights. Please try again.`);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setInsights(null);
    
    // Automatically fetch insights when switching to certain tabs
    if (tab === 'medications' && medications.length > 0) {
      fetchInsights('medications');
    } else if (tab === 'conditions' && conditions.length > 0) {
      fetchInsights('conditions');
    }
  };

  // Add a new function to handle chat submissions
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatQuery.trim()) return;
    
    setChatLoading(true);
    setChatResponse(null);
    
    try {
      const response = await fetch(`/api/patients/${id}/insights/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: chatQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setChatResponse(data.response);
      
      // Add to chat history
      setChatHistory(prev => [...prev, { query: chatQuery, response: data.response }]);
      
      // Clear the input
      setChatQuery('');
    } catch (err) {
      console.error('Error in chat:', err);
      setChatResponse('Sorry, I encountered an error while processing your question. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Back to patient list
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Patient not found.</p>
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Back to patient list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Back to patient list
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-black mb-4">{patient.formattedName || patient.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-black mb-2">Patient Information</h2>
            <div className="text-black">
              <p><span className="font-medium">Gender:</span> {patient.gender || 'Unknown'}</p>
              <p><span className="font-medium">Date of Birth:</span> {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}</p>
              <p><span className="font-medium">Marital Status:</span> {patient.marital_status || 'Unknown'}</p>
              <p><span className="font-medium">Phone:</span> {patient.phone || 'Unknown'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-black mb-2">Health Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{summary?.medicationCount || 0}</p>
                <p className="text-sm text-black">Medications</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{summary?.conditionCount || 0}</p>
                <p className="text-sm text-black">Conditions</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{summary?.encounterCount || 0}</p>
                <p className="text-sm text-black">Encounters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Ask About This Patient</h2>
        
        <div className="mb-4 max-h-60 overflow-y-auto">
          {chatHistory.length > 0 ? (
            <div className="space-y-4">
              {chatHistory.map((chat, index) => (
                <div key={index} className="space-y-2">
                  <div className="bg-gray-100 p-3 rounded-lg text-black">
                    <p className="font-medium">Question:</p>
                    <p>{chat.query}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-black">
                    <p className="font-medium">Response:</p>
                    <div className="prose">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.response}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div></div>
          )}
          
          {chatLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="ml-2 text-gray-600">Generating response...</p>
            </div>
          )}
          
          {chatResponse && !chatHistory.some(chat => chat.response === chatResponse) && (
            <div className="mt-4">
              <div className="bg-gray-100 p-3 rounded-lg text-black">
                <p className="font-medium">Question:</p>
                <p>{chatQuery}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-black mt-2">
                <p className="font-medium">Response:</p>
                <div className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{chatResponse}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleChatSubmit} className="relative">
          <textarea
            id="chat-query"
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black resize-none pr-24"
            placeholder="What questions do you have about this patient?"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            disabled={chatLoading}
          />
          <button
            type="submit"
            className="absolute right-2 bottom-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!chatQuery.trim() || chatLoading}
          >
            Send
          </button>
        </form>
      </div>
      
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange('overview')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-black hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('medications')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'medications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-black hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Medications ({summary?.medicationCount || 0})
            </button>
            <button
              onClick={() => handleTabChange('conditions')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'conditions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-black hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Conditions ({summary?.conditionCount || 0})
            </button>
          </nav>
        </div>
        
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-black mb-4">Patient Overview</h2>
                <p className="text-black mb-6">
                  This dashboard provides a comprehensive view of {patient.name}'s health records, 
                  including medications, conditions, and AI-generated insights.
                </p>
                
                <button
                  onClick={() => fetchInsights('comprehensive')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm transition-colors"
                >
                  Generate Comprehensive Insights
                </button>
              </div>
              
              {insightsLoading ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-4 text-black">Generating insights...</p>
                    </div>
                  </div>
                </div>
              ) : insights ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">AI-Generated Insights</h2>
                  <div className="prose max-w-none text-black overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{insights}</ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          
          {activeTab === 'medications' && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-black mb-4">Medication History</h2>
                
                {medications.length === 0 ? (
                  <p className="text-black">No medication records found for this patient.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Dosage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medications.map((medication) => (
                          <tr key={medication.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{medication.medication}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {medication.start_date ? new Date(medication.start_date).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {medication.end_date ? new Date(medication.end_date).toLocaleDateString() : 'Ongoing'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{medication.status || 'Unknown'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{medication.dosage || 'Not specified'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {insightsLoading ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-4 text-black">Generating medication insights...</p>
                    </div>
                  </div>
                </div>
              ) : insights ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Medication Insights</h2>
                  <div className="prose max-w-none text-black overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{insights}</ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          
          {activeTab === 'conditions' && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-black mb-4">Condition History</h2>
                
                {conditions.length === 0 ? (
                  <p className="text-black">No condition records found for this patient.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Condition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Onset Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Abatement Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {conditions.map((condition) => (
                          <tr key={condition.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{condition.condition}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{condition.condition_code || 'Unknown'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {condition.onset_date ? new Date(condition.onset_date).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {condition.abatement_date ? new Date(condition.abatement_date).toLocaleDateString() : 'Ongoing'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {insightsLoading ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-4 text-black">Generating condition insights...</p>
                    </div>
                  </div>
                </div>
              ) : insights ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Condition Insights</h2>
                  <div className="prose max-w-none text-black overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{insights}</ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 