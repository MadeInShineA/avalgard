import json

# Charger les données du fichier response.txt
with open("response.txt", "r") as file:
    data = json.load(file)

# Critères de filtrage
required_keys = ["Edible", "Water requirement", "Light requirement", "Height", "Growth", "Width"]

filtered_plants = []

for plant in data:
    plant_data_keys = [item['key'] for item in plant.get('data', [])]
    if all(key in plant_data_keys for key in required_keys):
        # Garder l'entrée jusqu'à la partie 'data'
        filtered_plant = {k: v for k, v in plant.items() if k in ['id', 'name', 'data']}
        filtered_plant['data'] = [item for item in plant['data'] if item['key'] in required_keys]
        filtered_plants.append(filtered_plant)

# Écrire les plantes filtrées dans un nouveau fichier
with open("filtered_response.txt", "w") as file:
    json.dump(filtered_plants, file, indent=4)

print("Filtered data written to filtered_response.txt")