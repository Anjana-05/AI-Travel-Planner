function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700">
        Generating your perfect itinerary...
      </p>
      <p className="mt-2 text-sm text-gray-500">
        This may take a few moments
      </p>
    </div>
  )
}

export default LoadingSpinner
