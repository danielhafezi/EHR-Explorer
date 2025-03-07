## 1. Project Overview

EHR Explorer is a web application that processes longitudinal Electronic Health Record (EHR) data from synthetic patients to deliver AI-powered insights into medication patterns and health trends. The application demonstrates the practical application of Large Language Models (Google's Gemini) to analyze patient data over time, with a focus on medication usage patterns.

### 1.1 Project Purpose

To showcase the application of AI in healthcare data analysis, specifically for longitudinal patient medication data, as a demonstration of technical capabilities for a PhD application to Dr. Theresa Smith's research group at the University of Bath.

### 1.2 Background

Dr. Smith's research focuses on statistical models for healthcare data, particularly for chronic disease management using electronic health records with longitudinal structure. This project directly aligns with those interests by demonstrating how AI can extract meaningful patterns from time-based patient data.

---

## 2. Project Goals and Success Metrics

### 2.1 Primary Goals

1. Process and transform large, complex synthetic patient data into an analyzable format
2. Create a web interface for exploring individual patient data
3. Integrate Gemini LLM to generate longitudinal insights from medication and condition data
4. Demonstrate statistical understanding of healthcare data trends

### 2.2 Success Metrics

1. Application correctly processes and displays Synthea patient records
2. LLM generates clinically relevant insights about medication patterns
3. Interface allows intuitive navigation of patient records
4. Application reliably handles multiple patient records
5. Code organization demonstrates software engineering best practices

---

## 3. User Personas and Use Cases

### 3.1 Primary User: Clinical Researcher (Dr. Smith)

A researcher interested in statistical patterns within healthcare data, who wants to understand how AI can supplement traditional statistical approaches for longitudinal data analysis.

### 3.2 Key Use Cases

1. **UC1: Patient Overview Review**
   - User selects a patient from a list
   - System displays demographic information and health summary
   - User can see key statistics about the patient's health records

2. **UC2: Medication Trend Analysis**
   - User navigates to the medications tab for a specific patient
   - System processes medication history data
   - User requests AI-generated insights about medication patterns
   - System displays contextual analysis of medication changes over time

3. **UC3: Condition Analysis**
   - User navigates to the conditions tab for a specific patient
   - System processes condition history data 
   - User requests AI-generated insights about disease progression
   - System displays analysis of condition onset and relationships

4. **UC4: Cross-Analysis of Medications and Conditions**
   - User requests comprehensive analysis of a patient
   - System correlates condition onset with medication changes
   - AI generates insights about potential relationships between conditions and medications

---

## 4. Functional Requirements

### 4.1 Data Processing

1. **FR1.1:** System shall parse and extract relevant fields from Synthea JSON files
2. **FR1.2:** System shall transform data into a structured format optimized for querying
3. **FR1.3:** System shall store processed data in SQLite database
4. **FR1.4:** System shall handle relationship mapping between patients, medications, and conditions

### 4.2 Patient Management

1. **FR2.1:** System shall display a list of available patients
2. **FR2.2:** System shall allow filtering/searching patients by basic criteria
3. **FR2.3:** System shall display detailed patient information on selection

### 4.3 Medication Analysis

1. **FR3.1:** System shall display a chronological list of medications for a patient
2. **FR3.2:** System shall visualize medication usage over time (timeline visualization)
3. **FR3.3:** System shall identify medication changes (starts, stops, dosage changes)
4. **FR3.4:** System shall generate insights about medication patterns using Gemini LLM

### 4.4 Condition Analysis

1. **FR4.1:** System shall display conditions with onset dates when available
2. **FR4.2:** System shall visualize condition progression over time
3. **FR4.3:** System shall generate insights about condition patterns using Gemini LLM

### 4.5 AI Integration

1. **FR5.1:** System shall integrate with Google's Gemini API for text generation
2. **FR5.2:** System shall format patient data appropriately for LLM context
3. **FR5.3:** System shall generate targeted insights based on specific aspects of patient data
4. **FR5.4:** System shall present AI-generated insights in a readable format

---

## 5. Technical Architecture

### 5.1 Technology Stack

1. **Frontend:**
   - Next.js 14+ with React 18+
   - Tailwind CSS for styling
   - Chart.js or D3.js for data visualization
   - React Query for data fetching

2. **Backend:**
   - Next.js API routes
   - SQLite for data storage
   - Node.js utility scripts for data processing

3. **AI Integration:**
   - Google Generative AI SDK (@google/generative-ai)
   - LangChain.js (if needed for complex prompting)

4. **Development Tools:**
   - Cursor IDE
   - GitHub for version control
   - ESLint/Prettier for code formatting

### 5.2 System Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Synthea Data   │────▶│  Data Processing│────▶│  SQLite DB      │
│  (JSON Files)   │     │  Scripts        │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◀───▶│  Next.js API    │◀───▶│  Data Access    │
│  Components     │     │  Routes         │     │  Layer          │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  Google Gemini  │
                        │  API            │
                        │                 │
                        └─────────────────┘
```

### 5.3 Data Flow

1. Raw Synthea JSON data is processed by utility scripts
2. Processed data is stored in SQLite database
3. Next.js API routes query SQLite based on user requests
4. Selected data is sent to Gemini API for insight generation
5. Results are displayed to the user through React components

---

## 6. UI/UX Design Guidelines

### 6.1 Application Layout

1. **Navigation:**
   - Top navigation bar with application title
   - Left sidebar for patient selection
   - Main content area for patient details and insights
   - Tab-based navigation for different analysis types

2. **Color Scheme:**
   - Primary: #3B82F6 (blue-500)
   - Secondary: #10B981 (emerald-500)
   - Neutral: #1F2937 (gray-800)
   - Background: #F9FAFB (gray-50)
   - Text: #111827 (gray-900)

3. **Typography:**
   - Headings: Inter, sans-serif
   - Body: Inter, sans-serif
   - Code/Data: Roboto Mono, monospace

### 6.2 Key Screens

1. **Patient List:**
   - Searchable/filterable list of patients
   - Basic information (name, age, gender)
   - Selection highlights current patient

2. **Patient Dashboard:**
   - Patient demographic information
   - Summary statistics (condition count, medication count)
   - Navigation tabs for detailed analysis

3. **Medication Analysis:**
   - Timeline visualization of medication usage
   - List of medications with start/end dates
   - AI insight panel with generated analysis
   - Controls to request specific insight types

4. **Condition Analysis:**
   - Timeline visualization of condition onset
   - List of conditions with dates
   - AI insight panel with generated analysis

### 6.3 Responsive Design

1. Application should function on screens ≥768px wide
2. Optimize layout for desktop and tablet devices
3. Mobile view is not a primary requirement but should degrade gracefully

---

## 7. Database Schema

### 7.1 Tables

1. **patients**
   ```sql
   CREATE TABLE patients (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     gender TEXT,
     birthDate TEXT,
     address TEXT,
     phone TEXT,
     marital_status TEXT
   );
   ```

2. **conditions**
   ```sql
   CREATE TABLE conditions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     patient_id TEXT NOT NULL,
     condition TEXT NOT NULL,
     condition_code TEXT,
     onset_date TEXT,
     abatement_date TEXT,
     FOREIGN KEY (patient_id) REFERENCES patients(id)
   );
   ```

3. **medications**
   ```sql
   CREATE TABLE medications (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     patient_id TEXT NOT NULL,
     medication TEXT NOT NULL,
     medication_code TEXT,
     start_date TEXT,
     end_date TEXT,
     status TEXT,
     dosage TEXT,
     FOREIGN KEY (patient_id) REFERENCES patients(id)
   );
   ```

4. **encounters**
   ```sql
   CREATE TABLE encounters (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     patient_id TEXT NOT NULL,
     encounter_type TEXT,
     start_date TEXT,
     end_date TEXT,
     FOREIGN KEY (patient_id) REFERENCES patients(id)
   );
   ```

### 7.2 Indexes

```sql
CREATE INDEX idx_patient_id ON patients(id);
CREATE INDEX idx_condition_patient ON conditions(patient_id);
CREATE INDEX idx_medication_patient ON medications(patient_id);
CREATE INDEX idx_encounter_patient ON encounters(patient_id);
```

---

## 8. API Endpoints

### 8.1 Patient Endpoints

1. **GET /api/patients**
   - Returns list of all patients with basic information
   - Query parameters: page, limit, search
   - Response: Array of patient objects

2. **GET /api/patients/{id}**
   - Returns detailed information for a specific patient
   - Response: Patient object with summary statistics

### 8.2 Medication Endpoints

1. **GET /api/patients/{id}/medications**
   - Returns all medications for a specific patient
   - Query parameters: sort, limit
   - Response: Array of medication objects

2. **GET /api/patients/{id}/insights/medications**
   - Generates AI insights about medication patterns
   - Query parameters: timeframe
   - Response: Object with generated insights

### 8.3 Condition Endpoints

1. **GET /api/patients/{id}/conditions**
   - Returns all conditions for a specific patient
   - Query parameters: sort, limit
   - Response: Array of condition objects

2. **GET /api/patients/{id}/insights/conditions**
   - Generates AI insights about condition patterns
   - Response: Object with generated insights

### 8.4 Comprehensive Analysis

1. **GET /api/patients/{id}/insights/comprehensive**
   - Generates AI insights about relationships between conditions and medications
   - Response: Object with generated insights

---

## 9. Gemini LLM Integration

### 9.1 Model Selection

1. Use **Gemini 1.5 Flash** for standard insights generation (faster, lower cost)
2. Use **Gemini 1.5 Pro** for comprehensive analysis (deeper insights, higher cost)

### 9.2 Implementation

```javascript
// utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateMedicationInsights(patientData, medications) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
  You are a clinical data analyst examining patient medication data.
  Analyze the following medication history and provide insights on:
  1. Patterns in medication usage over time
  2. Potential adherence issues based on refill patterns
  3. Any concerning drug combinations or changes in therapy
  4. Suggestions for optimizing the medication regimen
  
  Patient: ${patientData.name} (${patientData.gender}, DOB: ${patientData.birthDate})
  
  Medication history:
  ${medications.map(med => 
    `- ${med.medication} (${med.dosage || 'No dosage info'}): Started ${med.start_date}, Status: ${med.status}`
  ).join('\n')}
  
  Please provide your longitudinal analysis of this patient's medication patterns.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return text;
}

