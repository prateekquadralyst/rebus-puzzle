#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient_bg(width, height, top_color, bottom_color):
    base = Image.new('RGBA', (width, height), top_color)
    top_r, top_g, top_b = top_color[:3]
    bot_r, bot_g, bot_b = bottom_color[:3]
    
    for y in range(height):
        ratio = y / float(height)
        r = int(top_r + (bot_r - top_r) * ratio)
        g = int(top_g + (bot_g - top_g) * ratio)
        b = int(top_b + (bot_b - top_b) * ratio)
        for x in range(width):
            base.putpixel((x, y), (r, g, b, 255))
    return base

def draw_star(draw, cx, cy, r_outer, r_inner, fill_color, points=4):
    coords = []
    for i in range(points * 2):
        angle = i * math.pi / points - math.pi / 2
        r = r_outer if i % 2 == 0 else r_inner
        coords.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(coords, fill=fill_color)

def draw_cloud(draw, cx, cy, scale=1.0, fill_color=(255, 255, 255, 230)):
    r = int(40 * scale)
    draw.ellipse([cx - r*2, cy - r, cx - r*0.5, cy + r*0.8], fill=fill_color)
    draw.ellipse([cx - r*1.2, cy - r*1.5, cx + r*0.4, cy + r*0.8], fill=fill_color)
    draw.ellipse([cx - r*0.2, cy - r*1.8, cx + r*1.5, cy + r*0.8], fill=fill_color)
    draw.ellipse([cx + r*0.6, cy - r*1.1, cx + r*2.2, cy + r*0.8], fill=fill_color)
    draw.rounded_rectangle([cx - r*1.8, cy - r*0.2, cx + r*2.0, cy + r*0.8], radius=int(r*0.5), fill=fill_color)

def draw_balloon(draw, cx, cy, rx, ry, color, highlight_color):
    # Balloon body
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color)
    # Highlight glare
    draw.ellipse([cx - rx*0.6, cy - ry*0.7, cx - rx*0.2, cy - ry*0.2], fill=highlight_color)
    # Knot
    draw.polygon([(cx - 8, cy + ry), (cx + 8, cy + ry), (cx, cy + ry + 12)], fill=color)
    # String
    draw.line([(cx, cy + ry + 12), (cx + 10, cy + ry + 35), (cx - 5, cy + ry + 60)], fill=(220, 220, 220, 180), width=3)

def draw_teddy(draw, cx, cy, scale=1.0):
    # Ears
    ear_r = int(55 * scale)
    # Left Ear
    draw.ellipse([cx - 150*scale, cy - 140*scale, cx - 150*scale + ear_r*2, cy - 140*scale + ear_r*2], fill=(217, 119, 6))
    draw.ellipse([cx - 135*scale, cy - 125*scale, cx - 135*scale + ear_r*1.4, cy - 125*scale + ear_r*1.4], fill=(251, 207, 232))
    # Right Ear
    draw.ellipse([cx + 150*scale - ear_r*2, cy - 140*scale, cx + 150*scale, cy - 140*scale + ear_r*2], fill=(217, 119, 6))
    draw.ellipse([cx + 135*scale - ear_r*1.4, cy - 125*scale, cx + 135*scale, cy - 125*scale + ear_r*1.4], fill=(251, 207, 232))

    # Head
    hr = int(140 * scale)
    draw.ellipse([cx - hr, cy - hr*0.9, cx + hr, cy + hr*0.9], fill=(245, 158, 11))
    
    # Rosy cheeks
    draw.ellipse([cx - 95*scale, cy + 10*scale, cx - 45*scale, cy + 45*scale], fill=(244, 114, 182, 180))
    draw.ellipse([cx + 45*scale, cy + 10*scale, cx + 95*scale, cy + 45*scale], fill=(244, 114, 182, 180))

    # Eyes
    eye_r = int(16 * scale)
    # Left eye
    draw.ellipse([cx - 55*scale, cy - 25*scale, cx - 55*scale + eye_r*2, cy - 25*scale + eye_r*2], fill=(15, 23, 42))
    draw.ellipse([cx - 52*scale, cy - 23*scale, cx - 52*scale + eye_r*0.7, cy - 23*scale + eye_r*0.7], fill=(255, 255, 255))
    # Right eye
    draw.ellipse([cx + 55*scale - eye_r*2, cy - 25*scale, cx + 55*scale, cy - 25*scale + eye_r*2], fill=(15, 23, 42))
    draw.ellipse([cx + 58*scale - eye_r*2, cy - 23*scale, cx + 58*scale - eye_r*1.3, cy - 23*scale + eye_r*0.7], fill=(255, 255, 255))

    # Snout
    snout_w = int(75 * scale)
    snout_h = int(55 * scale)
    draw.ellipse([cx - snout_w, cy + 5*scale, cx + snout_w, cy + 5*scale + snout_h*2], fill=(254, 240, 138))

    # Nose
    draw.ellipse([cx - 22*scale, cy + 18*scale, cx + 22*scale, cy + 42*scale], fill=(15, 23, 42))
    # Mouth smile
    draw.arc([cx - 26*scale, cy + 32*scale, cx + 26*scale, cy + 62*scale], start=10, end=170, fill=(15, 23, 42), width=int(5*scale))

    # Party Hat
    hat_coords = [(cx, cy - 170*scale), (cx - 48*scale, cy - 85*scale), (cx + 48*scale, cy - 85*scale)]
    draw.polygon(hat_coords, fill=(239, 68, 68))
    # Hat Pom-Pom
    draw.ellipse([cx - 16*scale, cy - 186*scale, cx + 16*scale, cy - 154*scale], fill=(253, 224, 71))

