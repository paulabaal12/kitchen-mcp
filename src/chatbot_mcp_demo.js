// Demo Node.js puro: crear carpeta, inicializar git, crear README, git add y commit
import readline from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const BASE_DIR = process.cwd();

function pregunta(q) {
  return new Promise(res => rl.question(q, res));
}

async function main() {
  try {
  console.log("\n==============================");
  console.log(" DEMO: Crear proyecto, README y commit automático");
  console.log("==============================\n");
  console.log("Este script creará una carpeta, inicializará git, creará un README y hará commit, todo automáticamente.\n");
  console.log("Paso 1: Escribe el nombre del proyecto y presiona Enter.");
  const projectName = await pregunta("Nombre del proyecto: ");
  console.log("\nPaso 2: Escribe el mensaje para el commit inicial y presiona Enter.");
  const commitMsg = await pregunta("Mensaje para el commit inicial: ");
  const projectPath = path.join(BASE_DIR, projectName);

    // 1. Crear carpeta
    console.log("\n--- PASO 1: Crear carpeta del proyecto ---");
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath);
      console.log(`✅ Carpeta '${projectName}' creada.`);
    } else {
      console.log(`⚠️  La carpeta '${projectName}' ya existe.`);
    }

    // 2. Inicializar git
    console.log("\n--- PASO 2: Inicializar repositorio Git ---");
    execSync("git init", { cwd: projectPath });
    console.log("✅ Repositorio Git inicializado.");

    // 3. Crear README.md
    console.log("\n--- PASO 3: Crear archivo README.md ---");
    const readmeContent = `# ${projectName}\nEste es mi primer proyecto con MCP`;
    fs.writeFileSync(path.join(projectPath, "README.md"), readmeContent);
    console.log("✅ Archivo README.md creado.");

    // 4. git add README.md
    console.log("\n--- PASO 4: git add README.md ---");
    execSync("git add README.md", { cwd: projectPath });
    console.log("✅ Archivo añadido al área de staging.");

    // 5. git commit
    console.log("\n--- PASO 5: git commit ---");
    execSync(`git commit -m "${commitMsg}"`, { cwd: projectPath });
    console.log(`✅ Commit realizado con el mensaje: "${commitMsg}"`);
  } catch (err) {
    console.error("\n❌ Error:", err.message || err);
  }
  console.log("\n--- DEMO FINALIZADO ---\n");
  rl.close();
  process.exit(0);
}

main();
