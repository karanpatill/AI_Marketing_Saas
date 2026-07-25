from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=100):
    img = Image.open(input_path).convert('RGBA')
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if the pixel is near white
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, 'PNG')

remove_white_bg('public/text logo.png', 'public/text_logo_nobg.png', tolerance=100)
print('Background removed using Pillow')
