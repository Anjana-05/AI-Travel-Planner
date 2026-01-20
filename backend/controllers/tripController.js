import { Trip } from '../models/Trip.js';

// Save a trip
export const createTrip = async (req, res) => {
  try {
    const tripData = req.body;
    const newTrip = new Trip(tripData);
    await newTrip.save();
    res.status(201).json({ message: 'Trip saved successfully', trip: newTrip });
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ error: 'Failed to save trip', message: error.message });
  }
};

// Get all trips
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find().sort({ generatedAt: -1 }); 
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips', message: error.message });
  }
};

// Get a specific trip
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip', message: error.message });
  }
};

// Delete a trip
export const deleteTrip = async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
    if (!deletedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip', message: error.message });
  }
};
