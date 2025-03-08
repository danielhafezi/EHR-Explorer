# EHR Explorer: Patient Medication Analysis Tool

EHR Explorer is a web application that processes longitudinal Electronic Health Record (EHR) data from synthetic patients to deliver AI-powered insights into medication patterns and health trends.

![Demo](../demo.gif)

## Features

- Processes longitudinal Electronic Health Record (EHR) data from synthetic patients.
- Interactive AI-powered insights into medication patterns and health trends.
- Comprehensive cross-analysis of conditions and medications.
- Longitudinal analysis of patient data.

## Tech Stack

- **Frontend**: Next.js 15 with React 18, Tailwind CSS
- **Backend**: Next.js API routes, SQLite database
- **AI Integration**: Google Gemini 2.0 Flash model

## Getting Started

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
   GEMINI_API_KEY=your-api-key-here
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Demo

![Demo](../demo.gif)

## Project Structure

```
ehr-explorer/
├── public/              # Static assets
├── scripts/             # Data processing scripts
│   ├── create-database.js
│   ├── process-functions.js
│   ├── process-synthea.js
│   ├── reset-database.js
│   ├── sample-data.js
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   └── patients/     # Patient pages
│   ├── components/       # UI components
│   ├── lib/              # Utility libraries
│   └── globals.css       # Global styles
├── public/               # Static assets including demo.gif
├── demo.gif              # Application demo GIF
├── package.json
├── package-lock.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── tailwind.config.ts

## Project Overview

EHR Explorer processes synthetic patient data from Synthea, storing it in a SQLite database. It leverages Google's Gemini 2.0 Flash model to provide detailed insights into patient medication usage, condition progression, and health trends.

![Demo](./demo.gif)

## License

This project is licensed under the MIT License.
