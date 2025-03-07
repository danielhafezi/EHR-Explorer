'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Patient, Medication, Condition } from '@/utils/database';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  User, Pill, Activity, List, ChevronLeft, 
  FileText, MessageCircle, Send, Loader2, 
  Brain, ChevronRight, Clock, Heart, PlusCircle,
  Calendar, MapPin
} from 'lucide-react';

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

  // Format address from JSON string to readable format
  const formatAddress = (addressStr: string | null) => {
    if (!addressStr) return 'Unknown';
    
    try {
      const addressObj = JSON.parse(addressStr);
      const addressParts = [];
      
      // Add line parts (e.g., street number and name)
      if (addressObj.line && addressObj.line.length > 0) {
        addressParts.push(addressObj.line.join(', '));
      }
      
      // Add city, state, and postal code
      const locationParts = [];
      if (addressObj.city) locationParts.push(addressObj.city);
      if (addressObj.state) locationParts.push(addressObj.state);
      if (addressObj.postalCode) locationParts.push(addressObj.postalCode);
      
      if (locationParts.length > 0) {
        addressParts.push(locationParts.join(', '));
      }
      
      // Add country if available
      if (addressObj.country) {
        addressParts.push(addressObj.country);
      }
      
      return addressParts.length > 0 ? addressParts.join(', ') : 'Unknown';
    } catch (e) {
      console.error('Error parsing address:', e);
      return addressStr; // Return original if parsing fails
    }
  };

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

  // Add a new useEffect to automatically fetch comprehensive analysis when patient data is loaded
  useEffect(() => {
    // Only fetch insights when patient data has been loaded successfully
    if (patient && !loading && !error) {
      fetchInsights('comprehensive');
    }
  }, [patient, loading, error]);

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
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
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
        <Link href="/" className="text-blue-500 hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to patient list
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
        <Link href="/" className="text-blue-500 hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to patient list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:underline flex items-center w-fit">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to patient list
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 col-span-1">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-black">Patient Information</h2>
          </div>
          <div className="space-y-2 text-black">
            <p className="text-lg font-medium text-gray-800">{patient.formattedName || patient.name}</p>
            <p className="flex items-center">
              <User className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-800 font-medium mr-1">Gender:</span> 
              {patient.gender || 'Unknown'}
            </p>
            <p className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-800 font-medium mr-1">DOB:</span> 
              {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}
            </p>
            <p className="flex items-center">
              <MapPin className="h-6 w-6 text-gray-500 mr-1" />
              <span className="text-gray-800 font-medium mr-1">Address:</span> 
              {formatAddress(patient.address)}
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-black">Summary</h2>
          </div>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                <Pill className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-700">Medications</div>
                  <div className="text-2xl font-bold text-gray-800">{summary.medicationCount}</div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 flex items-center">
                <Heart className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-700">Conditions</div>
                  <div className="text-2xl font-bold text-gray-800">{summary.conditionCount}</div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 flex items-center">
                <Clock className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-700">Encounters</div>
                  <div className="text-2xl font-bold text-gray-800">{summary.encounterCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <FileText className="h-4 w-4 mr-1" />
            Overview
          </button>
          <button
            onClick={() => handleTabChange('medications')}
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === 'medications'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <Pill className="h-4 w-4 mr-1" />
            Medications {summary?.medicationCount ? `(${summary.medicationCount})` : ''}
          </button>
          <button
            onClick={() => handleTabChange('conditions')}
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === 'conditions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <Activity className="h-4 w-4 mr-1" />
            Conditions {summary?.conditionCount ? `(${summary.conditionCount})` : ''}
          </button>
          <button
            onClick={() => handleTabChange('chat')}
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === 'chat'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            AI Assistant
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-black">Comprehensive Analysis</h3>
                </div>
                <button
                  onClick={() => fetchInsights('comprehensive')}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Generate Insights
                </button>
              </div>
              
              {insightsLoading && activeTab === 'overview' ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-700">Generating analysis...</span>
                </div>
              ) : insights && (
                <div className="prose max-w-none text-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insights}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'medications' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow mb-6">
              <div className="p-6 pb-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Pill className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-black">Medications</h3>
                </div>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {medications.length === 0 ? (
                  <li className="p-6 text-gray-700 italic">No medications found</li>
                ) : (
                  medications.map((med, index) => (
                    <li key={index} className="p-6">
                      <div className="flex items-start">
                        <Pill className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-black">{med.medication}</h4>
                          {med.dosage && <p className="text-sm text-gray-700">Dosage: {med.dosage}</p>}
                          {med.status && <p className="text-sm text-gray-700">Status: {med.status}</p>}
                          {med.start_date && (
                            <p className="text-sm text-gray-700">
                              Date: {new Date(med.start_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-black">Medication Analysis</h3>
                </div>
                <button
                  onClick={() => fetchInsights('medications')}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Refresh Insights
                </button>
              </div>
              
              {insightsLoading && activeTab === 'medications' ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-700">Analyzing medications...</span>
                </div>
              ) : insights ? (
                <div className="prose max-w-none text-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insights}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-700 italic">Click "Refresh Insights" to generate analysis</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'conditions' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow mb-6">
              <div className="p-6 pb-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-black">Conditions</h3>
                </div>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {conditions.length === 0 ? (
                  <li className="p-6 text-gray-700 italic">No conditions found</li>
                ) : (
                  conditions.map((condition, index) => (
                    <li key={index} className="p-6">
                      <div className="flex items-start">
                        <Activity className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-black">{condition.condition}</h4>
                          {condition.onset_date && (
                            <p className="text-sm text-gray-700">
                              Onset date: {new Date(condition.onset_date).toLocaleDateString()}
                            </p>
                          )}
                          {condition.abatement_date && (
                            <p className="text-sm text-gray-700">
                              End date: {new Date(condition.abatement_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-black">Condition Analysis</h3>
                </div>
                <button
                  onClick={() => fetchInsights('conditions')}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Refresh Insights
                </button>
              </div>
              
              {insightsLoading && activeTab === 'conditions' ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-700">Analyzing conditions...</span>
                </div>
              ) : insights ? (
                <div className="prose max-w-none text-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insights}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-700 italic">Click "Refresh Insights" to generate analysis</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow">
            <div className="p-6 pb-3 border-b border-gray-200">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-black">AI Medical Assistant</h3>
              </div>
              <p className="text-gray-700 text-sm mt-1">Ask questions about the patient's health record</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6 max-h-96 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <p className="text-center text-gray-700 italic py-12">
                    No conversations yet. Ask a question to get started.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {chatHistory.map((item, index) => (
                      <div key={index} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg rounded-br-none">
                          <div className="flex items-start">
                            <User className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-blue-800">{item.query}</div>
                          </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg rounded-bl-none">
                          <div className="flex items-start">
                            <MessageCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="prose prose-sm max-w-none text-black">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {item.response}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {chatResponse && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg rounded-br-none">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-blue-800">{chatQuery}</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg rounded-bl-none">
                      <div className="flex items-start">
                        <MessageCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="prose prose-sm max-w-none text-black">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {chatResponse}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {chatLoading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-gray-700">Generating response...</span>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleChatSubmit} className="flex items-end">
                <div className="flex-grow">
                  <label htmlFor="chatQuery" className="block text-sm font-medium text-gray-700 mb-1">
                    Your question
                  </label>
                  <input
                    type="text"
                    id="chatQuery"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                    placeholder="Ask about medications, conditions, or potential interactions..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={chatLoading || !chatQuery.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 