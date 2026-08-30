import os
import base64
from PIL import Image

def main():
    src_img_path = r'C:/Users/eduaz/.gemini/antigravity/brain/da67f3ef-a0cb-49a8-a698-b643ff1234e4/.user_uploaded/media_1788099780182.png'
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root, 'public')
    os.makedirs(public_dir, exist_ok=True)

    img = Image.open(src_img_path).convert('RGBA')
    print('Source image size:', img.size, img.mode)

    # 1. 512x512
    pwa512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    pwa512_path = os.path.join(public_dir, 'pwa-512x512.png')
    pwa512.save(pwa512_path, 'PNG')
    print('Saved pwa-512x512.png')

    # 2. 192x192
    pwa192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    pwa192.save(os.path.join(public_dir, 'pwa-192x192.png'), 'PNG')
    print('Saved pwa-192x192.png')

    # 3. apple-touch-icon 180x180
    apple180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    apple180.save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    print('Saved apple-touch-icon.png')

    # 4. favicon-32x32.png
    fav32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    fav32.save(os.path.join(public_dir, 'favicon-32x32.png'), 'PNG')
    print('Saved favicon-32x32.png')

    # 5. favicon.ico (multi-size: 16, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    pwa512.save(
        os.path.join(public_dir, 'favicon.ico'),
        format='ICO',
        sizes=ico_sizes
    )
    print('Saved favicon.ico')

    # 6. Embed base64 in favicon.svg so it renders identically in every SVG viewer/browser
    with open(pwa512_path, 'rb') as f:
        b64_data = base64.b64encode(f.read()).decode('utf-8')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_data}" x="0" y="0" width="512" height="512" />
</svg>
'''
    with open(os.path.join(public_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print('Saved favicon.svg')

    print('All icons generated successfully from the user-provided graphic!')

if __name__ == '__main__':
    main()
