# PROY1-REDES

## Project Overview

Food & Nutrition Chatbot with MCP integration. This project implements a console chatbot that connects to a local API and MCP server to provide food, nutrition, ingredient information, and recipe suggestions. It also integrates with Anthropic Claude for general questions.

### Features
- Query foods and nutrition data from local CSVs (combined to JSON)
- Suggest recipes based on protein/fat
- List unique ingredients
- Log all interactions
- Connect to Anthropic Claude (LLM)
- MCP server (JSON-RPC) for food/nutrition queries

---

## Folder Structure

```
PROY1-REDES/
│
├── src/
│   ├── index.js                # API backend principal
│   ├── foods_api.js            # Endpoints de alimentos, ingredientes, recetas
│   ├── process_all_csvs.js     # Script para combinar CSVs en JSON
│   ├── chatbot.mjs             # Chatbot en consola con Anthropic/Claude
│   ├── mcp_server.js           # Servidor MCP local (JSON-RPC)
│
├── data/
│   └── CSV/                    # CSVs originales (no rastreados por Git)
│
├── .gitignore                  # Ignorar archivos grandes, logs, JSON generados
├── package.json                # Configuración de dependencias Node.js
├── requirements.txt            # (si usas Python para algún script)
├── README.md                   # Documentación principal
```

---

## Usage Flow & Main Commands

### 1. Combine CSVs to JSON
```powershell
node src/process_all_csvs.js
```
Generates a combined JSON from all CSVs in `data/CSV/`. (Not tracked by Git)

### 2. Start the API Backend
```powershell
node src/index.js
```
Runs the Express API on port 3001.

### 3. Start the MCP Server
```powershell
node src/mcp_server.js
```
Runs the MCP server (JSON-RPC) on port 4000.

### 4. Run the Console Chatbot
```powershell
node src/chatbot.mjs
```
Interact with the chatbot, query foods, ingredients, recipes, and ask Claude.

---

## Deploying the MCP Server Remotely (Google Cloud Run)

You can deploy your MCP server to the cloud for remote access (required for the project).

### 1. Prepare the files
- Ensure you have `mcp_server.js`, `package.json`, `Dockerfile`, and your `data/ingredientes_unificados.json` and `data/recetas_unificadas.json` in the same folder.

### 2. Deploy to Google Cloud Run
- Follow the official [Cloud Run quickstart](https://cloud.google.com/run/docs/quickstarts/build-and-deploy) or use the [Anthropic MCP Cloud Run tutorial](https://cloud.google.com/blog/topics/developers-practitioners/build-and-deploy-a-remote-mcp-server-to-google-cloud-run-in-under-10-minutes).
- The Dockerfile is already provided for you.
- The default port for Cloud Run is 8080 (already set in your code).

### 3. Example: Test your remote MCP server
After deployment, your endpoint will look like:
```
POST https://<your-cloud-run-url>/jsonrpc
Body: { "jsonrpc": "2.0", "method": "getIngredients", "params": {}, "id": 1 }
```

### 4. Integrate remote MCP in your chatbot
- In your chatbot, add an option to query the remote MCP server by changing the URL to your Cloud Run endpoint.
- Example scenario: Ask for the current time, a greeting, or any food/recipe info from the remote server.

---
