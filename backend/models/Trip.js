import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  time: String,
  title: String,
  description: String,
  cost: Number,
  location: String
});

const dayItinerarySchema = new mongoose.Schema({
  day: Number,
  title: String,
  activities: [String], // Storing as simple strings based on current structure
  travelIntensity: String,
  estimatedCost: Number
});

const budgetBreakdownSchema = new mongoose.Schema({
  stay: Number,
  transport: Number,
  food: Number,
  activities: Number,
  totalEstimatedCost: Number,
  perDayCost: Number
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false, // For now, we can allow guests or use a default ID
    default: 'guest'
  },
  destination: {
    type: String,
    required: true
  },
  fromCity: String,
  numberOfDays: Number,
  budget: Number,
  familyType: String,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  itinerary: [dayItinerarySchema],
  budgetBreakdown: budgetBreakdownSchema,
  tips: [String]
});

export const Trip = mongoose.model('Trip', tripSchema);
