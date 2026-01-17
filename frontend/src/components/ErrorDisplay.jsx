function ErrorDisplay({ error, onRetry }) {
  const getErrorMessage = (error) => {
    if (error.includes('timeout') || error.includes('Network')) {
      return {
        title: 'Connection Timeout',
        message: 'The request took too long. Please check your internet connection and try again.',
        icon: '⏱️'
      }
    }
    if (error.includes('AI') || error.includes('503')) {
      return {
        title: 'AI Service Unavailable',
        message: 'The AI service is temporarily unavailable. Please try again in a few moments.',
        icon: '🤖'
      }
    }
    if (error.includes('400') || error.includes('validation')) {
      return {
        title: 'Invalid Request',
        message: 'Please check your form inputs and try again.',
        icon: '⚠️'
      }
    }
    return {
      title: 'Something Went Wrong',
      message: error || 'An unexpected error occurred. Please try again.',
      icon: '❌'
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 sm:p-8 text-center">
      <div className="text-5xl mb-4">{errorInfo.icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-2">
        {errorInfo.title}
      </h3>
      <p className="text-gray-700 mb-6">{errorInfo.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorDisplay
