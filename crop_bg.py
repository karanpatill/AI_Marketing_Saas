from PIL import Image

def crop_transparent(image_path):
    img = Image.open(image_path)
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(image_path)
        print("Cropped to bounding box:", bbox)
    else:
        print("Could not find a bounding box.")

crop_transparent('public/text_logo_nobg.png')
