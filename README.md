***

# Excel Analytics Platform - MERN Stack

A full-stack Excel data analytics and visualization platform built with MongoDB, Express.js, React.js, and Node.js (MERN). 

***

## Key Features

- User & Admin Authentication (JWT-based)
- Upload and parse Excel (.xlsx) files securely
- Dynamic selection of X and Y axes for data analysis
- Interactive 2D charts (Chart.js) and 3D charts (Three.js)
- Download charts as PNG/PDF files
- Dashboard with upload and analysis history
- Optional AI-powered insights integration (OpenAI or similar)
- Modern, responsive UI with React and Tailwind CSS (or CSS modules)
  
***

## Tech Stack

- Frontend: React.js, Redux Toolkit, Chart.js, Three.js, Tailwind CSS
- Backend: Node.js, Express.js, MongoDB, Multer, exceljs (for Excel parsing)
- Others: Postman, Git/GitHub, Cloudinary (optional for file storage)
  
***

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas Account or local MongoDB

***

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in backend root with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name (optional)
   CLOUDINARY_API_KEY=your_cloudinary_api_key (optional)
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret (optional)
   OPENAI_API_KEY=your_openai_api_key (optional)
   ```

4. Start backend server:
   ```bash
   npm run dev
   ```

***

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start frontend development server:
   ```bash
   npm start
   ```

***

### Notes

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:5000` (or your set PORT)
- Make sure to update API URLs in frontend accordingly (e.g., proxy or environment variables)
- For styling, basic CSS or Tailwind CSS can be used. Tailwind setup steps can be added later.

***

## References

- [SheetJS](https://sheetjs.com/)
- [Chart.js](https://www.chartjs.org/)
- [Three.js](https://threejs.org/)
- YouTube: JavaScript Mastery, Codevolution, Fireship

***

