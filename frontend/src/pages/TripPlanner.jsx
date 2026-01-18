import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import TripPlannerForm from '../components/TripPlannerForm.jsx'
import ItineraryDisplay from '../components/ItineraryDisplay.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
      console.error('Error generating itinerary:', err)
      
      // Handle different error types
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Unable to connect to the server. Please make sure the backend server is running on http://localhost:3000')
      } else if (err.message.includes('timeout')) {
        setError('The request took too long to process. Please try again.')
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.')
      }
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
