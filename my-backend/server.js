const express = require('express');
const app = express();

app.use(express.json());

// Main route
app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});


// Start server
app.listen(parseInt(process.env.PORT) || 8080);