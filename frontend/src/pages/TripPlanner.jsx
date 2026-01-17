import Header from '../components/Header.jsx'
import TripPlannerForm from '../components/TripPlannerForm.jsx'

function TripPlanner() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 sm:py-12">
        <TripPlannerForm />
      </main>
    </div>
  )
}

export default TripPlanner
