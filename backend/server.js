import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.'
      });
    }

    // Generate prompt
    const prompt = generatePrompt(fromCity, destination, numberOfDays, budget, familyType);

    // Get API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // Get the model name (FREE TIER MODELS ONLY)
    // Free tier models need version suffixes: gemini-1.5-flash-latest, gemini-1.5-pro-latest
    const preferredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
    
    // Define allowed FREE TIER models with version suffixes
    const freeTierModels = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-001',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-001'
    ];
    
    // Normalize model name - add -latest if no version suffix provided
    let normalizedPreferredModel = preferredModel;
    if (!preferredModel.includes('-latest') && !preferredModel.includes('-001')) {
      // If user provided just "gemini-1.5-flash" or "gemini-1.5-pro", add -latest
      if (preferredModel.includes('flash')) {
        normalizedPreferredModel = 'gemini-1.5-flash-latest';
      } else if (preferredModel.includes('pro')) {
        normalizedPreferredModel = 'gemini-1.5-pro-latest';
      } else {
        normalizedPreferredModel = 'gemini-1.5-flash-latest';
      }
    }
    
    // Validate preferred model is in free tier (check base name)
    const baseModelName = normalizedPreferredModel.split('-').slice(0, 3).join('-'); // Get "gemini-1.5-flash" or "gemini-1.5-pro"
    if (!baseModelName.includes('gemini-1.5-flash') && !baseModelName.includes('gemini-1.5-pro')) {
      console.warn(`Warning: ${preferredModel} is not a free tier model. Using gemini-1.5-flash-latest instead.`);
      normalizedPreferredModel = 'gemini-1.5-flash-latest';
    }
    
    // List of FREE TIER models to try in order (fallback mechanism)
    // Only using models available in free tier quota with proper version suffixes
    const modelNamesToTry = [
      normalizedPreferredModel,
      'gemini-1.5-flash-latest',  // Free tier - fastest, recommended
      'gemini-1.5-flash-001',     // Alternative version
      'gemini-1.5-pro-latest',    // Free tier - more capable (with rate limits)
      'gemini-1.5-pro-001'         // Alternative version
    ];

    let text;
    let lastError;
    let triedModels = [];

    // Try each model until one works
    for (const tryModelName of modelNamesToTry) {
      // Skip if we already tried this model
      if (triedModels.includes(tryModelName)) continue;
      
      triedModels.push(tryModelName);
      
      try {
        console.log(`Attempting to use model: ${tryModelName}`);
        
        // Set timeout for the request (30 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        // Make REST API call to Gemini
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${tryModelName}:generateContent?key=${GEMINI_API_KEY}`;
        
        const fetchResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check if request was successful
        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || `HTTP ${fetchResponse.status}`;
          
          // If it's a model not found error, try next model
          if (fetchResponse.status === 404 || errorMessage.includes('not found')) {
            lastError = new Error(errorMessage);
            console.log(`Model ${tryModelName} failed: ${errorMessage}`);
            continue;
          }
          
          // For other HTTP errors, throw immediately
          throw new Error(errorMessage);
        }

        // Parse response
        const data = await fetchResponse.json();
        
        // Extract text from response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          text = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Invalid response structure from Gemini API');
        }
        
        // If we get here, the model worked!
        console.log(`Successfully used model: ${tryModelName}`);
        break;
      } catch (err) {
        // Handle abort (timeout)
        if (err.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        lastError = err;
        console.log(`Model ${tryModelName} failed: ${err.message}`);
        
        // If it's a model not found error, try next model
        // Check for various "not found" error patterns from Gemini API
        const isModelNotFound = 
          err.message?.includes('not found') || 
          err.message?.includes('404') ||
          err.message?.includes('is not found for API version') ||
          err.message?.includes('not supported for generateContent');
        
        if (isModelNotFound) {
          continue;
        }
        // For other errors (timeout, API key, etc.), throw immediately
        throw err;
      }
    }

    // If we exhausted all models, throw error
    if (!text) {
      throw new Error(`No available Gemini model found. Tried: ${triedModels.join(', ')}. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Try to extract JSON from the response
    let jsonData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response text:', text);
      return res.status(500).json({ 
        error: 'Invalid response format',
        message: 'The AI response could not be parsed. Please try again.',
        rawResponse: text
      });
    }

    // Validate the response structure
    if (!jsonData.itinerary || !Array.isArray(jsonData.itinerary)) {
      return res.status(500).json({ 
        error: 'Invalid response structure',
        message: 'The AI response does not contain a valid itinerary. Please try again.'
      });
    }

    res.json(jsonData);

  } catch (error) {
    console.error('Error generating itinerary:', error);
    
    if (error.message === 'Request timeout') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'The request took too long to process. Please try again.'
      });
    }

    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The Gemini API key is invalid. Please check your configuration.'
      });
    }

    // Handle model not found errors
    if (error.message?.includes('not found') || error.message?.includes('404') || error.message?.includes('No available Gemini model')) {
      return res.status(500).json({ 
        error: 'Model not found',
        message: 'The specified Gemini model is not available. Please use a free tier model with version suffix: GEMINI_MODEL=gemini-1.5-flash-latest or gemini-1.5-pro-latest in your .env file.'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred while generating the itinerary. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Travel Planner API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
