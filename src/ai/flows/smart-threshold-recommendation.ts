'use server';

/**
 * @fileOverview AI-powered tool for recommending optimal alert thresholds for sensors.
 *
 * - recommendThresholds - A function that recommends thresholds for a sensor.
 * - RecommendThresholdsInput - The input type for the recommendThresholds function.
 * - RecommendThresholdsOutput - The return type for the recommendThresholds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendThresholdsInputSchema = z.object({
  sensorType: z.string().describe('The type of the sensor (e.g., temperature, pressure, humidity).'),
  historicalData: z.string().describe('Historical sensor data as a JSON string.'),
  industry: z.string().describe('The industry the sensor is used in (e.g., agriculture, manufacturing).'),
});
export type RecommendThresholdsInput = z.infer<typeof RecommendThresholdsInputSchema>;

const RecommendThresholdsOutputSchema = z.object({
  warningThreshold: z.number().describe('Recommended warning threshold for the sensor.'),
  criticalThreshold: z.number().describe('Recommended critical threshold for the sensor.'),
  explanation: z.string().describe('Explanation of why these thresholds were recommended.'),
});
export type RecommendThresholdsOutput = z.infer<typeof RecommendThresholdsOutputSchema>;

export async function recommendThresholds(
  input: RecommendThresholdsInput
): Promise<RecommendThresholdsOutput> {
  return recommendThresholdsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendThresholdsPrompt',
  input: {schema: RecommendThresholdsInputSchema},
  output: {schema: RecommendThresholdsOutputSchema},
  prompt: `You are an AI expert in sensor data analysis and threshold recommendation.

  Based on the sensor type, historical data, and industry, you will recommend optimal warning and critical thresholds.
  Explain your reasoning for the recommended thresholds.

  Sensor Type: {{{sensorType}}}
  Historical Data: {{{historicalData}}}
  Industry: {{{industry}}}

  Consider industry best practices and the provided historical data to avoid false alarms and ensure timely intervention.
  The historical data is provided as a JSON string, so parse it appropriately.
  
  Return the thresholds as numbers, not strings.

  Here is the output schema:
  ${JSON.stringify(RecommendThresholdsOutputSchema.describe(''))}`,
});

const recommendThresholdsFlow = ai.defineFlow(
  {
    name: 'recommendThresholdsFlow',
    inputSchema: RecommendThresholdsInputSchema,
    outputSchema: RecommendThresholdsOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.historicalData);
    } catch (e: any) {
      throw new Error(
        'Historical data is not a valid JSON string.  The error message was: ' + e.message
      );
    }
    const {output} = await prompt(input);
    return output!;
  }
);
