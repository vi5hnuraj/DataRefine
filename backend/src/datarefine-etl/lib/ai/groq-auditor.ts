import Groq from 'groq-sdk';
import { FinalETLOutput } from '../etl/types';

export class GroqAuditor {
  static async auditDataset(filename: string, etlOutput: FinalETLOutput) {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is not set. Skipping AI audit.");
      return null;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Sample rows up to 5 to avoid exceeding context
    const sampleRows = etlOutput.processedData.slice(0, 5);

    const prompt = `You are a Senior Data Quality Analyst.
Review the ETL report and provide a JSON response evaluating the data quality.

CRITICAL INSTRUCTIONS:
1. The AI must never invent ETL failures, pipeline errors, security issues, or business risks.
2. The AI can only discuss: validation errors, duplicate records, null values, schema inconsistencies, and quality score findings.
3. If a metric is 0, AI must not mention it.
4. The AI must strictly derive conclusions from supplied ETL statistics.
5. Never hallucinate problems that are not present in the ETL report.
6. You must generate a confidenceScore (0-100) based on these strict rules:
   - High confidence (91-100) when aiQualityScore > 90 AND validation errors <= 1
   - Medium confidence (70-90) when aiQualityScore is between 70 and 90
   - Low confidence (0-69) when aiQualityScore < 70

DATASET: ${filename}
Total Records: ${etlOutput.statistics.totalRecords}
Valid Records: ${etlOutput.statistics.validRecords}
Invalid Records: ${etlOutput.statistics.invalidRecords}
Duplicate Records: ${etlOutput.statistics.duplicateRecords}
Null Values Standardized: ${etlOutput.statistics.nullValues}
ETL Error Count: ${etlOutput.statistics.validationErrorCount}

Sample Processed Rows:
${JSON.stringify(sampleRows, null, 2)}

Provide your response in EXACTLY this JSON structure:
{
  "executiveSummary": "A concise summary of the dataset's quality",
  "dataQualityAssessment": "A detailed paragraph assessing the dataset health",
  "keyRisks": ["risk 1", "risk 2"],
  "recommendations": ["rec 1", "rec 2"],
  "productionReadiness": "Ready / Ready with Minor Corrections / Not Ready",
  "aiQualityScore": 95,
  "confidenceScore": 95
}

Keep responses concise, professional, and strictly valid JSON. Do not wrap it in markdown. Output ONLY the JSON object.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) throw new Error("Empty response from Groq");
      
      const parsed = JSON.parse(responseContent);
      return {
        executiveSummary: parsed.executiveSummary || "No summary provided.",
        dataQualityAssessment: parsed.dataQualityAssessment || "No assessment provided.",
        keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        productionReadiness: parsed.productionReadiness || "Unknown",
        aiQualityScore: typeof parsed.aiQualityScore === 'number' ? parsed.aiQualityScore : 0,
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0
      };
    } catch (e: any) {
      console.error("Groq AI Error:", e.message);
      return null;
    }
  }
}
