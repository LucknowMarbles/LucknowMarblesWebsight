require('dotenv').config();

module.exports = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/auth/google/callback',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:8080',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
}; 