import { useState } from 'react'
import ItineraryCard from './ItineraryCard.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'
import ErrorDisplay from './ErrorDisplay.jsx'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function TripPlannerForm() {
  const [formData, setFormData] = useState({
    fromCity: '',
    destination: '',
    numberOfDays: '',
    budget: '',
    familyType: ''
  })

  const [errors, setErrors] = useState({
    fromCity: '',
    destination: '',
    numberOfDays: '',
    budget: '',
    familyType: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [itineraryData, setItineraryData] = useState(null)

  // Regex patterns for validation
  const cityPattern = /^[A-Za-z\s]{2,50}$/ // City name: 2-50 letters and spaces
  const daysPattern = /^[1-9]\d*$/ // Positive integer starting from 1
  const budgetPattern = /^[1-9]\d*(\.\d{1,2})?$/ // Positive number with optional 2 decimal places

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'fromCity':
        if (!value.trim()) {
          error = 'From city is required'
        } else if (!cityPattern.test(value.trim())) {
          error = 'From city must be 2-50 letters and spaces only'
        }
        break

      case 'destination':
        if (!value.trim()) {
          error = 'Destination is required'
        } else if (!cityPattern.test(value.trim())) {
          error = 'Destination must be 2-50 letters and spaces only'
        }
        break

      case 'numberOfDays':
        if (!value.trim()) {
          error = 'Number of days is required'
        } else if (!daysPattern.test(value.trim())) {
          error = 'Number of days must be a positive integer (minimum 1)'
        }
        break

      case 'budget':
        if (!value.trim()) {
          error = 'Budget is required'
        } else if (!budgetPattern.test(value.trim())) {
          error = 'Budget must be a positive number (e.g., 1000 or 1000.50)'
        }
        break

      case 'familyType':
        if (!value) {
          error = 'Family type is required'
        }
        break

      default:
        break
    }

    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {}
    let hasErrors = false

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) {
        newErrors[key] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (!hasErrors) {
      setLoading(true)
      setError(null)
      setItineraryData(null)

      try {
        // Create AbortController for timeout handling
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(`${API_BASE_URL}/api/plan-trip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromCity: formData.fromCity.trim(),
            destination: formData.destination.trim(),
            numberOfDays: formData.numberOfDays,
            budget: formData.budget,
            familyType: formData.familyType
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success && data.data) {
          setItineraryData(data.data)
          // Scroll to results
          setTimeout(() => {
            document.getElementById('itinerary-results')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }, 100)
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timeout: The server took too long to respond. Please try again.')
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Network error: Unable to connect to the server. Please check your connection and ensure the backend is running.')
        } else {
          setError(err.message || 'An unexpected error occurred. Please try again.')
        }
        console.error('Error submitting form:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRetry = () => {
    setError(null)
    // Create a synthetic event object for handleSubmit
    const syntheticEvent = {
      preventDefault: () => {}
    }
    handleSubmit(syntheticEvent)
  }

  const handleReset = () => {
    setFormData({
      fromCity: '',
      destination: '',
      numberOfDays: '',
      budget: '',
      familyType: ''
    })
    setErrors({
      fromCity: '',
      destination: '',
      numberOfDays: '',
      budget: '',
      familyType: ''
    })
    setError(null)
    setItineraryData(null)
  }

  const familyTypeOptions = [
    { value: 'solo', label: 'Solo' },
    { value: 'couple', label: 'Couple' },
    { value: 'family-kids', label: 'Family with kids' },
    { value: 'family-elder', label: 'Family with elder' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Form Section */}
      {!itineraryData && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Plan Your Trip
          </h2>

        {/* From City */}
        <div>
          <label htmlFor="fromCity" className="block text-sm font-medium text-gray-700 mb-2">
            From City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fromCity"
            name="fromCity"
            value={formData.fromCity}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your departure city"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.fromCity
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.fromCity && (
            <p className="mt-1 text-sm text-red-500">{errors.fromCity}</p>
          )}
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your destination city"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.destination
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-500">{errors.destination}</p>
          )}
        </div>

        {/* Number of Days */}
        <div>
          <label htmlFor="numberOfDays" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Days <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="numberOfDays"
            name="numberOfDays"
            value={formData.numberOfDays}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., 5"
            min="1"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.numberOfDays
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.numberOfDays && (
            <p className="mt-1 text-sm text-red-500">{errors.numberOfDays}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Budget <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₨. </span>
            <input
              type="text"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 5000"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.budget
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.budget && (
            <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
          )}
        </div>

        {/* Family Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Family Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {familyTypeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.familyType === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                } ${errors.familyType ? 'border-red-500' : ''}`}
              >
                <input
                  type="radio"
                  name="familyType"
                  value={option.value}
                  checked={formData.familyType === option.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.familyType && (
            <p className="mt-1 text-sm text-red-500">{errors.familyType}</p>
          )}
        </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transform transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl'
            }`}
          >
            {loading ? 'Planning Your Trip...' : 'Plan My Trip'}
          </button>
        </form>
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error Display */}
      {error && !loading && (
        <div className="mb-8">
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      )}

      {/* Itinerary Results */}
      {itineraryData && !loading && (
        <div id="itinerary-results" className="mt-8">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-xl p-6 sm:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Your Trip Itinerary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-blue-100 text-sm font-medium">From</p>
                <p className="text-xl font-bold">{itineraryData.fromCity}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">To</p>
                <p className="text-xl font-bold">{itineraryData.destination}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Budget</p>
                <p className="text-xl font-bold">₨. {itineraryData.budget.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-blue-400">
              <div className="flex items-center justify-between">
                <span className="text-blue-100 text-lg font-medium">Total Estimated Cost:</span>
                <span className="text-3xl font-bold">
                  ₨. {itineraryData.totalEstimatedCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          {itineraryData.budgetBreakdown && (
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Budget Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {itineraryData.budgetBreakdown.stay && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Accommodation</p>
                    <p className="text-lg font-bold text-blue-600">₨. {itineraryData.budgetBreakdown.stay.toLocaleString()}</p>
                  </div>
                )}
                {itineraryData.budgetBreakdown.transport && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Transport</p>
                    <p className="text-lg font-bold text-green-600">₨. {itineraryData.budgetBreakdown.transport.toLocaleString()}</p>
                  </div>
                )}
                {itineraryData.budgetBreakdown.food && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Food</p>
                    <p className="text-lg font-bold text-yellow-600">₨. {itineraryData.budgetBreakdown.food.toLocaleString()}</p>
                  </div>
                )}
                {itineraryData.budgetBreakdown.activities && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Activities</p>
                    <p className="text-lg font-bold text-purple-600">₨. {itineraryData.budgetBreakdown.activities.toLocaleString()}</p>
                  </div>
                )}
                {itineraryData.budgetBreakdown.perDayCost && (
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Per Day Avg</p>
                    <p className="text-lg font-bold text-indigo-600">₨. {itineraryData.budgetBreakdown.perDayCost.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itinerary Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Day-wise Itinerary</h3>
            {itineraryData.itinerary.map((dayPlan) => (
              <ItineraryCard
                key={dayPlan.day}
                day={dayPlan.day}
                title={dayPlan.title}
                activities={dayPlan.activities}
                travelIntensity={dayPlan.travelIntensity}
                estimatedCost={dayPlan.estimatedCost}
              />
            ))}
          </div>

          {/* Tips Section */}
          {itineraryData.tips && itineraryData.tips.length > 0 && (
            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Travel Tips
              </h3>
              <ul className="space-y-2">
                {itineraryData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="mr-2 text-yellow-600 mt-1">•</span>
                    <span className="text-base sm:text-lg">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Plan Another Trip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripPlannerForm
