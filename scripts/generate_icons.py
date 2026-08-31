import os
import base64
from PIL import Image, ImageDraw

def create_squircle_mask(size, radius):
    mask = Image.new('L', (size * 2, size * 2), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, size * 2, size * 2], radius=radius * 2, fill=255)
    return mask.resize((size, size), Image.Resampling.LANCZOS)

def generate_option_2(base_face_img, size=512):
    # Base canvas
    v2 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d2 = ImageDraw.Draw(v2)
    
    # Deep Violet to Midnight Gradient
    for y in range(size):
        ratio = y / size
        r = int(30 * (1 - ratio) + 15 * ratio)
        g = int(16 * (1 - ratio) + 23 * ratio)
        b = int(60 * (1 - ratio) + 42 * ratio)
        d2.line([(0, y), (size, y)], fill=(r, g, b, 255))
        
    # Soft purple glow in center
    for i in range(160, 0, -1):
        alpha = int(45 * (1 - i/160))
        d2.ellipse([256 - i, 256 - i, 256 + i, 256 + i], fill=(139, 92, 246, alpha))
        
    # Resize face and center it
    face_size = int(size * 0.72)
    face_resized = base_face_img.resize((face_size, face_size), Image.Resampling.LANCZOS)
    offset = (size - face_size) // 2
    v2.paste(face_resized, (offset, offset), face_resized)
    
    # Apply rounded squircle mask
    mask = create_squircle_mask(size, int(size * 0.22))
    v2_final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    v2_final.paste(v2, (0, 0), mask)
    return v2_final

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root, 'public')
    os.makedirs(public_dir, exist_ok=True)

    src_img_path = r'C:/Users/eduaz/.gemini/antigravity/brain/da67f3ef-a0cb-49a8-a698-b643ff1234e4/.user_uploaded/media_1788099780182.png'
    base_face = Image.open(src_img_path).convert('RGBA')

    # Generate 512x512 Option 2
    icon512 = generate_option_2(base_face, size=512)
    pwa512_path = os.path.join(public_dir, 'pwa-512x512.png')
    icon512.save(pwa512_path, 'PNG')
    print('Saved pwa-512x512.png (Option 2 - Deep Violet Glow)')

    # 192x192
    pwa192 = icon512.resize((192, 192), Image.Resampling.LANCZOS)
    pwa192.save(os.path.join(public_dir, 'pwa-192x192.png'), 'PNG')
    print('Saved pwa-192x192.png')

    # apple-touch-icon 180x180
    apple180 = icon512.resize((180, 180), Image.Resampling.LANCZOS)
    apple180.save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    print('Saved apple-touch-icon.png')

    # favicon-32x32.png
    fav32 = icon512.resize((32, 32), Image.Resampling.LANCZOS)
    fav32.save(os.path.join(public_dir, 'favicon-32x32.png'), 'PNG')
    print('Saved favicon-32x32.png')

    # favicon.ico (multi-size: 16, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon512.save(
        os.path.join(public_dir, 'favicon.ico'),
        format='ICO',
        sizes=ico_sizes
    )
    print('Saved favicon.ico')

    # Embed in favicon.svg
    with open(pwa512_path, 'rb') as f:
        b64_data = base64.b64encode(f.read()).decode('utf-8')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_data}" x="0" y="0" width="512" height="512" />
</svg>
'''
    with open(os.path.join(public_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print('Saved favicon.svg')

    print('All icons updated to Option 2 successfully!')

if __name__ == '__main__':
    main()
