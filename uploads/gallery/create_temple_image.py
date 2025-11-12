import struct
import math

def create_simple_image(width, height, color, filename):
    # Create a simple colored rectangle image in PPM format
    with open(filename, 'wb') as f:
        # PPM header
        f.write(f'P6\n{width} {height}\n255\n'.encode())
        
        # Create temple-like pattern with different shades
        r, g, b = color
        for y in range(height):
            for x in range(width):
                # Create temple architecture pattern
                if 200 <= x <= 600 and 150 <= y <= 450:  # Main structure
                    if 350 <= x <= 450 and 200 <= y <= 350:  # Central shrine
                        pixel = (min(255, r + 40), min(255, g + 40), min(255, b + 40))
                    elif 300 <= x <= 500 and 180 <= y <= 200:  # Top decoration
                        pixel = (255, 215, 0)  # Gold
                    else:
                        pixel = (r, g, b)
                else:
                    # Background with gradient
                    shade = int(50 + (y / height) * 100)
                    pixel = (shade, shade, shade + 20)
                
                f.write(bytes(pixel))

# Temple color schemes
colors = [
    (139, 69, 19),   # Temple brown
    (205, 92, 92),   # Temple red
    (160, 82, 45),   # Saddle brown
    (210, 180, 140), # Temple tan
    (178, 34, 34),   # Fire brick
    (188, 143, 143)  # Rosy brown
]

for i, color in enumerate(colors):
    filename = f'gallery-{1749646700000 + i}-{i+1}.ppm'
    create_simple_image(800, 600, color, filename)
    print(f'Created {filename}')
