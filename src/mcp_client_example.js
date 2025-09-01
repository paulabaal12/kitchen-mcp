// Cliente MCP simple para consumir el servidor MCP local vía JSON-RPC
const axios = require('axios');

const MCP_URL = 'http://localhost:4000/jsonrpc';

async function callMCP(method, params = {}, id = 1) {
  const payload = {
    jsonrpc: '2.0',
    id,
    method,
    params
  };
  const res = await axios.post(MCP_URL, payload);
  return res.data;
}

async function main() {
  console.log('Ejemplo: getFoods');
  let response = await callMCP('getFoods');
  console.log(response.result.slice(0, 2)); // Solo muestra los primeros 2 alimentos

  console.log('\nEjemplo: getFoodByName ("almond butter")');
  response = await callMCP('getFoodByName', { name: 'almond butter' });
  console.log(response.result);

  console.log('\nEjemplo: searchFoods (minProtein=5, maxFat=10)');
  response = await callMCP('searchFoods', { minProtein: 5, maxFat: 10 });
  console.log(response.result.slice(0, 2));

  console.log('\nEjemplo: getIngredients');
  response = await callMCP('getIngredients');
  console.log(response.result.slice(0, 5));

  console.log('\nEjemplo: getRecipeSuggestions');
  response = await callMCP('getRecipeSuggestions');
  console.log(response.result);
}

main().catch(console.error);
