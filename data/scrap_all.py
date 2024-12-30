import requests
import json

key_id = "PSK12UyBa04u"
key = "b5858292-b988-46fb-8868-faf02d7cf8c7"
base_url = "https://permapeople.org/api/plants"

headers = {
    "x-permapeople-key-id": key_id,
    "x-permapeople-key-secret": key
}

last_id = 1
all_data = []

while True:
    url = f"{base_url}?last_id={last_id}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if not data or not data.get('plants'):  # Si aucune donnée ou liste de plantes vide, on arrête la boucle
            break
        all_data.extend(data['plants'])
        last_id = data['plants'][-1]['id']  # Mettre à jour last_id avec l'ID de la dernière plante reçue
    else:
        print(f"Failed to retrieve data: {response.status_code}")
        break

# Écrire toutes les données dans un fichier texte
with open("response.txt", "w") as file:
    json.dump(all_data, file, indent=4)

print("All data written to response.txt")