def draw_alphabet_cube(draw, cx, cy, size, letter, bg_color, border_color):
    half = size // 2
    draw.rounded_rectangle([cx - half, cy - half, cx + half, cy + half], radius=16, fill=bg_color, outline=border_color, width=4)
    # Simple bold letter
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.58))
    except Exception:
        font = ImageFont.load_default()
    
    bbox = font.getbbox(letter)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((cx - tw / 2, cy - th / 2 - 4), letter, fill=(255, 255, 255), font=font)

def generate_launcher_icon():
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded Squircle Background
    draw.rounded_rectangle([20, 20, size - 20, size - 20], radius=240, fill=(30, 27, 75))
    
    # Inner glowing colorful circle
    draw.ellipse([80, 80, size - 80, size - 80], fill=(79, 70, 229, 140))
    draw.ellipse([140, 140, size - 140, size - 140], fill=(99, 102, 241, 100))

    # Golden magical stars
    draw_star(draw, 180, 200, 36, 14, (253, 224, 71))
    draw_star(draw, 840, 220, 42, 16, (253, 224, 71))
    draw_star(draw, 160, 820, 32, 12, (253, 224, 71))
    draw_star(draw, 860, 800, 38, 15, (253, 224, 71))

    # Floating Balloons
    draw_balloon(draw, 220, 380, 60, 75, (239, 68, 68), (254, 202, 202))
    draw_balloon(draw, 820, 360, 60, 75, (16, 185, 129), (167, 243, 208))
    draw_balloon(draw, 840, 520, 52, 65, (6, 182, 212), (165, 243, 252))

    # Fluffy Cloud base for Teddy
    draw_cloud(draw, 512, 740, scale=3.6, fill_color=(255, 255, 255, 245))

    # Teddy Mascot
    draw_teddy(draw, 512, 530, scale=1.9)

    # Toy blocks A, B, C, 1, 2, 3
    draw_alphabet_cube(draw, 220, 680, 140, 'A', (239, 68, 68), (254, 202, 202))
    draw_alphabet_cube(draw, 350, 770, 120, '1', (245, 158, 11), (254, 240, 138))
    draw_alphabet_cube(draw, 800, 680, 140, 'B', (16, 185, 129), (167, 243, 208))
    draw_alphabet_cube(draw, 680, 770, 120, '2', (168, 85, 247), (233, 213, 255))

    # Golden border frame
    draw.rounded_rectangle([20, 20, size - 20, size - 20], radius=240, outline=(253, 224, 71), width=18)

    return img

