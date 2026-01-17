# Travel Planner Backend API

Backend server for the AI Trip Planner application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
# Server Configuration
PORT=5000

# LLM Configuration
LLM_PROVIDER=openai
USE_LLM=true
LLM_FALLBACK=true

# OpenAI API Key (required if using OpenAI)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

**LLM Setup Options:**

- **With OpenAI (Recommended):**
  - Get your API key from https://platform.openai.com/api-keys
  - Set `OPENAI_API_KEY` in `.env`
  - Set `LLM_PROVIDER=openai`
  - Models: `gpt-3.5-turbo` (default), `gpt-4`, `gpt-4-turbo-preview`

- **Without LLM (Mock Data):**
  - Set `USE_LLM=false` in `.env`
  - Or simply don't set any API keys
  - The server will use mock itinerary generation

- **With Fallback:**
  - Set `LLM_FALLBACK=true` to use mock data if LLM fails
  - Useful for development and testing

3. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Plan Trip
- **POST** `/api/plan-trip`
- **Body:**
```json
{
  "fromCity": "New York",
  "destination": "Paris",
  "numberOfDays": "5",
  "budget": "5000",
  "familyType": "couple"
}
```

- **Response:**
```json
{
  "success": true,
  "data": {
    "fromCity": "New York",
    "destination": "Paris",
    "numberOfDays": 5,
    "budget": 5000,
    "familyType": "couple",
    "itinerary": [
      {
        "day": 1,
        "activities": ["Activity 1", "Activity 2"],
        "travelIntensity": "Medium",
        "estimatedCost": 1200
      }
    ],
    "totalEstimatedCost": 5000
  }
}
```

## LLM Integration

The backend now uses **real LLM APIs** to generate itineraries:

- **OpenAI GPT** (fully implemented)
- **Anthropic Claude** (placeholder - ready for implementation)
- **Google Gemini** (placeholder - ready for implementation)

The LLM generates:
- Day-specific activities based on destination
- Culturally relevant and location-specific recommendations
- Appropriate activities for the selected family type
- Realistic cost estimates distributed across days
- Travel intensity calculations

## Error Handling

The API handles:
- Missing required fields (400)
- LLM API failures (503) - with optional fallback to mock data
- Missing API keys (503)
- Internal server errors (500)
- Timeout scenarios (handled by client)
- Network errors from LLM providers