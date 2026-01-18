import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

function MyTrips() {
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips`)
      if (!response.ok) throw new Error('Failed to fetch trips')
      const data = await response.json()
      setTrips(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.preventDefault() // Prevent navigation if button is inside Link
    if (!window.confirm('Are you sure you want to delete this trip?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete trip')
      
      // Update local state
      setTrips(trips.filter(trip => trip._id !== id))
    } catch (err) {
      alert('Error deleting trip: ' + err.message)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">My Saved Trips</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Error: {error}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg mb-4">No trips saved yet.</p>
            <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link to={`/trip/${trip._id}`} key={trip._id} className="block group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all h-full border border-gray-100 flex flex-col">
                  {/* Card Header with Destination Image Placeholder or Gradient */}
                  <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">
                      {trip.destination}
                    </h3>
                  </div>
                  
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {trip.numberOfDays} Days
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {trip.familyType}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                       From {trip.fromCity} • Budget: ₨. {formatCurrency(trip.budget)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-gray-500">
                        {new Date(trip.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                    <span className="text-blue-600 font-medium text-sm">View Details</span>
                    <button 
                      onClick={(e) => handleDelete(e, trip._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete Trip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyTrips