'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Patient, Medication, Condition, Encounter } from '@/utils/database';
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
  Zap, ChevronUp, ChevronDown, FileX
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

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
        <div className="prose max-w-none text-foreground">
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
        <div key={index} className="mb-5 last:mb-0 py-5 first:pt-0 last:pb-0">
          <div className="flex items-start mb-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary mr-3 mt-0.5">
              {icon}
            </div>
            <h4 className="text-lg font-semibold text-foreground">
              {renderMarkdownText(heading)}
            </h4>
          </div>
          <div className="ml-12 text-muted-foreground prose">
            {content.split('\n').map((paragraph, i) => {
              // Clean each paragraph
              const cleanedPara = cleanMarkdown(paragraph);
              
              if (!cleanedPara) return null; // Skip empty paragraphs after cleaning
              
              if (cleanedPara.trim().startsWith('- ')) {
                // It's a list item
                return (
                  <div key={i} className="flex items-start mb-2">
                    <ChevronRight className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <div className="prose text-muted-foreground">
                      {renderMarkdownText(cleanedPara.substring(2))}
                    </div>
                  </div>
                );
              } else if (cleanedPara.trim()) {
                // Regular paragraph with markdown
                return (
                  <div key={i} className="mb-3 prose text-muted-foreground">
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
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow transition-all p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm flex items-center transition-colors border border-border/50"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Insights
        </button>
      </div>
      
      {loading && insightType === currentType ? (
        <div className="flex justify-center items-center py-16 bg-secondary/30 rounded-lg">
          <div className="bg-primary/5 p-4 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <span className="ml-4 text-muted-foreground font-medium">Analyzing data...</span>
        </div>
      ) : insights ? (
        <div className="divide-y divide-border">
          {renderStructuredInsights(insights)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-secondary/30 rounded-lg">
          <div className="bg-primary/5 p-4 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <p className="text-foreground mb-2">No insights available yet</p>
          <p className="text-sm text-muted-foreground">Click "Refresh Insights" to generate an analysis</p>
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
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [encountersLoading, setEncountersLoading] = useState<boolean>(true);
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
        setEncountersLoading(true);
        
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
        
        // Fetch encounters
        const encountersResponse = await fetch(`/api/patients/${id}/encounters`);
        if (!encountersResponse.ok) {
          throw new Error('Failed to fetch encounters');
        }
        const encountersData = await encountersResponse.json();
        setEncounters(encountersData.encounters);
        setEncountersLoading(false);
        
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

  // Function to process encounters by date (for visit frequency chart)
  const processEncountersByDate = () => {
    // Create a map of year-month to count
    const dateCountMap = new Map();
    
    // Sort encounters by date
    const sortedEncounters = [...encounters].sort((a, b) => {
      return new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime();
    });
    
    // Group by year-month
    sortedEncounters.forEach(encounter => {
      if (encounter.start_date) {
        // Format date as YYYY-MM
        const date = new Date(encounter.start_date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (dateCountMap.has(yearMonth)) {
          dateCountMap.set(yearMonth, dateCountMap.get(yearMonth) + 1);
        } else {
          dateCountMap.set(yearMonth, 1);
        }
      }
    });
    
    // Convert map to array of objects for Recharts
    return Array.from(dateCountMap.entries()).map(([date, count]) => ({
      date,
      visits: count
    }));
  };
  
  // Function to process encounters by type (for visit type breakdown)
  const processEncountersByType = () => {
    const typeCountMap = new Map();
    
    encounters.forEach(encounter => {
      const type = encounter.encounter_type || 'Unknown';
      
      if (typeCountMap.has(type)) {
        typeCountMap.set(type, typeCountMap.get(type) + 1);
      } else {
        typeCountMap.set(type, 1);
      }
    });
    
    return Array.from(typeCountMap.entries()).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 group transition-colors">
            <div className="bg-secondary p-2 rounded-full mr-2 group-hover:bg-primary/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span>Back to Patient Directory</span>
          </Link>
          
          <div className="flex justify-center items-center h-64">
            <div className="bg-primary/5 p-5 rounded-full inline-flex mb-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <span className="ml-4 text-muted-foreground font-medium">Loading patient data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 group transition-colors">
            <div className="bg-secondary p-2 rounded-full mr-2 group-hover:bg-primary/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span>Back to Patient Directory</span>
          </Link>
          
          <div className="bg-destructive/10 border-l-4 border-destructive p-5 mb-8 rounded-r-lg">
            <div className="flex">
              <FileX className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
              <p className="text-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 group transition-colors">
            <div className="bg-secondary p-2 rounded-full mr-2 group-hover:bg-primary/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span>Back to Patient Directory</span>
          </Link>
          
          <div className="bg-destructive/10 border-l-4 border-destructive p-5 mb-8 rounded-r-lg">
            <div className="flex">
              <FileX className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
              <p className="text-foreground">Patient not found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 group transition-colors">
          <div className="bg-secondary p-2 rounded-full mr-2 group-hover:bg-primary/10 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span>Back to Patient Directory</span>
        </Link>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="bg-primary/5 p-5 rounded-full inline-flex mb-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <span className="ml-4 text-muted-foreground font-medium">Loading patient data...</span>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border-l-4 border-destructive p-5 mb-8 rounded-r-lg">
            <div className="flex">
              <FileX className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
              <p className="text-foreground">{error}</p>
            </div>
          </div>
        ) : patient ? (
          <>
            {/* Patient Header */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{patient.formattedName || patient.name}</h1>
                    <div className="flex items-center mt-1 text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span className="mr-3">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown DOB'}</span>
                      <span className="mx-1.5">•</span>
                      <span>{patient.gender || 'Unknown gender'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="bg-secondary/50 px-4 py-2 rounded-lg border border-border flex items-center">
                    <Pill className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">{summary?.medicationCount || 0} Medications</span>
                  </div>
                  <div className="bg-secondary/50 px-4 py-2 rounded-lg border border-border flex items-center">
                    <Activity className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">{summary?.conditionCount || 0} Conditions</span>
                  </div>
                  <div className="bg-secondary/50 px-4 py-2 rounded-lg border border-border flex items-center">
                    <FileText className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">{summary?.encounterCount || 0} Encounters</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-primary mr-2 mt-0.5" />
                      <span className="text-foreground">{formatAddress(patient.address)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                    <span className="text-foreground">{patient.phone || 'No phone number'}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Patient ID</h3>
                    <span className="text-foreground">{patient.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      <span className="text-foreground">
                        {patient && 'lastUpdated' in patient ? new Date(patient.lastUpdated as string).toLocaleString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="border-b border-border mb-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                    activeTab === 'overview' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleTabChange('medications')}
                  className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                    activeTab === 'medications' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Medications
                </button>
                <button
                  onClick={() => handleTabChange('conditions')}
                  className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                    activeTab === 'conditions' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Conditions
                </button>
                <button
                  onClick={() => handleTabChange('encounters')}
                  className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                    activeTab === 'encounters' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Encounters
                </button>
                <button
                  onClick={() => handleTabChange('chat')}
                  className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                    activeTab === 'chat' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  AI Assistant
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && (
                <div>
                  {/* Visualizations - Moved to top */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visit Frequency Chart */}
                    <div className="bg-card border border-border rounded-lg shadow p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="h-6 w-6 text-primary mr-2" />
                        <h3 className="text-xl font-semibold text-foreground">Visit Frequency</h3>
                      </div>
                      {encountersLoading ? (
                        <div className="h-64 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          <span className="ml-2 text-muted-foreground">Loading visit data...</span>
                        </div>
                      ) : encounters.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                          <FileX className="h-8 w-8 text-muted-foreground mr-2" />
                          <span className="text-muted-foreground">No visits found</span>
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={processEncountersByDate()}
                              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                angle={-45} 
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis allowDecimals={false} />
                              <Tooltip 
                                formatter={(value) => [`${value} visits`, 'Frequency']}
                                labelFormatter={(label) => {
                                  const [year, month] = label.split('-');
                                  return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="visits" 
                                stroke="#0088FE" 
                                strokeWidth={2}
                                activeDot={{ r: 8 }} 
                                name="Visits"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Visit Type Breakdown */}
                    <div className="bg-card border border-border rounded-lg shadow p-6">
                      <div className="flex items-center mb-4">
                        <Stethoscope className="h-6 w-6 text-muted-foreground mr-2" />
                        <h3 className="text-xl font-semibold text-foreground">Visit Type Breakdown</h3>
                      </div>
                      {encountersLoading ? (
                        <div className="h-64 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          <span className="ml-2 text-muted-foreground">Loading visit data...</span>
                        </div>
                      ) : encounters.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center">
                          <Stethoscope className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-center text-gray-500">No visit data available</p>
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={processEncountersByType()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={false}
                              >
                                {processEncountersByType().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name, props) => [`${value} visits`, props.payload.name]}
                                contentStyle={{ fontSize: '11px' }}
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: '10px' }} 
                                iconSize={8}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                  
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
                  <div className="bg-card border border-border rounded-lg shadow mb-6">
                    <div className="p-6 pb-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Pill className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Medications</h3>
                        </div>
                        <button 
                          onClick={() => setMedicationsExpanded(!medicationsExpanded)}
                          className="text-muted-foreground hover:text-primary"
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
                                <Pill className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-foreground">{med.medication}</h4>
                                  {med.dosage && <p className="text-sm text-muted-foreground">Dosage: {med.dosage}</p>}
                                  {med.status && <p className="text-sm text-muted-foreground">Status: {med.status}</p>}
                                  {med.start_date && (
                                    <p className="text-sm text-muted-foreground">
                                      Start date: {new Date(med.start_date).toLocaleDateString()}
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
                  <div className="bg-card border border-border rounded-lg shadow mb-6">
                    <div className="p-6 pb-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                          <h3 className="text-lg font-semibold text-foreground">Conditions</h3>
                        </div>
                        <button 
                          onClick={() => setConditionsExpanded(!conditionsExpanded)}
                          className="text-muted-foreground hover:text-primary"
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
                                  <h4 className="font-medium text-foreground">{condition.condition}</h4>
                                  {condition.onset_date && (
                                    <p className="text-sm text-muted-foreground">
                                      Since: {new Date(condition.onset_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  {condition.abatement_date && (
                                    <p className="text-sm text-muted-foreground">
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
              
              {activeTab === 'encounters' && (
                <div className="bg-card border border-border rounded-lg shadow">
                  <div className="p-6 pb-3 border-b border-border">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-foreground">Encounters</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {encountersLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                    ) : encounters.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center">
                        <FileX className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-center text-gray-500">No encounter data available</p>
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={processEncountersByDate()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              angle={-45} 
                              textAnchor="end"
                              height={60}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip 
                              formatter={(value) => [`${value} encounters`, 'Frequency']}
                              labelFormatter={(label) => {
                                const [year, month] = label.split('-');
                                return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
                              }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="visits" 
                              stroke="#0088FE" 
                              strokeWidth={2}
                              activeDot={{ r: 8 }} 
                              name="Encounters"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'chat' && (
                <div className="bg-card border border-border rounded-lg shadow">
                  <div className="p-6 pb-3 border-b border-border">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-foreground">AI Medical Assistant</h3>
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">Ask questions about the patient's health record</div>
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
                              <div className="bg-secondary/50 p-4 rounded-lg rounded-br-none border border-border">
                                <div className="flex items-start">
                                  <User className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                                  <div className="text-foreground">{item.query}</div>
                                </div>
                              </div>
                              <div className="bg-card p-4 rounded-lg rounded-bl-none border border-border">
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
                          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                          <span className="text-muted-foreground">Generating response...</span>
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
                          className="block w-full rounded-md border-border focus:border-primary focus:ring-primary p-3 border text-foreground"
                          placeholder="Ask about medications, conditions, or potential interactions..."
                          value={chatQuery}
                          onChange={(e) => setChatQuery(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center items-center rounded-md border border-transparent bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
          </>
        ) : null}
      </div>
    </div>
  );
} 