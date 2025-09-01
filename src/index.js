// Entry point for the backend API
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


// Cargar datos combinados desde el JSON generado por process_all_csvs.js
const data = require('./data/combined_data.json');

app.get('/', (req, res) => {
  res.send('API is running!');
});

// TODO: Add endpoints for recipes, ingredients, nutrition

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
