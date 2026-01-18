import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { Trip } from './models/Trip.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate itinerary prompt
function generatePrompt(fromCity, destination, days, budget, familyType) {
  return `Context:
The user is planning a short trip and wants a realistic, budget-friendly itinerary that fits their family type.

Role:
You are a professional travel planner AI experienced in planning trips for solo travelers, couples, families with kids, and families with elders.

Instruction:
Generate a day-wise travel itinerary based on the given input.

Specification:
Input details:
- From City: ${fromCity}
- Destination: ${destination}
- Number of Days: ${days}
- Total Budget: ${budget}
- Family Type: ${familyType}

Rules:
- Activities must match the given family type.
- Travel intensity must be one of: Low, Medium, High.
- Estimated costs must be numeric values only.
- The total estimated cost must not exceed the given budget.
- Avoid luxury options unless the budget clearly allows it.

Performance:
- The itinerary must be practical and realistic.
- Balance sightseeing with adequate rest.
- Budget distribution should be believable.
- Output must be easy to parse in a frontend application.

Example Output Format (JSON):
{
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival and Local Sightseeing",
      "activities": [
        "Hotel check-in",
        "Visit local park",
        "Evening leisure walk"
      ],
      "travelIntensity": "Low",
      "estimatedCost": 3000
    }
  ],
  "budgetBreakdown": {
    "stay": 8000,
    "transport": 6000,
    "food": 5000,
    "activities": 4000,
    "totalEstimatedCost": 23000,
    "perDayCost": 3500
  },
  "tips": [
    "Start early to avoid crowds",
    "Keep buffer time for rest"
  ]
}

Return ONLY valid JSON in the exact same structure as shown above.
Do not include explanations, markdown, or extra text.`;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'PLACEHOLDER');

// API endpoint to generate itinerary
app.post('/api/generate-itinerary', async (req, res) => {
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
    
    // Choose model - use gemini-2.5-flash as it is the current standard (2026)
    // Fallback to gemini-pro if needed for compatibility
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
            // Check for 429 (Too Many Requests) or 503 (Service Unavailable)
            if ((err.status === 429 || err.message.includes('429') || err.message.includes('quota')) && retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000); // Exponential backoff
                console.log(`Hit rate limit. Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/3)`);
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
        // Clean up markdown code blocks if the model adds them despite instructions
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        jsonData = JSON.parse(cleanedText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Raw Text:', text);
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
          message: `The configured Gemini model (${process.env.GEMINI_MODEL}) was not found using your API key. Try changing GEMINI_MODEL in .env to "gemini-2.5-flash", "gemini-2.0-flash-lite", or "gemini-pro".`
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

      throw apiError;
    }

  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred.'
    });
  }
});

// --- Trip Management Endpoints ---

// Save a trip
app.post('/api/trips', async (req, res) => {
  try {
    const tripData = req.body;
    const newTrip = new Trip(tripData);
    await newTrip.save();
    res.status(201).json({ message: 'Trip saved successfully', trip: newTrip });
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ error: 'Failed to save trip', message: error.message });
  }
});

// Get all trips
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ generatedAt: -1 }); // Newest first
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips', message: error.message });
  }
});

// Get a specific trip
app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip', message: error.message });
  }
});

// Delete a trip
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
    if (!deletedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    apiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
