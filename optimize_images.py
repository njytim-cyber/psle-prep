from PIL import Image
import os

def optimize_image(path):
    try:
        if not os.path.exists(path):
            print(f"File not found: {path}")
            return

        print(f"Optimizing {path}...")
        original_size = os.path.getsize(path)
        
        img = Image.open(path)
        
        # Save with optimization enabled
        # If it's PNG, we can try to reduce colors or just use optimize=True
        img.save(path, "PNG", optimize=True)
        
        new_size = os.path.getsize(path)
        saved = original_size - new_size
        print(f"Done! Reduced by {saved/1024:.2f} KB ({(saved/original_size)*100:.2f}%)")
        
    except ImportError:
        print("Pillow (PIL) not installed. Please run: pip install Pillow")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    optimize_image("avatars.png")
