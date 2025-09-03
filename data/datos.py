import os
import pandas as pd

# Carpeta donde están los CSVs
data_dir = os.path.dirname(__file__)
csv_folder = os.path.join(data_dir, 'CSV')
csv_files = [f for f in os.listdir(csv_folder) if f.endswith('.csv')]

# Mapeo de columnas para ingredientes/nutrientes
ingredientes_map = {
    'food': ['food', 'Food', 'name', 'Name', 'Title', 'Descrip', 'drink', 'FoodItem'],
    'energy_kcal': ['energy_kcal', 'Energy_kcal', 'Energy (kcal)', 'Cals_per100grams', 'Calories', 'calories', 'Caloric Value'],
    'protein_g': ['protein_g', 'Protein_g', 'Protein (g)', 'protein', 'Protein'],
    'saturated_fats_g': ['saturated_fats_g', 'Saturated_fats_g', 'Saturated Fats', 'Sat.Fat', 'Saturated Fats (g)'],
    'fat': ['fat', 'Fat', 'Total Fat', 'Fat_g', 'Fat (g)'],
    'carbohydrates': ['carbohydrates', 'Carbohydrates', 'Carbs', 'Carb_g', 'Carb (g)'],
    'fiber': ['fiber', 'Fiber', 'Dietary Fiber', 'Fiber_g', 'Fiber (g)'],
    'sugars': ['sugars', 'Sugars', 'Sugar_g', 'Sugar (g)'],
    'calcium_mg': ['calcium_mg', 'Calcium_mg', 'Calcium (mg)'],
    'iron_mg': ['iron_mg', 'Iron_mg', 'Iron (mg)', 'iron', 'Iron'],
    'magnesium_mg': ['magnesium_mg', 'Magnesium_mg', 'Magnesium (mg)'],
    'phosphorus_mg': ['phosphorus_mg', 'Phosphorus_mg', 'Phosphorus (mg)'],
    'potassium_mg': ['potassium_mg', 'Potassium_mg', 'Potassium (mg)'],
    'sodium_mg': ['sodium_mg', 'Sodium_mg', 'Sodium (mg)', 'sodium', 'Sodium'],
    'zinc_mg': ['zinc_mg', 'Zinc_mg', 'Zinc (mg)'],
    'copper_mcg': ['copper_mcg', 'Copper_mcg', 'Copper (mcg)'],
    'manganese_mg': ['manganese_mg', 'Manganese_mg', 'Manganese (mg)'],
    'selenium_mcg': ['selenium_mcg', 'Selenium_mcg', 'Selenium (mcg)'],
    'vitc_mg': ['vitc_mg', 'VitC_mg', 'Vitamin C', 'Vitamin C (mg)'],
    'thiamin_mg': ['thiamin_mg', 'Thiamin_mg', 'Vitamin B1', 'Vitamin B1 (mg)'],
    'riboflavin_mg': ['riboflavin_mg', 'Riboflavin_mg', 'Vitamin B2', 'Vitamin B2 (mg)'],
    'niacin_mg': ['niacin_mg', 'Niacin_mg', 'Vitamin B3', 'Vitamin B3 (mg)'],
    'vitb6_mg': ['vitb6_mg', 'VitB6_mg', 'Vitamin B6', 'Vitamin B6 (mg)'],
    'folate_mcg': ['folate_mcg', 'Folate_mcg', 'Folate (mcg)'],
    'vitb12_mcg': ['vitb12_mcg', 'VitB12_mcg', 'Vitamin B12', 'Vitamin B12 (mcg)'],
    'vita_mcg': ['vita_mcg', 'VitA_mcg', 'Vitamin A', 'Vitamin A (mcg)'],
    'vite_mg': ['vite_mg', 'VitE_mg', 'Vitamin E', 'Vitamin E (mg)'],
    'vitd2_mcg': ['vitd2_mcg', 'VitD2_mcg', 'Vitamin D2', 'Vitamin D2 (mcg)'],
    'category': ['category', 'Category', 'FoodCategory', 'type'],
}

# Columnas finales para ingredientes
ingredientes_final_cols = list(ingredientes_map.keys())

# Columnas relevantes para recetas
recetas_map = {
    'title': ['Titlerecipe', 'recipeName'],
    'ingredients': ['ingredients', 'Ingredients', 'Cleaned_Ingredients'],
    'instructions': ['instructions', 'Instructions', 'steps', 'pasos'],
    'image': ['image', 'Image', 'Image_Name'],
}
recetas_final_cols = list(recetas_map.keys())

# Diccionarios para combinar información por nombre
ingredientes_dict = {}
recetas_list = []

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

    df.columns = [c.strip() for c in df.columns]
    lower_cols = [c.lower() for c in df.columns]

    # INGREDIENTES: Si el archivo tiene alguna columna mapeada
    if any(any(col.lower() in lower_cols for col in v) for v in ingredientes_map.values()):
        for _, row in df.iterrows():
            ingrediente = {}
            # Buscar el valor para cada columna final
            for col_final, posibles in ingredientes_map.items():
                val = None
                for posible in posibles:
                    if posible in df.columns:
                        val = row[posible]
                        break
                    elif posible in lower_cols:
                        idx = lower_cols.index(posible)
                        val = row[df.columns[idx]]
                        break
                ingrediente[col_final] = val
            nombre = str(ingrediente['food']).strip().lower()
            if not nombre or nombre == 'nan':
                continue
            # Si ya existe, actualiza campos vacíos
            if nombre in ingredientes_dict:
                for k, v in ingrediente.items():
                    if (not ingredientes_dict[nombre][k] or pd.isna(ingredientes_dict[nombre][k])) and v:
                        ingredientes_dict[nombre][k] = v
            else:
                ingredientes_dict[nombre] = ingrediente

    # RECETAS: Si el archivo tiene alguna columna mapeada
    if any(any(col.lower() in lower_cols for col in v) for v in recetas_map.values()):
        for _, row in df.iterrows():
            receta = {}
            for col_final, posibles in recetas_map.items():
                val = None
                for posible in posibles:
                    if posible in df.columns:
                        val = row[posible]
                        break
                    elif posible in lower_cols:
                        idx = lower_cols.index(posible)
                        val = row[df.columns[idx]]
                        break
                # Limpieza básica de ingredientes si es lista en string
                if col_final == 'ingredients' and isinstance(val, str):
                    val = val.replace('[', '').replace(']', '').replace("'", '').replace('"', '').strip()
                receta[col_final] = val
            # Solo agrega si tiene título y al menos ingredientes
            if receta.get('title') and receta.get('ingredients'):
                recetas_list.append(receta)

# Crear DataFrame de ingredientes
ingredientes_df = pd.DataFrame(list(ingredientes_dict.values()), columns=ingredientes_final_cols)
recetas_df = pd.DataFrame(recetas_list, columns=recetas_final_cols)

if not ingredientes_df.empty:
    ingredientes_df = ingredientes_df.drop_duplicates(subset=['food'])
    ingredientes_df.to_csv(os.path.join(csv_folder, 'ingredientes_unificados.csv'), index=False)
    print("Archivo ingredientes_unificados.csv creado.")
else:
    print("No se encontraron datos de ingredientes.")

if not recetas_df.empty:
    recetas_df = recetas_df.drop_duplicates(subset=['title', 'ingredients'])
    recetas_df.to_csv(os.path.join(csv_folder, 'recetas_unificadas.csv'), index=False)
    print("Archivo recetas_unificadas.csv creado.")
else:
    print("No se encontraron datos de recetas.")