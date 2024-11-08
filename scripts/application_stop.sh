#!/bin/bash
# Navigate to the backend and frontend directories to start both services

# Start backend
cd /home/ec2-user/afriqana/backend
nohup npm run server & # Starts only the backend

# Start frontend
cd /home/ec2-user/afriqana/frontend
nohup npm run client & # Starts the frontend
