from rembg import remove
from PIL import Image
import io
import os

def remove_background(image_path, output_path):
    with open(image_path, "rb") as input_file:
        input_image = input_file.read()

    # Supprimer l'arrière-plan
    output_image = remove(input_image)

    # Sauvegarder le résultat
    with open(output_path, "wb") as output_file:
        output_file.write(output_image)

def process_directory(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            input_path = os.path.join(directory, filename)
            output_path = os.path.join(directory, filename.replace(".png", "_nb.png"))
            remove_background(input_path, output_path)

# Exemple d'utilisation
process_directory(".")