import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Generative AI API with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the model (using gemini-2.0-flash as specified by the user)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Patient {
  id: string;
  name: string;
  gender: string | null;
  birthDate: string | null;
}

interface Medication {
  id: number;
  patient_id: string;
  medication: string;
  medication_code: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  dosage: string | null;
}

interface Condition {
  id: number;
  patient_id: string;
  condition: string;
  condition_code: string | null;
  onset_date: string | null;
  abatement_date: string | null;
}

/**
 * Generate insights about a patient's medication history
 */
export async function generateMedicationInsights(
  patientData: Patient,
  medications: Medication[]
): Promise<string> {
  const prompt = `
  You are a clinical data analyst examining patient medication data.
  Analyze the following medication history and provide insights on:
  1. Patterns in medication usage over time
  2. Potential adherence issues based on refill patterns
  3. Any concerning drug combinations or changes in therapy
  4. Suggestions for optimizing the medication regimen
  
  Patient: ${patientData.name} (${patientData.gender}, DOB: ${patientData.birthDate})
  
  Medication history:
  ${medications
    .map(
      (med) =>
        `- ${med.medication} (${
          med.dosage || "No dosage info"
        }): Started ${med.start_date}, Status: ${med.status}`
    )
    .join("\n")}
  
  FORMAT YOUR RESPONSE AS FOLLOWS:
  1. Medication Patterns: [Your analysis of medication usage patterns over time]
  
  2. Adherence Assessment: [Your analysis of potential adherence issues]
  
  3. Drug Interactions & Changes: [Your analysis of concerning combinations or therapy changes]
  
  4. Regimen Optimization: [Your recommendations for improving the medication regimen]
  
  Important:
  - Use proper Markdown formatting with **bold** for emphasis
  - Each section should be clearly numbered and labeled
  - Be concise and focused on clinical insights
  - Do not include patient's name, gender, DOB, marital status, or phone number
  - Do not include any asterisks (**) as standalone separators
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating medication insights:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
}

/**
 * Generate insights about a patient's condition history
 */
export async function generateConditionInsights(
  patientData: Patient,
  conditions: Condition[]
): Promise<string> {
  const prompt = `
  You are a clinical data analyst examining patient condition data.
  Analyze the following condition history and provide insights on:
  1. Progression of conditions over time
  2. Potential relationships between conditions
  3. Typical trajectory for these conditions
  4. Suggestions for monitoring or treatment considerations
  
  Patient: ${patientData.name} (${patientData.gender}, DOB: ${patientData.birthDate})
  
  Condition history:
  ${conditions
    .map(
      (cond) =>
        `- ${cond.condition} (Code: ${
          cond.condition_code || "Unknown"
        }): Onset ${cond.onset_date || "Unknown"}, Abatement: ${
          cond.abatement_date || "Ongoing"
        }`
    )
    .join("\n")}
  
  Please provide your longitudinal analysis of this patient's condition progression. 
  
  FORMAT YOUR RESPONSE AS FOLLOWS:
  1. Condition Progression: [Your analysis of how conditions have progressed over time]
  
  2. Condition Relationships: [Your analysis of how conditions might be related]
  
  3. Future Trajectory: [Your analysis of the likely progression of these conditions]
  
  4. Monitoring & Treatment: [Your recommendations for monitoring and treatment]
  
  Important:
  - Use proper Markdown formatting with **bold** for emphasis
  - Each section should be clearly numbered and labeled
  - Be concise and focused on clinical insights
  - Do not include patient's name, gender, DOB, marital status, or phone number
  - Do not include any asterisks (**) as standalone separators
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating condition insights:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
}

/**
 * Generate comprehensive insights about a patient's health
 */
export async function generateComprehensiveInsights(
  patientData: Patient,
  conditions: Condition[],
  medications: Medication[]
): Promise<string> {
  const prompt = `
  You are a clinical data analyst examining comprehensive patient health data.
  Analyze the following patient information and provide insights on:
  1. Relationships between conditions and medications
  2. Potential areas of concern in the overall treatment plan
  3. Suggestions for comprehensive care optimization
  4. Temporal patterns across both conditions and medications
  
  Patient: ${patientData.name} (${patientData.gender}, DOB: ${patientData.birthDate})
  
  Condition history:
  ${conditions
    .map(
      (cond) =>
        `- ${cond.condition} (Code: ${
          cond.condition_code || "Unknown"
        }): Onset ${cond.onset_date || "Unknown"}, Abatement: ${
          cond.abatement_date || "Ongoing"
        }`
    )
    .join("\n")}
  
  Medication history:
  ${medications
    .map(
      (med) =>
        `- ${med.medication} (${
          med.dosage || "No dosage info"
        }): Started ${med.start_date}, Status: ${med.status}`
    )
    .join("\n")}
  
  FORMAT YOUR RESPONSE AS FOLLOWS:
  1. Relationships Between Conditions and Medications: [Your analysis of how conditions and medications are related]
  
  2. Potential Areas of Concern: [Your analysis of concerning aspects of the treatment plan]
  
  3. Suggestions for Comprehensive Care: [Your recommendations for optimizing care]
  
  4. Temporal Patterns: [Your analysis of patterns over time in conditions and medications]
  
  Important:
  - Use proper Markdown formatting with **bold** for emphasis
  - Each section should be clearly numbered and labeled
  - Be concise and focused on clinical insights
  - Do not include patient's name, gender, DOB, marital status, or phone number
  - Do not include any asterisks (**) as standalone separators
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating comprehensive insights:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
}

/**
 * Generate response to a user's question about a specific patient
 */
export async function generatePatientChatResponse(
  patientData: Patient,
  conditions: Condition[],
  medications: Medication[],
  userQuery: string
): Promise<string> {
  const prompt = `
  You are a clinical data analyst examining comprehensive patient health data.
  Answer the following question about the patient based on their health records:
  
  "${userQuery}"
  
  Patient: ${patientData.name} (${patientData.gender}, DOB: ${patientData.birthDate})
  
  Condition history:
  ${conditions
    .map(
      (cond) =>
        `- ${cond.condition} (Code: ${
          cond.condition_code || "Unknown"
        }): Onset ${cond.onset_date || "Unknown"}, Abatement: ${
          cond.abatement_date || "Ongoing"
        }`
    )
    .join("\n")}
  
  Medication history:
  ${medications
    .map(
      (med) =>
        `- ${med.medication} (${
          med.dosage || "No dosage info"
        }): Started ${med.start_date}, Status: ${med.status}`
    )
    .join("\n")}
  
  Please provide a brief, specific answer to the question. Be professional, accurate, and helpful. Do not include the patient's name in your response, refer to them as "the patient" instead. Also do not mention their specific gender, DOB, marital status, and phone number in your response.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm unable to answer that question at the moment. Please try again later.";
  }
} 