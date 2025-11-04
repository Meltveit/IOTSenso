'use server';

/**
 * @fileOverview Analyzes sensor data to predict potential equipment failures and recommends proactive maintenance.
 *
 * - predictiveMaintenanceAnalysis - A function that analyzes sensor data and predicts potential failures.
 * - PredictiveMaintenanceInput - The input type for the predictiveMaintenanceAnalysis function.
 * - PredictiveMaintenanceOutput - The return type for the predictiveMaintenanceAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveMaintenanceInputSchema = z.object({
  sensorData: z.string().describe('Historical sensor data in JSON format.'),
  equipmentType: z.string().describe('Type of equipment the sensor data pertains to.'),
  maintenanceHistory: z.string().optional().describe('A history of maintenance performed on this equipment, in JSON format.'),
});
export type PredictiveMaintenanceInput = z.infer<typeof PredictiveMaintenanceInputSchema>;

const PredictiveMaintenanceOutputSchema = z.object({
  failurePrediction: z.string().describe('A prediction of potential equipment failures.'),
  recommendedActions: z.string().describe('Recommended maintenance actions to prevent failures.'),
  confidenceLevel: z.number().describe('Confidence level of the prediction (0-1).'),
});
export type PredictiveMaintenanceOutput = z.infer<typeof PredictiveMaintenanceOutputSchema>;

export async function predictiveMaintenanceAnalysis(input: PredictiveMaintenanceInput): Promise<PredictiveMaintenanceOutput> {
  return predictiveMaintenanceAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveMaintenancePrompt',
  input: {schema: PredictiveMaintenanceInputSchema},
  output: {schema: PredictiveMaintenanceOutputSchema},
  prompt: `You are an expert in predictive maintenance for industrial equipment. Analyze the provided sensor data to predict potential equipment failures and recommend proactive maintenance actions.

  Equipment Type: {{{equipmentType}}}
  Sensor Data: {{{sensorData}}}
  Maintenance History: {{{maintenanceHistory}}}

  Based on this information, provide a failure prediction, recommended maintenance actions, and a confidence level for your prediction.
  Ensure that the failurePrediction and recommendedActions are actionable for the user.

  Return the response in JSON format according to the PredictiveMaintenanceOutputSchema. The descriptions in the schema are:
  ${JSON.stringify(PredictiveMaintenanceOutputSchema.shape, null, 2)}
  `,
});

const predictiveMaintenanceAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveMaintenanceAnalysisFlow',
    inputSchema: PredictiveMaintenanceInputSchema,
    outputSchema: PredictiveMaintenanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
