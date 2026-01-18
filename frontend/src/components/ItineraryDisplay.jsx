function ItineraryDisplay({ itineraryData, onReset }) {
  const { itinerary, budgetBreakdown, tips } = itineraryData

  const getIntensityColor = (intensity) => {
    switch (intensity?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Your Travel Itinerary
        </h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Plan Another Trip
        </button>
      </div>

      {/* Day-wise Itinerary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-600">Day {day.day}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getIntensityColor(
                  day.travelIntensity
                )}`}
              >
                {day.travelIntensity || 'N/A'}
              </span>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {day.title || 'Day Activities'}
            </h4>

            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-600 mb-2">Activities:</h5>
              <ul className="space-y-2">
                {day.activities && day.activities.length > 0 ? (
                  day.activities.map((activity, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{activity}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 italic">No activities listed</li>
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estimated Cost:</span>
                <span className="text-lg font-bold text-indigo-600">
                  ₨. {formatCurrency(day.estimatedCost || 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Breakdown */}
      {budgetBreakdown && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Budget Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {budgetBreakdown.totalEstimatedCost && (
              <div className="text-center p-4 bg-teal-50 rounded-lg col-span-2 sm:col-span-1 border-2 border-teal-100">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Total Estimated</p>
                <p className="text-lg font-bold text-teal-700">
                  ₨. {formatCurrency(budgetBreakdown.totalEstimatedCost)}
                </p>
              </div>
            )}
            {budgetBreakdown.stay && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Stay</p>
                <p className="text-lg font-bold text-blue-600">
                  ₨. {formatCurrency(budgetBreakdown.stay)}
                </p>
              </div>
            )}
            {budgetBreakdown.transport && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Transport</p>
                <p className="text-lg font-bold text-green-600">
                  ₨. {formatCurrency(budgetBreakdown.transport)}
                </p>
              </div>
            )}
            {budgetBreakdown.food && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Food</p>
                <p className="text-lg font-bold text-yellow-600">
                  ₨. {formatCurrency(budgetBreakdown.food)}
                </p>
              </div>
            )}
            {budgetBreakdown.activities && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Activities</p>
                <p className="text-lg font-bold text-purple-600">
                  ₨. {formatCurrency(budgetBreakdown.activities)}
                </p>
              </div>
            )}
            {budgetBreakdown.perDayCost && (
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Per Day</p>
                <p className="text-lg font-bold text-indigo-600">
                  ₨. {formatCurrency(budgetBreakdown.perDayCost)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Travel Tips
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start text-gray-700">
                <span className="text-blue-500 mr-2 mt-1">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ItineraryDisplay
