const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { handlers, loadFoods } = require('./handlers');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint JSON-RPC
app.post('/jsonrpc', (req, res) => {
  console.log('JSON-RPC request received:', req.body);
  const { id, method, params } = req.body;
  let result = null;
  let error = null;

  try {
    if (handlers[method]) {
      result = handlers[method](params || {});
      console.log(`Method ${method} executed. Result:`, result);
    } else {
      error = { code: -32601, message: 'Method not found' };
      console.error(`Method not found: ${method}`);
    }
  } catch (e) {
    error = { code: -32000, message: e.message };
    console.error(`Error executing method ${method}:`, e);
  }

  res.json({ jsonrpc: '2.0', id, result, error });
});

// Inicializar datos y arrancar servidor
loadFoods();
app.listen(PORT, () => {
  console.log(`KitchenMCP server running on port ${PORT}`);
});
