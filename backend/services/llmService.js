/**
 * LLM Service for generating travel itineraries
 * Supports OpenAI by default, can be extended for other providers
 */

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai'

/**
 * Generate itinerary using LLM API
 */
export async function generateItineraryWithLLM(formData) {
  const { fromCity, destination, numberOfDays, budget, familyType } = formData

  switch (LLM_PROVIDER.toLowerCase()) {
    case 'openai':
      return await generateWithOpenAI(formData)
    case 'anthropic':
      return await generateWithAnthropic(formData)
    case 'google':
      return await generateWithGoogle(formData)
    default:
      throw new Error(`Unsupported LLM provider: ${LLM_PROVIDER}`)
  }
}

/**
 * Generate itinerary using OpenAI API
 */
async function generateWithOpenAI(formData) {
  const { fromCity, destination, numberOfDays, budget, familyType } = formData

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }

  const familyTypeDescriptions = {
    'solo': 'solo traveler',
    'couple': 'couple',
    'family-kids': 'family with children',
    'family-elder': 'family with elderly members'
  }

  const prompt = `Context: The user is planning a short trip and wants a realistic, budget-friendly itinerary that fits their family type.

Role: You are a professional travel planner AI experienced in planning trips for solo travelers, couples, families with kids, and families with elders.

Instruction: Generate a day-wise travel itinerary based on the given input.

Specification:
- Input:
- From City: ${fromCity}
- Destination: ${destination}
- Number of Days: ${numberOfDays}
- Total Budget: ${budget}
- Family Type: ${familyTypeDescriptions[familyType] || familyType}
- Activities must match the family type.
- Travel intensity must be Low, Medium, or High.
- Estimated costs must be numeric.
- The total cost should not exceed the given budget.
- Avoid luxury options unless budget allows.

Performance:
- Output must be practical and realistic.
- The itinerary should balance sightseeing and rest.
- Budget distribution should be reasonable and believable.
- The response must be easy to parse in a frontend application.

Example: {
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

Return ONLY valid JSON in the same format as the example.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional travel planner. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI API')
    }

    // Parse JSON response
    let itineraryData
    try {
      itineraryData = JSON.parse(content)
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        itineraryData = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Failed to parse LLM response as JSON')
      }
    }

    // Validate and format the response
    if (!itineraryData.itinerary || !Array.isArray(itineraryData.itinerary)) {
      throw new Error('Invalid itinerary format from LLM')
    }

    // Ensure all days are present and properly formatted
    const formattedItinerary = itineraryData.itinerary.map((day, index) => ({
      day: day.day || index + 1,
      title: day.title || `Day ${day.day || index + 1}`,
      activities: Array.isArray(day.activities) ? day.activities : [],
      travelIntensity: ['Low', 'Medium', 'High'].includes(day.travelIntensity) 
        ? day.travelIntensity 
        : 'Medium',
      estimatedCost: typeof day.estimatedCost === 'number' ? Math.round(day.estimatedCost) : 0
    }))

    // Include additional data if present
    const result = {
      itinerary: formattedItinerary,
      budgetBreakdown: itineraryData.budgetBreakdown || null,
      tips: Array.isArray(itineraryData.tips) ? itineraryData.tips : []
    }

    return result
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
}

/**
 * Generate itinerary using Anthropic Claude API
 */
async function generateWithAnthropic(formData) {
  const { fromCity, destination, numberOfDays, budget, familyType } = formData

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
  }

  // Similar implementation for Anthropic
  // This is a placeholder - implement based on Anthropic API docs
  throw new Error('Anthropic integration not yet implemented')
}

/**
 * Generate itinerary using Google Gemini API
 */
async function generateWithGoogle(formData) {
  const { fromCity, destination, numberOfDays, budget, familyType } = formData

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables')
  }

  // Similar implementation for Google Gemini
  // This is a placeholder - implement based on Google API docs
  throw new Error('Google Gemini integration not yet implemented')
}
