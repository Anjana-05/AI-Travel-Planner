# Travel Planner Backend

Backend API server for the AI Trip Planner application using Google Gemini AI.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Create a `.env` file in the backend folder
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     PORT=3000
     GEMINI_MODEL=gemini-1.5-flash
     ```
   - **Note:** `GEMINI_MODEL` is optional. Default is `gemini-1.5-flash`. 
   - **FREE TIER MODELS ONLY:** Only `gemini-1.5-flash` and `gemini-1.5-pro` are supported (free tier quota models).

3. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env` file

4. **Run the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST `/api/generate-itinerary`
Generates a travel itinerary based on user input.

**Request Body:**
```json
{
  "fromCity": "New York",
  "destination": "Paris",
  "numberOfDays": "5",
  "budget": "10000",
  "familyType": "couple"
}
```

**Response:**
```json
{
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival and Local Sightseeing",
      "activities": ["Hotel check-in", "Visit local park"],
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
  "tips": ["Start early to avoid crowds"]
}
```

### GET `/api/health`
Health check endpoint.
