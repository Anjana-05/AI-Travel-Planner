import { useState } from 'react'

function TripPlannerForm({ onSubmit, isLoading, error }) {
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

  const handleSubmit = (e) => {
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
      // Form is valid, call the onSubmit callback
      onSubmit(formData)
    }
  }

  const familyTypeOptions = [
    { value: 'solo', label: 'Solo' },
    { value: 'couple', label: 'Couple' },
    { value: 'family-kids', label: 'Family with kids' },
    { value: 'family-elder', label: 'Family with elder' }
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-6">
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
          <label htmlFor="familyType" className="block text-sm font-medium text-gray-700 mb-2">
            Family Type <span className="text-red-500">*</span>
          </label>
          <select
            id="familyType"
            name="familyType"
            value={formData.familyType}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
              errors.familyType
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          >
            <option value="" disabled>Select Option</option>
            {familyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.familyType && (
            <p className="mt-1 text-sm text-red-500">{errors.familyType}</p>
          )}
        </div>

        {/* Status Message */}
        {error && (
          <div className="text-center py-3 px-4 rounded-lg bg-gray-50 border border-gray-100">
             <p className="text-gray-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        {isLoading ? (
          <div className="w-full py-4 px-6 rounded-lg bg-blue-50 border border-blue-200 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h3 className="text-lg font-bold text-blue-800">We are planning your trip...</h3>
              <p className="text-blue-600">This may take a few seconds.</p>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 hover:shadow-xl"
          >
            Plan My Trip
          </button>
        )}
      </form>
    </div>
  )
}

export default TripPlannerForm
