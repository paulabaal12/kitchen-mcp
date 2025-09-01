// Chatbot en consola que consulta la API local de alimentos
const readline = require('readline');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
// OpenAI eliminado, solo Anthropic (Claude)
const { Anthropic } = require('anthropic');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const LOG_FILE = path.join(__dirname, 'chatbot_log.json');

function logInteraction(question, answer) {
  let log = [];
  if (fs.existsSync(LOG_FILE)) {
    log = JSON.parse(fs.readFileSync(LOG_FILE));
  }
  log.push({ timestamp: new Date().toISOString(), question, answer });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = 'http://localhost:3001';

function showMenu() {
  console.log('\n=== Food & Nutrition Chatbot ===');
  console.log('1. Buscar alimento por nombre');
  console.log('2. Buscar alimentos por proteína/grasa/calorías');
  console.log('3. Ver sugerencias de recetas');
  console.log('4. Listar ingredientes únicos');
  console.log('5. Ver log de interacciones');
  console.log('6. Preguntar a Claude (Anthropic)');
  console.log('7. Salir');
}

let llmContext = [
  { role: 'system', content: 'Eres un asistente experto en nutrición y recetas. Responde de forma clara y breve.' }
];

async function handleOption(option) {
  switch(option) {
    case '1':
      rl.question('Nombre del alimento: ', async (name) => {
        try {
          const res = await axios.get(`${API_URL}/foods/${encodeURIComponent(name)}`);
          console.log(res.data);
          logInteraction(`Buscar alimento: ${name}`, res.data);
        } catch (err) {
          console.log('No se encontró el alimento.');
          logInteraction(`Buscar alimento: ${name}`, 'No se encontró el alimento.');
        }
        promptUser();
      });
      break;
    case '2':
      rl.question('Mínimo de proteína: ', (minProtein) => {
        rl.question('Máximo de grasa: ', (maxFat) => {
          rl.question('Máximo de calorías: ', async (maxCalories) => {
            try {
              const res = await axios.get(`${API_URL}/foods/search`, {
                params: { minProtein, maxFat, maxCalories }
              });
              console.log(res.data);
              logInteraction(`Buscar alimentos: minProtein=${minProtein}, maxFat=${maxFat}, maxCalories=${maxCalories}`, res.data);
            } catch (err) {
              console.log('Error en la búsqueda.');
              logInteraction(`Buscar alimentos: minProtein=${minProtein}, maxFat=${maxFat}, maxCalories=${maxCalories}`, 'Error en la búsqueda.');
            }
            promptUser();
          });
        });
      });
      break;
    case '3':
      try {
        const res = await axios.get(`${API_URL}/recipes/suggestions`);
        console.log('Sugerencias de recetas (top proteína, baja grasa):');
        console.log(res.data);
        logInteraction('Sugerencias de recetas', res.data);
      } catch (err) {
        console.log('Error obteniendo sugerencias.');
        logInteraction('Sugerencias de recetas', 'Error obteniendo sugerencias.');
      }
      promptUser();
      break;
    case '4':
      try {
        const res = await axios.get(`${API_URL}/ingredients`);
        console.log('Ingredientes únicos:');
        console.log(res.data);
        logInteraction('Listar ingredientes únicos', res.data);
      } catch (err) {
        console.log('Error obteniendo ingredientes.');
        logInteraction('Listar ingredientes únicos', 'Error obteniendo ingredientes.');
      }
      promptUser();
      break;
    case '5':
      if (fs.existsSync(LOG_FILE)) {
        const log = JSON.parse(fs.readFileSync(LOG_FILE));
        console.log('=== Log de interacciones ===');
        log.forEach((entry, i) => {
          console.log(`\n[${i+1}] ${entry.timestamp}`);
          console.log('Pregunta:', entry.question);
          console.log('Respuesta:', entry.answer);
        });
      } else {
        console.log('No hay interacciones registradas.');
      }
      promptUser();
      break;
    case '6':
      rl.question('Pregunta para Claude: ', async (question) => {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 200,
            messages: [
              { role: 'user', content: question }
            ]
          });
          const answer = response.content[0].text;
          console.log('Claude:', answer);
          logInteraction(`Claude: ${question}`, answer);
        } catch (err) {
          console.log('Error consultando a Claude:', err.message || err);
        }
        promptUser();
      });
      break;
    case '7':
      console.log('¡Hasta luego!');
      rl.close();
      break;
    default:
      console.log('Opción no válida.');
      promptUser();
  }
}

function promptUser() {
  showMenu();
  rl.question('Elige una opción: ', handleOption);
}

promptUser();
