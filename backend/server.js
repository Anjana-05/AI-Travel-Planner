import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateItineraryWithLLM } from './services/llmService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Fallback: Generate itinerary without LLM (for testing when API key is not set)
const generateMockItinerary = (formData) => {
  const { destination, numberOfDays, budget, familyType } = formData
  const totalDays = parseInt(numberOfDays)
  const totalBudget = parseFloat(budget)
  
  const baseActivities = {
    'solo': ['Explore local markets', 'Visit historical sites', 'Try local cuisine', 'Photography tour'],
    'couple': ['Romantic dinner', 'Scenic walk', 'Couple spa session', 'Sunset cruise'],
    'family-kids': ['Amusement park', 'Zoo visit', 'Beach activities', 'Interactive museum'],
    'family-elder': ['Gentle city tour', 'Historical sites', 'Comfortable restaurant', 'Scenic viewpoints']
  }

  const getTravelIntensity = (count) => {
    if (count <= 2) return 'Low'
    if (count <= 4) return 'Medium'
    return 'High'
  }

  const itinerary = []
  const activities = baseActivities[familyType] || baseActivities['solo']
  
  for (let day = 1; day <= totalDays; day++) {
    const activitiesCount = day === 1 ? 3 : day === totalDays ? 2 : 4
    const dayActivities = activities.slice(0, activitiesCount)
    const travelIntensity = getTravelIntensity(dayActivities.length)
    const estimatedCost = Math.round(totalBudget / totalDays)
    
    itinerary.push({
      day,
      activities: dayActivities,
      travelIntensity,
      estimatedCost
    })
  }
  
  return itinerary
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Travel Planner API is running' })
})

app.post('/api/plan-trip', async (req, res) => {
  try {
    const { fromCity, destination, numberOfDays, budget, familyType } = req.body

    // Validation
    if (!fromCity || !destination || !numberOfDays || !budget || !familyType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide all required fields: fromCity, destination, numberOfDays, budget, familyType'
      })
    }

    // Generate itinerary using LLM API
    let itinerary
    let budgetBreakdown = null
    let tips = []
    const useLLM = process.env.USE_LLM !== 'false' && (
      process.env.OPENAI_API_KEY || 
      process.env.ANTHROPIC_API_KEY || 
      process.env.GOOGLE_API_KEY
    )

    if (useLLM) {
      try {
        // Generate itinerary using real LLM API
        const llmResponse = await generateItineraryWithLLM({
          fromCity,
          destination,
          numberOfDays,
          budget,
          familyType
        })
        
        // Handle new response format with budgetBreakdown and tips
        if (llmResponse.itinerary) {
          itinerary = llmResponse.itinerary
          budgetBreakdown = llmResponse.budgetBreakdown || null
          tips = llmResponse.tips || []
        } else {
          // Fallback for old format (array directly)
          itinerary = Array.isArray(llmResponse) ? llmResponse : []
        }
      } catch (llmError) {
        console.error('LLM API Error:', llmError)
        
        // If LLM fails and fallback is enabled, use mock data
        if (process.env.LLM_FALLBACK === 'true') {
          console.log('Falling back to mock itinerary generation')
          itinerary = generateMockItinerary({
            destination,
            numberOfDays,
            budget,
            familyType
          })
        } else {
          // Return error if LLM fails and no fallback
          return res.status(503).json({
            error: 'AI Service Unavailable',
            message: llmError.message || 'The AI service is currently unavailable. Please try again later.'
          })
        }
      }
    } else {
      // Use mock data if LLM is disabled or no API key is set
      console.log('Using mock itinerary (LLM not configured)')
      itinerary = generateMockItinerary({
        destination,
        numberOfDays,
        budget,
        familyType
      })
    }

    // Calculate total estimated cost
    const totalEstimatedCost = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0)

    res.json({
      success: true,
      data: {
        fromCity,
        destination,
        numberOfDays,
        budget: parseFloat(budget),
        familyType,
        itinerary,
        totalEstimatedCost,
        budgetBreakdown,
        tips
      }
    })
  } catch (error) {
    console.error('Error generating itinerary:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while generating your itinerary. Please try again.'
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Travel Planner API server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🎯 Plan trip: POST http://localhost:${PORT}/api/plan-trip`)
})
