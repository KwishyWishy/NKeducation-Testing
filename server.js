const express = require('express');
const path = require('path');
const kmathRoutes = require('./public/kmath/kmathRoutes');
const math1Routes = require('./public/math1/math1Routes');
const math2Routes = require('./public/math2/math2Routes');
const math3Routes = require('./public/math3/math3Routes');
const math4Routes = require('./public/math4/math4Routes');
const math5Routes = require('./public/math5/math5Routes');
const math6Routes = require('./public/math6/math6Routes');

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

// Use the routes with their respective base paths
app.use('/kmath', kmathRoutes); // For kindergarten math
app.use('/math1', math1Routes);
app.use('/math2', math2Routes);
app.use('/math3', math3Routes);
app.use('/math4', math4Routes);
app.use('/math5', math5Routes);
app.use('/math6', math6Routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});