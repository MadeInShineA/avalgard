from PIL import Image

# Paramètres de la spritesheet
sprite_sheet = Image.open("vegetables.png")
sprite_width = 48  # Largeur d'un sprite
sprite_height = 39.3 # Hauteur d'un sprite
columns = 7        # Nombre de sprites par ligne
rows = 6           # Nombre de sprites par colonne

for y in range(rows):
    for x in range(columns):
        left = x * sprite_width
        top = y * sprite_height
        right = left + sprite_width
        bottom = top + sprite_height

        # Découper le sprite
        sprite = sprite_sheet.crop((left, top, right, bottom))

        # Sauvegarder le sprite
        sprite.save(f"sprite_{y}_{x}.png")
