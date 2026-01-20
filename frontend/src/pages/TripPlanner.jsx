import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import TripPlannerForm from '../components/TripPlannerForm.jsx'
import ItineraryDisplay from '../components/ItineraryDisplay.jsx'

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('API URL:', API_BASE_URL); // Debugging

function TripPlanner() {
  const [itineraryData, setItineraryData] = useState(null)
  const [formData, setFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleFormSubmit = async (submittedData) => {
    setIsLoading(true)
    setError(null)
    setFormData(submittedData)

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCity: submittedData.fromCity,
          destination: submittedData.destination,
          numberOfDays: submittedData.numberOfDays,
          budget: submittedData.budget,
          familyType: submittedData.familyType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setItineraryData(data)
    } catch (err) {
      // Log full technical details to console for debugging
      console.error('Detailed Error:', err)
      
      let userFriendlyMessage = 'Something went wrong while planning your trip. Please try again.'

      const errorMessage = err.message || '';

      // Map technical errors to polite user messages
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        userFriendlyMessage = 'We are unable to connect to the server at the moment. Please check your connection.'
      } else if (errorMessage.includes('timeout')) {
         userFriendlyMessage = 'The trip planning is taking a bit longer than usual. Please try again.';
      } else if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        userFriendlyMessage = 'Our travel AI is currently very popular and experiencing high traffic. Please wait a minute and try again.'
      } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('busy')) {
        userFriendlyMessage = 'We are processing many requests right now. Please try again in a moment.'
      } else if (errorMessage.includes('Model Not Found') || errorMessage.includes('API key')) {
         userFriendlyMessage = 'We are experiencing a temporary configuration issue. Please try again later.'
      }

      setError(userFriendlyMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTrip = async () => {
    if (!itineraryData || !formData) return

    try {
      const tripToSave = {
        ...formData,
        ...itineraryData,
      }

      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripToSave),
      })

      if (!response.ok) {
        throw new Error('Failed to save trip')
      }

      alert('Trip saved successfully!')
      navigate('/my-trips')
    } catch (err) {
      console.error('Error saving trip:', err)
      alert('Failed to save trip. Please try again.')
    }
  }

  const handleReset = () => {
    setItineraryData(null)
    setFormData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 sm:py-12">
        {itineraryData ? (
          <ItineraryDisplay 
            itineraryData={itineraryData} 
            onReset={handleReset} 
            onSave={handleSaveTrip}
          />
        ) : (
          <TripPlannerForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>
    </div>
  )
}

export default TripPlanner
