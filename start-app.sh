#!/bin/bash

# Kill any existing Node.js processes
echo "Terminating any existing Node.js processes..."
pkill -f "node" || echo "No Node.js processes found to terminate"

# Wait a moment for processes to fully terminate
sleep 1

# Start backend server
echo "Starting backend server on port 5005..."
cd backend && PORT=5005 npm start &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 3

# Start frontend server
echo "Starting frontend server on port 3000..."
cd ../frontend && PORT=3000 npm start &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
  echo "Terminating servers..."
  kill $BACKEND_PID $FRONTEND_PID
  exit
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Keep script running
echo "Both servers are now running!"
echo "Backend API: http://localhost:5005/api"
echo "Frontend app: http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for user to terminate
wait
