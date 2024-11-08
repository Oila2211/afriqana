#!/bin/bash
cd /home/ec2-user/afriqana/backend
npm run server & # starts backend

cd ../frontend
npm run client & # starts frontend

