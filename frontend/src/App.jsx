import { Routes, Route } from 'react-router-dom'
import TripPlanner from './pages/TripPlanner.jsx'
import MyTrips from './pages/MyTrips.jsx'
import TripDetails from './pages/TripDetails.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900">
      <Routes>
        <Route path="/" element={<TripPlanner />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/trip/:id" element={<TripDetails />} />
      </Routes>
    </div>
  )
}

export default App
