#!/bin/bash
# Simple check to see if the app is running
if pgrep -f node > /dev/null
then
  echo "Application is running"
else
  echo "Application is NOT running"
  exit 1
fi
