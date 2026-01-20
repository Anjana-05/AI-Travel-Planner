import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ItineraryDisplay from '../components/ItineraryDisplay.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TripDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTripDetails()
  }, [id])

  const fetchTripDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${id}`)
      if (!response.ok) throw new Error('Failed to fetch trip details')
      const data = await response.json()
      setTrip(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete trip')
      navigate('/my-trips')
    } catch (err) {
      alert('Error deleting trip: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/my-trips" className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
            ← Back to My Trips
          </Link>
          
          {trip && (
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Delete Trip
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Error: {error}
          </div>
        ) : trip ? (
          <ItineraryDisplay itineraryData={trip} isSavedView={true} />
        ) : (
          <div className="text-center py-12">
            Trip not found
          </div>
        )}
      </main>
    </div>
  )
}

export default TripDetails