def generate_splash_screen():
    w, h = 1080, 1920
    img = create_gradient_bg(w, h, (15, 23, 42), (30, 27, 75))
    draw = ImageDraw.Draw(img)

    # Radiant smiling sun top right
    sun_x, sun_y = 900, 220
    draw.ellipse([sun_x - 160, sun_y - 160, sun_x + 160, sun_y + 160], fill=(254, 240, 138, 70))
    draw.ellipse([sun_x - 100, sun_y - 100, sun_x + 100, sun_y + 100], fill=(250, 204, 21))
    # Sun smile
    draw.ellipse([sun_x - 45, sun_y - 20, sun_x - 25, sun_y], fill=(15, 23, 42))
    draw.ellipse([sun_x + 25, sun_y - 20, sun_x + 45, sun_y], fill=(15, 23, 42))
    draw.arc([sun_x - 40, sun_y, sun_x + 40, sun_y + 40], start=10, end=170, fill=(15, 23, 42), width=6)

    # Stars in the sky
    stars = [(160, 180), (380, 280), (120, 480), (960, 520), (220, 920), (880, 1050), (140, 1320), (940, 1380)]
    for sx, sy in stars:
        draw_star(draw, sx, sy, 24, 9, (253, 224, 71))

    # Floating Clouds
    draw_cloud(draw, 240, 340, scale=1.8, fill_color=(255, 255, 255, 120))
    draw_cloud(draw, 820, 450, scale=2.0, fill_color=(255, 255, 255, 120))
    draw_cloud(draw, 180, 780, scale=1.6, fill_color=(255, 255, 255, 90))

    # Colorful floating balloons
    draw_balloon(draw, 180, 580, 65, 82, (239, 68, 68), (254, 202, 202))
    draw_balloon(draw, 900, 720, 70, 88, (16, 185, 129), (167, 243, 208))
    draw_balloon(draw, 860, 900, 58, 74, (6, 182, 212), (165, 243, 252))
    draw_balloon(draw, 140, 1020, 62, 78, (168, 85, 247), (233, 213, 255))

    # Center Grand Cloud Throne for Mascot
    draw_cloud(draw, 540, 1060, scale=4.6, fill_color=(255, 255, 255, 240))

    # Teddy Mascot
    draw_teddy(draw, 540, 800, scale=2.4)

    # Floating Learning Toy Cubes
    draw_alphabet_cube(draw, 220, 960, 150, 'A', (239, 68, 68), (254, 202, 202))
    draw_alphabet_cube(draw, 360, 1070, 130, '1', (245, 158, 11), (254, 240, 138))
    draw_alphabet_cube(draw, 860, 960, 150, 'B', (16, 185, 129), (167, 243, 208))
    draw_alphabet_cube(draw, 720, 1070, 130, '2', (168, 85, 247), (233, 213, 255))

    # Title & Branding at the Bottom
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 84)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
    except Exception:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Title Ribbon Banner
    draw.rounded_rectangle([180, 1380, 900, 1520], radius=38, fill=(79, 70, 229), outline=(253, 224, 71), width=6)
    title_text = "TODDLER MIND"
    tbbox = font_large.getbbox(title_text)
    tw = tbbox[2] - tbbox[0]
    draw.text((540 - tw / 2, 1410), title_text, fill=(255, 255, 255), font=font_large)

    # Subtitle Pill
    draw.rounded_rectangle([250, 1560, 830, 1630], radius=24, fill=(245, 158, 11))
    sub_text = "✨ PLAY • LEARN • SMILE ✨"
    sbbox = font_sub.getbbox(sub_text)
    sw = sbbox[2] - sbbox[0]
    draw.text((540 - sw / 2, 1572), sub_text, fill=(15, 23, 42), font=font_sub)

    return img

def main():
    print("🎨 Generating World-Class App Icon & Splash Screen...")
    icon_master = generate_launcher_icon()
    splash_master = generate_splash_screen()

    res_dir = "/home/prateek/projects/rebus-puzzle/android/app/src/main/res"

    # 1. Launcher Icons in mipmap folders
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }

    # Save 512x512 master icon
    os.makedirs("/home/prateek/projects/rebus-puzzle/public", exist_ok=True)
    resample_filter = getattr(Image, 'LANCZOS', getattr(getattr(Image, 'Resampling', None), 'LANCZOS', Image.ANTIALIAS))
    icon_master.resize((512, 512), resample_filter).save("/home/prateek/projects/rebus-puzzle/public/app-icon-512.png")
    icon_master.resize((512, 512), resample_filter).save("/home/prateek/projects/rebus-puzzle/android/app/src/main/ic_launcher-web.png")

    for folder, s in sizes.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        # ic_launcher.png
        icon_master.resize((s, s), resample_filter).save(os.path.join(target_dir, "ic_launcher.png"))
        # ic_launcher_round.png
        icon_master.resize((s, s), resample_filter).save(os.path.join(target_dir, "ic_launcher_round.png"))
        # ic_launcher_foreground.png (scaled for adaptive icon)
        fg_size = int(s * 108 / 48)
        icon_master.resize((fg_size, fg_size), resample_filter).save(os.path.join(target_dir, "ic_launcher_foreground.png"))
        print(f"  ✓ Saved launcher icons for {folder} ({s}x{s})")

    # 2. Splash Screens in drawable folders
    splash_sizes = {
        "drawable": (480, 800),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1080, 1920)
    }

    for folder, (sw, sh) in splash_sizes.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        splash_master.resize((sw, sh), resample_filter).save(os.path.join(target_dir, "splash.png"))
        print(f"  ✓ Saved splash for {folder} ({sw}x{sh})")

    # Landscape splash screens
    splash_land = splash_master.rotate(90, expand=True)
    land_sizes = {
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1080)
    }
    for folder, (lw, lh) in land_sizes.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        splash_land.resize((lw, lh), resample_filter).save(os.path.join(target_dir, "splash.png"))
        print(f"  ✓ Saved landscape splash for {folder} ({lw}x{lh})")

    print("🎉 All Launcher Icons and Splash Screens generated successfully!")

if __name__ == "__main__":
    main()
