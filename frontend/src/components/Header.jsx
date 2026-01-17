function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            ✈️ AI Trip Planner
          </h1>
        </div>
        <p className="text-center mt-2 text-sm sm:text-base text-gray-600">
          Plan your perfect journey with AI-powered recommendations
        </p>
      </div>
    </header>
  )
}

export default Header
