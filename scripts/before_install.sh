#!/bin/bash
# Ensure scripts are executable if the scripts directory exists
if [ -d "scripts" ]; then
  chmod +x scripts/*.sh
else
  echo "Scripts directory not found. Skipping chmod step."
fi
