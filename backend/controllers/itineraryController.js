import { GoogleGenerativeAI } from '@google/generative-ai';
import { generatePrompt } from '../utils/promptGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'PLACEHOLDER');

export const generateItinerary = async (req, res) => {
  try {
    const { fromCity, destination, numberOfDays, budget, familyType } = req.body;

    // Validate input
    if (!fromCity || !destination || !numberOfDays || !budget || !familyType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide all required fields: fromCity, destination, numberOfDays, budget, and familyType'
      });
    }

    // Check if API key is set
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your backend/.env file.'
      });
    }

    const prompt = generatePrompt(fromCity, destination, numberOfDays, budget, familyType);
    
    // Choose model
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const runGeneration = async (retryCount = 0) => {
        try {
            const result = await model.generateContent(prompt);
            return await result.response;
        } catch (err) {
            // Check for 429 (Too Many Requests) or 503 (Service Unavailable/Overloaded)
            const isRetryable = err.status === 429 || 
                              err.status === 503 || 
                              err.message.includes('429') || 
                              err.message.includes('503') || 
                              err.message.includes('quota') ||
                              err.message.includes('overloaded');

            if (isRetryable && retryCount < 5) {
                const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000); 
                console.log(`Hit transient error (${err.status || 'unknown'}). Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/5)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return runGeneration(retryCount + 1);
            }
            throw err;
        }
    };

    try {
      const response = await runGeneration();
      const text = response.text();
      
      console.log('Gemini API Response received');

      let jsonData;
      try {
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        jsonData = JSON.parse(cleanedText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        return res.status(500).json({
          error: 'Parsing Error',
          message: 'Failed to parse the itinerary from AI response.',
          raw: text
        });
      }

      res.json(jsonData);

    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      
      if (apiError.message?.includes('404')) {
         return res.status(500).json({
          error: 'Model Not Found',
          message: `The configured Gemini model (${process.env.GEMINI_MODEL}) was not found using your API key.`
        });
      }
      
      if (apiError.message?.includes('429') || apiError.message?.includes('usage') || apiError.message?.includes('quota')) {
         return res.status(429).json({
          error: 'Rate Limit Exceeded',
          message: 'The AI service is busy or you have ran out of free quota. Please try again in a few moments.'
        });
      }
      
      if (apiError.message?.includes('API key') || apiError.message?.includes('403')) {
        return res.status(401).json({
          error: 'Authorization Error',
          message: 'Invalid Gemini API Key. Please check your .env file.'
        });
      }

      if (apiError.status === 503 || apiError.message?.includes('503') || apiError.message?.includes('overloaded')) {
         return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Google Gemini AI services are currently overloaded. We tried multiple times but could not generate your itinerary. Please wait a minute and try again.'
        });
      }

      throw apiError;
    }

  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred.'
    });
  }
};
