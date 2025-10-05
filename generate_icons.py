#!/usr/bin/env python3
"""Generate simple placeholder icons for the extension"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple filter icon"""
    # Create a new image with a light blue background
    img = Image.new('RGBA', (size, size), (70, 130, 200, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw a simple filter/funnel shape
    padding = size // 8
    
    # Calculate funnel coordinates
    top_y = padding
    mid_y = size // 2
    bottom_y = size - padding
    left_x = padding
    right_x = size - padding
    center_x = size // 2
    
    # Draw funnel shape (triangle on top, rectangle stem below)
    funnel_points = [
        (left_x, top_y),  # Top left
        (right_x, top_y),  # Top right
        (center_x + size//8, mid_y),  # Right middle
        (center_x + size//8, bottom_y - size//4),  # Right bottom
        (center_x - size//8, bottom_y - size//4),  # Left bottom
        (center_x - size//8, mid_y),  # Left middle
    ]
    
    # Draw the funnel in white
    draw.polygon(funnel_points, fill=(255, 255, 255, 255))
    
    # Draw a small rectangle at the bottom (filter output)
    rect_width = size // 4
    rect_height = size // 8
    rect_left = center_x - rect_width // 2
    rect_top = bottom_y - size//4
    rect_right = center_x + rect_width // 2
    rect_bottom = bottom_y
    draw.rectangle([rect_left, rect_top, rect_right, rect_bottom], 
                   fill=(255, 255, 255, 255))
    
    # Save the icon
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Create icons in different sizes
sizes = [16, 32, 48, 64]
for size in sizes:
    create_icon(size, f'icon-{size}.png')

print("All icons generated successfully!")
