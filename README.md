# Integrated RazorKart E-commerce Platform

This project combines multiple components of the RazorKart e-commerce platform into a single integrated application with a clear separation between frontend and backend.

## Features

- User Authentication (Login/Signup)
- Admin Dashboard
- User Role Management
- Seller Dashboard
- Product CRUD Operations
- Media Management
- Shopping Cart Functionality
- And more...

## Project Structure

```
Integrated-RazorKart/
├── backend/           # Express.js backend
│   ├── config/        # Database and other configurations
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # Express routes
│   ├── utils/         # Utility functions
│   ├── .env           # Environment variables
│   ├── package.json   # Backend dependencies
│   └── server.js      # Server entry point
│
├── frontend/          # React.js frontend
│   ├── public/        # Public assets
│   ├── src/           # Source code
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Utility functions
│   │   └── ...
│   ├── package.json   # Frontend dependencies
│   └── ...
│
├── package.json       # Root package.json for running both services
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install all dependencies:

```bash
cd Integrated-RazorKart
npm run install-all
```

### Configuration

1. Backend configuration (.env file in backend directory):
   - MongoDB connection string
   - JWT secret
   - Port settings

2. Frontend configuration (.env file in frontend directory):
   - API URL

### Running the Application

To run both the frontend and backend concurrently:

```bash
npm start
```

To run the backend server only:

```bash
npm run server
```

To run the frontend only:

```bash
npm run client
```

To run in development mode with hot-reloading:

```bash
npm run dev
```

## Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Admin Dashboard: http://localhost:3000/admin
- Seller Dashboard: http://localhost:3000/seller/dashboard

## Authentication

- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup

## User Roles

- Admin: Full system access
- Seller: Product management and sales dashboard
- Buyer: Shopping and cart functionality
- Content Manager: Product content management
- Inquiry Manager: Handle user inquiries

## Database

The application uses MongoDB. The connection string can be configured in the backend/.env file.
