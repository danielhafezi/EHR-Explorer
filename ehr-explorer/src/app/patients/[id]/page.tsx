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
  Calendar, MapPin,
  AlarmClock, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, BookOpen, Stethoscope, RefreshCw,
  ClipboardList, TrendingUp, ListChecks, Users,
  Zap, ChevronUp, ChevronDown
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

// Insight Panel Component for structured display of AI insights
interface InsightPanelProps {
  insights: string | null;
  loading: boolean;
  insightType: string | null;
  currentType: string;
  onRefresh: () => void;
  title: string;
}

function InsightPanel({ 
  insights, 
  loading, 
  insightType, 
  currentType, 
  onRefresh, 
  title 
}: InsightPanelProps) {
  // Function to clean up standalone ** symbols that aren't part of markdown formatting
  const cleanMarkdown = (text: string) => {
    // Remove standalone ** that are used as visual separators
    return text
      .replace(/^\s*\*\*\s*$/gm, '') // Remove lines that only contain **
      .replace(/^\s*\*\*\s*/gm, '')  // Remove ** at the beginning of lines
      .replace(/\s*\*\*\s*$/gm, '')  // Remove ** at the end of lines
      .trim();
  };
  
  // Function to parse the insights content and structure it
  const renderStructuredInsights = (content: string) => {
    if (!content) return null;
    
    // Clean up the content before processing
    const cleanedContent = cleanMarkdown(content);
    
    // Handle case where content doesn't match our expected format
    if (!cleanedContent.match(/\d+\.\s+[A-Za-z]/)) {
      return (
        <div className="prose max-w-none text-black">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {cleanedContent}
          </ReactMarkdown>
        </div>
      );
    }
    
    // Split content by numbered sections
    const sections = cleanedContent.split(/\d+\.\s+/).filter(section => section.trim().length > 0);
    
    // Extract headings and content
    return sections.map((section, index) => {
      // Find the first colon to separate heading from content
      const colonIndex = section.indexOf(':');
      if (colonIndex === -1) return null;
      
      const heading = section.substring(0, colonIndex).trim();
      const content = section.substring(colonIndex + 1).trim();
      
      // Icons based on common health-related terms
      let icon = <ClipboardList className="h-5 w-5" />;
      if (/medication|simvastatin|acetaminophen|prescription/i.test(heading)) {
        icon = <Pill className="h-5 w-5" />;
      } else if (/condition|prediabetes|anemia|bronchitis/i.test(heading)) {
        icon = <Stethoscope className="h-5 w-5" />;
      } else if (/review|suggestion|recommendation/i.test(heading)) {
        icon = <CheckCircle2 className="h-5 w-5" />;
      } else if (/concern|warning|alert/i.test(heading)) {
        icon = <AlertTriangle className="h-5 w-5" />;
      } else if (/pattern|temporal|relationship/i.test(heading)) {
        icon = <TrendingUp className="h-5 w-5" />;
      } else if (/adherence|monitoring|support/i.test(heading)) {
        icon = <Users className="h-5 w-5" />;
      }
      
      // Render markdown for all text content
      const renderMarkdownText = (text: string) => (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      );
      
      return (
        <div key={index} className="mb-5 last:mb-0">
          <div className="flex items-start mb-2">
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-3 mt-0.5">
              {icon}
            </div>
            <h4 className="text-lg font-semibold text-gray-800">
              {renderMarkdownText(heading)}
            </h4>
          </div>
          <div className="ml-12 text-gray-700 prose">
            {content.split('\n').map((paragraph, i) => {
              // Clean each paragraph
              const cleanedPara = cleanMarkdown(paragraph);
              
              if (!cleanedPara) return null; // Skip empty paragraphs after cleaning
              
              if (cleanedPara.trim().startsWith('- ')) {
                // It's a list item
                return (
                  <div key={i} className="flex items-start mb-1">
                    <ChevronRight className="h-4 w-4 text-blue-500 mr-1 mt-1 flex-shrink-0" />
                    <div className="prose">
                      {renderMarkdownText(cleanedPara.substring(2))}
                    </div>
                  </div>
                );
              } else if (cleanedPara.trim()) {
                // Regular paragraph with markdown
                return (
                  <div key={i} className="mb-2 prose">
                    {renderMarkdownText(cleanedPara)}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-xl font-semibold text-black">{title}</h3>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm flex items-center transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Insights
        </button>
      </div>
      
      {loading && insightType === currentType ? (
        <div className="flex justify-center items-center py-16 bg-gray-50 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-700 font-medium">Analyzing data...</span>
        </div>
      ) : insights ? (
        <div className="divide-y divide-gray-100">
          {renderStructuredInsights(insights)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg text-gray-500">
          <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-center mb-2">No insights available yet</p>
          <p className="text-sm text-center">Click "Refresh Insights" to generate an analysis</p>
        </div>
      )}
    </div>
  );
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
  
  // Add states to track expanded/collapsed sections
  const [medicationsExpanded, setMedicationsExpanded] = useState<boolean>(true);
  const [conditionsExpanded, setConditionsExpanded] = useState<boolean>(true);
  
  // Add separate state for each tab's insights
  const [overviewInsights, setOverviewInsights] = useState<string | null>(null);
  const [medicationInsights, setMedicationInsights] = useState<string | null>(null);
  const [conditionInsights, setConditionInsights] = useState<string | null>(null);
  const [insightType, setInsightType] = useState<string | null>(null);
  
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
    if (patient && !loading && !error && !overviewInsights) {
      fetchInsights('comprehensive');
    }
  }, [patient, loading, error, overviewInsights]);

  const fetchInsights = async (type: string) => {
    try {
      setInsightsLoading(true);
      setInsightType(type);
      
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
      
      // Update the appropriate insights state based on type
      if (type === 'comprehensive') {
        setOverviewInsights(data.insights);
      } else if (type === 'medications') {
        setMedicationInsights(data.insights);
      } else if (type === 'conditions') {
        setConditionInsights(data.insights);
      }
      
    } catch (err) {
      console.error(`Error fetching ${type} insights:`, err);
      setError(`Failed to load ${type} insights. Please try again.`);
    } finally {
      setInsightsLoading(false);
      setInsightType(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Fetch insights only if they don't already exist for the selected tab
    if (tab === 'medications' && medications.length > 0 && !medicationInsights) {
      fetchInsights('medications');
    } else if (tab === 'conditions' && conditions.length > 0 && !conditionInsights) {
      fetchInsights('conditions');
    }
  };

  // Add a new function to handle chat submissions
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatQuery.trim()) return;
    
    // Store the current query before clearing it
    const currentQuery = chatQuery;
    
    // Show loading state
    setChatLoading(true);
    setChatResponse(null);
    
    try {
      const response = await fetch(`/api/patients/${id}/insights/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Update chat history with the new conversation
      setChatHistory(prev => [...prev, { query: currentQuery, response: data.response }]);
      
      // Clear the input
      setChatQuery('');
    } catch (err) {
      console.error('Error in chat:', err);
      // Add error message to chat history instead of setting chatResponse
      setChatHistory(prev => [...prev, { 
        query: currentQuery, 
        response: 'Sorry, I encountered an error while processing your question. Please try again.' 
      }]);
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
              <MapPin className="h-7 w-7 text-gray-500 mr-1" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 flex items-center shadow-sm">
                <Pill className="h-10 w-10 text-blue-500 mr-4" />
                <div>
                  <div className="text-base text-gray-700">Medications</div>
                  <div className="text-3xl font-bold text-gray-800">{summary.medicationCount}</div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 flex items-center shadow-sm">
                <Heart className="h-10 w-10 text-green-500 mr-4" />
                <div>
                  <div className="text-base text-gray-700">Conditions</div>
                  <div className="text-3xl font-bold text-gray-800">{summary.conditionCount}</div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 flex items-center shadow-sm">
                <Clock className="h-10 w-10 text-purple-500 mr-4" />
                <div>
                  <div className="text-base text-gray-700">Encounters</div>
                  <div className="text-3xl font-bold text-gray-800">{summary.encounterCount}</div>
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
            <InsightPanel 
              insights={overviewInsights}
              loading={insightsLoading}
              insightType={insightType}
              currentType="comprehensive"
              onRefresh={() => fetchInsights('comprehensive')}
              title="Comprehensive Analysis"
            />
          </div>
        )}
        
        {activeTab === 'medications' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow mb-6">
              <div className="p-6 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-black">Medications</h3>
                  </div>
                  <button 
                    onClick={() => setMedicationsExpanded(!medicationsExpanded)}
                    className="text-gray-500 hover:text-blue-500"
                    aria-label={medicationsExpanded ? "Collapse medications" : "Expand medications"}
                  >
                    {medicationsExpanded ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
              
              {medicationsExpanded && (
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
              )}
            </div>
            
            <InsightPanel 
              insights={medicationInsights}
              loading={insightsLoading}
              insightType={insightType}
              currentType="medications"
              onRefresh={() => fetchInsights('medications')}
              title="Medication Analysis"
            />
          </div>
        )}
        
        {activeTab === 'conditions' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow mb-6">
              <div className="p-6 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-black">Conditions</h3>
                  </div>
                  <button 
                    onClick={() => setConditionsExpanded(!conditionsExpanded)}
                    className="text-gray-500 hover:text-blue-500"
                    aria-label={conditionsExpanded ? "Collapse conditions" : "Expand conditions"}
                  >
                    {conditionsExpanded ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
              
              {conditionsExpanded && (
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
              )}
            </div>
            
            <InsightPanel 
              insights={conditionInsights}
              loading={insightsLoading}
              insightType={insightType}
              currentType="conditions"
              onRefresh={() => fetchInsights('conditions')}
              title="Condition Analysis"
            />
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-black"
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