import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10 opacity-95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 sm:py-6 relative">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <Link to="/" className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 hover:opacity-80 transition-opacity">
             ✈️ AI Trip Planner
          </Link>
          
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Plan Trip
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  My Saved Trips
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
