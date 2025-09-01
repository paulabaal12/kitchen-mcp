// Entry point for the backend API
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Example route
data = require('./data/recipes.json'); // Placeholder, will create this file soon

app.get('/', (req, res) => {
  res.send('API is running!');
});

// TODO: Add endpoints for recipes, ingredients, nutrition

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
