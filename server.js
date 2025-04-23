const express = require('express');
const path = require('path');
const kmathRoutes = require('./public/kmath/kmathRoutes'); // Import kmath routes

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

// Use the routes with their respective base paths
app.use('/kmath', kmathRoutes); // For kindergarten math

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});