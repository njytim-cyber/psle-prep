from PIL import Image
import os

def check_and_convert():
    source = 'avatars.png'
    dest = 'avatars.webp'
    
    if not os.path.exists(source):
        print(f"Source {source} not found.")
        return

    print(f"Converting {source} to {dest}...")
    try:
        img = Image.open(source)
        img.save(dest, 'WEBP', quality=85)
        
        old_size = os.path.getsize(source)
        new_size = os.path.getsize(dest)
        
        print(f"Conversion Complete.")
        print(f"Original (PNG): {old_size/1024:.2f} KB")
        print(f"New (WebP): {new_size/1024:.2f} KB")
        print(f"Saved: {(old_size - new_size)/1024:.2f} KB")
        
    except Exception as e:
        print(f"Error converting: {e}")

if __name__ == "__main__":
    check_and_convert()
