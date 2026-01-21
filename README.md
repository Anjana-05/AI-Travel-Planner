# AI Travel Planner 🌍✈️

A smart travel itinerary generator powered by **Google Gemini AI**. This application helps users plan their trips by generating detailed day-by-day itineraries, budget breakdowns, and travel tips based on their preferences.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **AI-Powered Itineraries**: Generates comprehensive travel plans using Google's Gemini-2.5-flash model.
- **Customizable Inputs**: Tailor trips based on:
  - Origin & Destination
  - Duration (Number of Days)
  - Budget
  - Family/group type (Solo, Couple, Family with kids, Family with elders)
- **Budget Breakdown**: Detailed cost estimates for stay, transport, food, and activities.
- **Trip Management**: Save your favorite itineraries to view later (Database integrated).
- **Responsive Design**: Modern and clean UI built with Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Generative AI SDK (@google/generative-ai)

## 📂 Project Structure

```bash
📦 Travel_Planner
 ┣ 📂 backend                 # Express server & API
 ┃ ┣ 📂 config                # Database connection
 ┃ ┣ 📂 controllers           # Route controllers (Trip & Itinerary logic)
 ┃ ┣ 📂 models                # Mongoose models (Trip schema)
 ┃ ┣ 📂 routes                # API routes
 ┃ ┣ 📂 utils                 # Helper functions (Prompt generation)
 ┃ ┗ 📜 server.js             # Entry point
 ┣ 📂 frontend                # React client
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components          # Reusable UI components
 ┃ ┃ ┣ 📂 pages               # Page views (Planner, MyTrips, Details)
 ┃ ┃ ┗ 📜 App.jsx             # Main application component
 ┗ 📜 README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/travel-planner.git
cd travel-planner
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Start the server:
```bash
npm start
# or for development
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional if relying on defaults):
```env
VITE_API_URL=http://localhost:3000
```

Start the React app:
```bash
npm run dev
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/generate-itinerary` | Generate a new trip plan using AI |
| **GET** | `/api/trips` | Fetch all saved trips |
| **POST** | `/api/trips` | Save a new trip |
| **GET** | `/api/trips/:id` | Get details of a specific trip |
| **DELETE** | `/api/trips/:id` | Delete a saved trip |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
