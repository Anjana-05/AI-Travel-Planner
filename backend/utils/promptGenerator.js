export const generatePrompt = (fromCity, destination, days, budget, familyType) => {
  return `The user is planning for a trip and needs a budget-friendly itinerary that fits for their family type. You are a professional travel planner AI experienced in planning trips. Generate a ${familyType} trip day-wise travel itinerary from ${fromCity} to ${destination} for ${days} within a total budget of ${budget}. 


Rules:
- Activities must suit for the given ${familyType}.
- Breakdown the activities for each day in a given total number of days.
- Travel intensity must be Low, Medium or High.
- The total estimated cost must not exceed the given budget.

{
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival, Rest, and Easy Exploration",
      "activities": [
        "Arrive at destination and check in to the hotel",
        "Relax and freshen up after travel",
        "Visit a nearby park or open area",
        "Short evening walk and dinner nearby"
      ],
      "travelIntensity": "Low",
      "estimatedCost": 3000
    }
  ],
  "budgetBreakdown": {
    "stay": 8000,
    "transport": 6000,
    "food": 5000,
    "activities": 4000,
    "totalEstimatedCost": 23000
  },
}


Return ONLY valid JSON in the exact same structure as shown above.
Do not include any explanations or extra text.`;
};
