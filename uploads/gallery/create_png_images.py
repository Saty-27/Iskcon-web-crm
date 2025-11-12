#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_temple_images():
    # Create directory if it doesn't exist
    os.makedirs('/tmp/gallery', exist_ok=True)
    
    # Image dimensions
    width, height = 400, 300
    
    # Temple Main Hall - Golden temple design
    img1 = Image.new('RGB', (width, height), '#87CEEB')  # Sky blue background
    draw1 = ImageDraw.Draw(img1)
    
    # Temple structure
    draw1.rectangle([50, 150, 350, 250], fill='#DAA520', outline='#8B4513', width=3)  # Main hall
    draw1.rectangle([150, 100, 250, 150], fill='#CD853F')  # Upper structure
    draw1.polygon([(100, 150), (200, 80), (300, 150)], fill='#8B0000')  # Roof
    draw1.ellipse([175, 175, 225, 225], fill='#FF6347')  # Central decoration
    
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    except:
        font = ImageFont.load_default()
    
    draw1.text((200, 270), 'Temple Main Hall', fill='#8B4513', anchor='mm', font=font)
    img1.save('uploads/gallery/temple-main-hall.png')
    
    # Sacred Deity Darshan - Purple temple with golden details
    img2 = Image.new('RGB', (width, height), '#4B0082')  # Deep purple background
    draw2 = ImageDraw.Draw(img2)
    
    # Temple structure
    draw2.rectangle([75, 75, 325, 225], fill='#DDA0DD', outline='#FFD700', width=4)  # Main structure
    draw2.ellipse([125, 125, 175, 175], fill='#FF69B4')  # Left deity
    draw2.ellipse([225, 125, 275, 175], fill='#FF69B4')  # Right deity
    draw2.rectangle([175, 175, 225, 225], fill='#32CD32')  # Central altar
    draw2.polygon([(200, 100), (210, 115), (200, 130), (190, 115)], fill='#FFD700')  # Crown
    
    draw2.text((200, 270), 'Sacred Deity Darshan', fill='#FFD700', anchor='mm', font=font)
    img2.save('uploads/gallery/deity-darshan.png')
    
    # Prayer Ceremony - Orange gathering scene
    img3 = Image.new('RGB', (width, height), '#F0E68C')  # Light yellow background
    draw3 = ImageDraw.Draw(img3)
    
    # Prayer area
    draw3.ellipse([50, 100, 350, 200], fill='#FF7F50', outline='#DC143C', width=2)  # Prayer circle
    
    # People (represented as circles)
    positions = [(125, 150), (175, 130), (225, 130), (275, 150)]
    for x, y in positions:
        draw3.ellipse([x-15, y-15, x+15, y+15], fill='#8B4513')  # Person
    
    # Sacred flame
    draw3.polygon([(200, 80), (210, 110), (190, 110)], fill='#FFD700')  # Flame
    
    draw3.text((200, 270), 'Prayer Ceremony', fill='#8B4513', anchor='mm', font=font)
    img3.save('uploads/gallery/prayer-ceremony.png')
    
    print("Created 3 PNG images successfully")

if __name__ == "__main__":
    create_temple_images()