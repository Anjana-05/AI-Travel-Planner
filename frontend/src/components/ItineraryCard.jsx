function ItineraryCard({ day, title, activities, travelIntensity, estimatedCost }) {
  const intensityColors = {
    Low: 'bg-green-100 text-green-800 border-green-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    High: 'bg-red-100 text-red-800 border-red-300'
  }

  const intensityIcon = {
    Low: '🟢',
    Medium: '🟡',
    High: '🔴'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Day {day}
          </h3>
          {title && title !== `Day ${day}` && (
            <p className="text-sm sm:text-base text-gray-600 mt-1">{title}</p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${intensityColors[travelIntensity]}`}>
          <span className="mr-1">{intensityIcon[travelIntensity]}</span>
          {travelIntensity} Intensity
        </div>
      </div>

      {/* Activities */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📋</span>
          Activities
        </h4>
        <ul className="space-y-2">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start text-gray-600">
              <span className="mr-2 text-blue-500 mt-1">✓</span>
              <span className="text-base sm:text-lg">{activity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Estimated Cost */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Estimated Cost:</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-600">
            ₨. {estimatedCost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ItineraryCard
