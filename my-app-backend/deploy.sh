#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/LucknowMarblesBackend
sudo chown -R $USER:$USER /var/www/LucknowMarblesBackend

# Copy application files
cp -r * /var/www/LucknowMarblesBackend/

# Install dependencies
cd /var/www/LucknowMarblesBackend
npm install

# Setup environment variables
cat > .env << EOL
JWT_SECRET=1234
MONGODB_URI=mongodb://localhost/your_database
LINKEDIN_YOUR_CLIENT_ID = 77j380nmh3frhn
LINKEDIN_YOUR_CLIENT_SECRET= WPL_AP1.ogbdEGW9aWBB
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
client_secret: b8f5d820fbb5529a8df9c67a36b7bb3be215c98b
OPENAI_API_KEY=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
GOOGLE_CLIENT_ID=807803722588-8ig3updntn51i06knb4qlu1b956bu3ar.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FRONTEND_REDIRECT_URI=http://localhost:3000/admin/calendar/callback
GOOGLE_REDIRECT_URI=http://localhost:5001/api/calendar/auth-callback
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@lucknowmarbles.com
EMAIL_PASS=lmi1991lko
EMAIL_FROM="Lucknow Marbles <info@lucknowmarbles.com>"

# Twilio configuration
TWILIO_ACCOUNT_SID=ACa6183039c2459b313d5387121ae6ea2a
TWILIO_AUTH_TOKEN=e860a24c291c36540c54237e207b57d3
TWILIO_PHONE_NUMBER=+918009720503
TWILIO_MESSAGING_SERVICE_SID=MGa8ca80d8463662230cd84eed4a168905
NODE_ENV=production
PORT=8080
REACT_APP_GOOGLE_MAPS_API_KEY = AIzaSyCsNh45zRUdhDiJTYblG4vw5gAtWlbTf_4
REACT_APP_BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://lucknowmarbles.co.in

SESSION_SECRET=nswiwj2345
NODE_ENV=production
REACT_APP_GOOGLE_CLIENT_ID=807803722588-8ig3updntn51i06knb4qlu1b956bu3ar.apps.googleusercontent.com

EOL

# Start application with PM2
pm2 start Server.js --name calendar-app
pm2 save
pm2 startup 