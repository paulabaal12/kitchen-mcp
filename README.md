
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
