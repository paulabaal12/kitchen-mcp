import os
import pandas as pd

# Carpeta donde están los CSVs
csv_folder = os.path.join(os.path.dirname(__file__), 'CSV')

# Listar todos los archivos CSV
csv_files = [f for f in os.listdir(csv_folder) if f.endswith('.csv')]

ingredientes_dfs = []
recetas_dfs = []

# Lista de columnas clave para ingredientes/nutrientes
ingredientes_cols = [
    'food', 'Caloric Value', 'Fat', 'Saturated Fats', 'Monounsaturated Fats', 'Polyunsaturated Fats',
    'Carbohydrates', 'Sugars', 'Protein', 'Dietary Fiber', 'Cholesterol', 'Sodium', 'Water',
    'Vitamin A', 'Vitamin B1', 'Vitamin B11', 'Vitamin B12', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5',
    'Vitamin B6', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K', 'Calcium', 'Copper', 'Iron',
    'Magnesium', 'Manganese', 'Phosphorus', 'Potassium', 'Selenium', 'Zinc', 'Nutrition Density'
]

recetas_keys = ['receta', 'recipe', 'ingredients', 'nombre', 'name', 'steps', 'pasos']


# Recorre cada archivo y clasifica los datos
for file in csv_files:
    path = os.path.join(csv_folder, file)
    try:
        df = pd.read_csv(path, encoding='utf-8')
    except Exception:
        try:
            df = pd.read_csv(path, encoding='latin1')
        except Exception:
            print(f"No se pudo leer {file}")
            continue

    # Normaliza nombres de columnas
    df.columns = [c.strip() for c in df.columns]

    # Si tiene columnas de ingredientes/nutrientes
    if any(col in df.columns for col in ingredientes_cols):
        # Solo dejar las columnas relevantes si existen
        cols_presentes = [col for col in ingredientes_cols if col in df.columns]
        ingredientes_dfs.append(df[cols_presentes])

    # Si tiene columnas de recetas
    if any(any(key in c.lower() for key in recetas_keys) for c in df.columns):
        recetas_dfs.append(df)

# Unir y limpiar ingredientes
if ingredientes_dfs:
    ingredientes = pd.concat(ingredientes_dfs, ignore_index=True)
    ingredientes = ingredientes.drop_duplicates()
    ingredientes.to_csv(os.path.join(csv_folder, 'ingredientes_unificados.csv'), index=False)
    print("Archivo ingredientes_unificados.csv creado.")
else:
    print("No se encontraron datos de ingredientes.")

# Unir y limpiar recetas
if recetas_dfs:
    recetas = pd.concat(recetas_dfs, ignore_index=True)
    recetas = recetas.drop_duplicates()
    recetas.to_csv(os.path.join(csv_folder, 'recetas_unificadas.csv'), index=False)
    print("Archivo recetas_unificadas.csv creado.")
else:
    print("No se encontraron datos de recetas.")

ingredientes_dfs = []
recetas_dfs = []

for file in csv_files:
    path = os.path.join(csv_folder, file)
    try:
        df = pd.read_csv(path, encoding='utf-8')
    except Exception:
        try:
            df = pd.read_csv(path, encoding='latin1')
        except Exception:
            print(f"No se pudo leer {file}")
            continue

    # Normalizar nombres de columnas
    df.columns = [c.strip() for c in df.columns]

    # Si tiene columnas de ingredientes/nutrientes
    if any(col in df.columns for col in ingredientes_cols):
        # Solo dejar las columnas relevantes si existen
        cols_presentes = [col for col in ingredientes_cols if col in df.columns]
        ingredientes_dfs.append(df[cols_presentes])

    # Si tiene columnas de recetas
    if any(any(key in c.lower() for key in recetas_keys) for c in df.columns):
        recetas_dfs.append(df)

    # Unir y limpiar ingredientes
    if ingredientes_dfs:
        ingredientes = pd.concat(ingredientes_dfs, ignore_index=True)
        ingredientes = ingredientes.drop_duplicates()
        ingredientes.to_csv(os.path.join(csv_folder, 'ingredientes_unificados.csv'), index=False)
        print("Archivo ingredientes_unificados.csv creado.")
    else:
        print("No se encontraron datos de ingredientes.")

    # Unir y limpiar recetas
    if recetas_dfs:
        recetas = pd.concat(recetas_dfs, ignore_index=True)
        recetas = recetas.drop_duplicates()
        recetas.to_csv(os.path.join(csv_folder, 'recetas_unificadas.csv'), index=False)
        print("Archivo recetas_unificadas.csv creado.")
    else:
        print("No se encontraron datos de recetas.")