// Similar functions for conditions and comprehensive analysis
```

### 9.3 Prompt Engineering Guidelines

1. **Be Specific:** Include explicit instructions about analyzing longitudinal patterns
2. **Provide Context:** Include relevant patient demographics and time frames
3. **Structure Output:** Request specific sections or bullet points for clarity
4. **Focus Analysis:** Direct the model to focus on specific aspects (e.g., dosage changes, refill patterns)

---

## 10. Implementation Timeline

### 10.1 Phase 1: Setup and Data Processing (3 days)
- Initialize Next.js project with Tailwind CSS
- Set up GitHub repository and Cursor IDE
- Create data processing scripts
- Design and implement SQLite database schema

### 10.2 Phase 2: Core Application Development (5 days)
- Implement patient list and selection
- Create patient dashboard
- Develop medication visualization and listing
- Implement condition visualization and listing
- Create API endpoints for data access

### 10.3 Phase 3: Gemini Integration (3 days)
- Set up Gemini API integration
- Implement medication insights generation
- Implement condition insights generation
- Develop comprehensive analysis capability

### 10.4 Phase 4: UI Refinement and Testing (2 days)
- Improve visualizations
- Enhance UI responsiveness
- Test with multiple patient records
- Fix bugs and edge cases

### 10.5 Phase 5: Documentation and Deployment (2 days)
- Create detailed README
- Add inline code documentation
- Deploy to Vercel or similar platform
- Prepare demo for Dr. Smith

---

## 11. Testing Strategy

### 11.1 Data Processing Tests
- Verify correct extraction of patient information
- Ensure relationship mapping works correctly
- Test handling of edge cases (missing data, etc.)

### 11.2 API Endpoint Tests
- Verify correct data returned for each endpoint
- Test error handling and edge cases
- Check performance with larger datasets

### 11.3 LLM Integration Tests
- Verify Gemini API integration works correctly
- Test prompt effectiveness with different patient scenarios
- Ensure insights are relevant and accurate

### 11.4 UI Testing
- Verify all components render correctly
- Test navigation and interaction flows
- Ensure responsive behavior works as expected

---

## 12. Limitations and Future Enhancements

### 12.1 Current Limitations
- Limited to synthetic data
- No real-time updates
- Fixed set of insight types
- Single-user application

### 12.2 Future Enhancements
- Support for real EHR data formats (FHIR, HL7)
- More advanced statistical analysis
- Interactive visualization capabilities
- Multi-patient comparative analysis
- Advanced filtering and cohort selection
- Integration with statistical models for predictive analysis

---

## 13. Project Directory Structure

```
ehr-explorer/
├── public/
│   └── assets/
├── scripts/
│   ├── process-synthea.js   # Data processing script
│   └── create-database.js   # Database setup script
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── patients/
│   │   │   ├── PatientList.jsx
│   │   │   └── PatientCard.jsx
│   │   ├── analysis/
│   │   │   ├── MedicationAnalysis.jsx
│   │   │   ├── ConditionAnalysis.jsx
│   │   │   └── InsightPanel.jsx
│   │   └── visualizations/
│   │       ├── Timeline.jsx
│   │       └── TrendChart.jsx
│   ├── pages/
│   │   ├── index.js
│   │   ├── patients/
│   │   │   ├── index.js
│   │   │   └── [id].js
│   │   └── api/
│   │       ├── patients/
│   │       │   ├── index.js
│   │       │   ├── [id].js
│   │       │   ├── [id]/medications.js
│   │       │   ├── [id]/conditions.js
│   │       │   └── [id]/insights/
│   │       │       ├── medications.js
│   │       │       ├── conditions.js
│   │       │       └── comprehensive.js
│   ├── utils/
│   │   ├── database.js    # Database utilities
│   │   ├── gemini.js      # Gemini API integration
│   │   └── formatters.js  # Data formatting utilities
│   └── styles/
│       └── globals.css
├── .env.local
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## 14. Development Environment Setup

1. **Prerequisites:**
   - Node.js 18+
   - npm or yarn
   - Cursor IDE
   - Git

2. **Environment Variables:**
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Installation Commands:**
   ```bash
   # Initialize Next.js project
   npx create-next-app ehr-explorer --typescript
   cd ehr-explorer
   
   # Install dependencies
   npm install tailwindcss postcss autoprefixer
   npm install @google/generative-ai chart.js react-chartjs-2 sqlite sqlite3
   npm install @tanstack/react-query
   
   # Setup tailwind
   npx tailwindcss init -p
   
   # Run development server
   npm run dev
   ```