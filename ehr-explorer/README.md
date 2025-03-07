# EHR Explorer: Patient Medication Analysis Tool

EHR Explorer is a web application that processes longitudinal Electronic Health Record (EHR) data from synthetic patients to deliver AI-powered insights into medication patterns and health trends. The application demonstrates the practical application of Large Language Models (Google's Gemini) to analyze patient data over time, with a focus on medication usage patterns.

## Features

- Process and transform Synthea synthetic patient data
- Interactive patient dashboard with medication and condition history
- AI-powered insights using Google's Gemini 2.0 Flash model
- Longitudinal analysis of medication patterns and health trends
- Comprehensive cross-analysis of conditions and medications

## Tech Stack

- **Frontend**: Next.js 14 with React 18, Tailwind CSS
- **Backend**: Next.js API routes, SQLite database
- **AI Integration**: Google Generative AI SDK (Gemini 2.0 Flash)
- **Data Processing**: Node.js scripts for Synthea data processing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ehr-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Database Setup

1. Create the database schema:
   ```bash
   node scripts/create-database.js
   ```

2. Process Synthea data files:
   ```bash
   node scripts/process-synthea.js
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure

```
ehr-explorer/
├── public/              # Static assets
├── scripts/             # Data processing scripts
│   ├── create-database.js
│   └── process-synthea.js
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── patients/    # Patient pages
│   │   └── page.tsx     # Home page
│   ├── utils/           # Utility functions
│   │   ├── database.ts  # Database utilities
│   │   └── gemini.ts    # Gemini API integration
│   └── globals.css      # Global styles
├── db/                  # SQLite database
├── .env.local           # Environment variables
└── README.md            # Project documentation
```

## Data Processing

The application processes Synthea JSON files to extract:
- Patient demographic information
- Medication history
- Condition records
- Encounter data

This data is stored in a SQLite database for efficient querying and analysis.

## AI Integration

The application uses Google's Gemini 2.0 Flash model to generate insights about:
- Medication patterns and potential issues
- Condition progression and relationships
- Comprehensive analysis of health trends

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Synthea for providing synthetic patient data
- Google for the Gemini API
- Dr. Theresa Smith's research group at the University of Bath for inspiration
