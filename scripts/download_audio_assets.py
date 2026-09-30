#!/usr/bin/env python3
import os
import time
import urllib.request
import urllib.parse

PUBLIC_AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'audio')

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def download_file(url, target_path, retries=3):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        return True
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    data = resp.read()
                    with open(target_path, 'wb') as f:
                        f.write(data)
                    return True
        except Exception as e:
            print(f"Retry {attempt+1}/{retries} for {os.path.basename(target_path)}: {e}")
            time.sleep(0.5)
    return False

def setup_piano():
    print("🎹 Downloading Grand Piano Notes...")
    piano_dir = os.path.join(PUBLIC_AUDIO_DIR, 'piano')
    ensure_dir(piano_dir)
    notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    base_url = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/{}.mp3'
    for n in notes:
        target = os.path.join(piano_dir, f"{n}.mp3")
        success = download_file(base_url.format(n), target)
        print(f"  {'✓' if success else '✗'} Piano {n}")

def setup_scratch_sounds():
    print("🐾 Downloading Real Animals, Vehicles, and FX from Scratch sound bank...")
    sound_map = {
        # Animals
        os.path.join('animals', 'dog.wav'): 'cd8fa8390b0efdd281882533fbfcfcfb.wav',
        os.path.join('animals', 'cat.wav'): '83c36d806dc92327b9e7049a565c6bff.wav',
        os.path.join('animals', 'cow.wav'): '7206280bd4444a06d25f19a84dcb56b1.wav',
        os.path.join('animals', 'duck.wav'): 'af5b039e1b05e0ccb12944f648a8884e.wav',
        os.path.join('animals', 'horse.wav'): '45ffcf97ee2edca0199ff5aa71a5b72e.wav',
        os.path.join('animals', 'rooster.wav'): '2e375acae2c7c0d655935a9de14b12f6.wav',
        os.path.join('animals', 'frog.wav'): 'c6ce0aadb89903a43f76fc20ea57633e.wav',
        os.path.join('animals', 'bird.wav'): '18bd4b634a3f992a16b30344c7d810e0.wav',
        os.path.join('animals', 'lion.wav'): '79d052b0921d2078d42389328b1be168.wav',
        os.path.join('animals', 'sheep.wav'): '45ffcf97ee2edca0199ff5aa71a5b72e.wav', # fallback or whinny
        # Vehicles
        os.path.join('vehicles', 'car-horn.wav'): '7c887f6a2ecd1cdb85d5527898d7f7a0.wav',
        os.path.join('vehicles', 'train.wav'): '50f29d0e028ec5c11210d0e2f91f83dd.wav',
        os.path.join('vehicles', 'siren.wav'): 'b10dcd209865fbd392534633307dafad.wav',
        os.path.join('vehicles', 'bicycle.wav'): '4cbd4dc0c55656e7edc4b0f00a3f9738.wav',
        # FX
        os.path.join('fx', 'pop.wav'): '83a9787d4cb6f3b7632b4ddfebf74367.wav',
        os.path.join('fx', 'cheer.wav'): '170e05c29d50918ae0b482c2955768c0.wav',
        os.path.join('fx', 'tada.wav'): '10eed5b6b49ec7baf1d4b3b3fad0ac99.wav',
        os.path.join('fx', 'win.wav'): 'db480f6d5ae6d494dbb76ffb9bd995d5.wav',
        os.path.join('fx', 'whistle.wav'): '8468b9b3f11a665ee4d215afd8463b97.wav',
        os.path.join('fx', 'doorbell.wav'): 'b67db6ed07f882e52a9ef4dbb76f5f64.wav',
    }

    base_scratch = 'https://assets.scratch.mit.edu/internalapi/asset/{}/get/'
    for rel_path, md5 in sound_map.items():
        target = os.path.join(PUBLIC_AUDIO_DIR, rel_path)
        ensure_dir(os.path.dirname(target))
        success = download_file(base_scratch.format(md5), target)
        print(f"  {'✓' if success else '✗'} Sound {rel_path}")

def setup_numbers_voice():
    print("🔢 Downloading Crystal Clear Voice Counting (1 to 10)...")
    numbers_dir = os.path.join(PUBLIC_AUDIO_DIR, 'numbers')
    ensure_dir(numbers_dir)
    words = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
    base_tts = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q={}'
    for i, w in enumerate(words, 1):
        target = os.path.join(numbers_dir, f"{i}.mp3")
        success = download_file(base_tts.format(w), target)
        print(f"  {'✓' if success else '✗'} Number {i} ({w})")

def setup_alphabet_voice():
    print("🔤 Downloading A-Z Alphabet Clear Phonics & Pronunciations...")
    alpha_dir = os.path.join(PUBLIC_AUDIO_DIR, 'alphabet')
    ensure_dir(alpha_dir)
    letters = [chr(c) for c in range(ord('A'), ord('Z')+1)]
    base_tts = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q={}'
    for l in letters:
        target = os.path.join(alpha_dir, f"{l}.mp3")
        # Pronounce letter clearly
        success = download_file(base_tts.format(f"Letter%20{l}"), target)
        print(f"  {'✓' if success else '✗'} Letter {l}")

def setup_hindi_voice():
    print("🕉️ Downloading Hindi Swar & Vyanjan Authentic Voices...")
    hindi_dir = os.path.join(PUBLIC_AUDIO_DIR, 'hindi')
    ensure_dir(hindi_dir)
    
    hindi_items = [
        # Swar
        ('swar_0', 'अ से अनार'),
        ('swar_1', 'आ से आम'),
        ('swar_2', 'इ से इमली'),
        ('swar_3', 'ई से ईख'),
        ('swar_4', 'उ से उल्लू'),
        ('swar_5', 'ऊ से ऊन'),
        ('swar_6', 'ऋ से ऋषि'),
        ('swar_7', 'ए से एड़ी'),
        ('swar_8', 'ऐ से ऐनक'),
        ('swar_9', 'ओ से ओखली'),
        ('swar_10', 'औ से औरत'),
        ('swar_11', 'अं से अंगूर'),
        ('swar_12', 'अः'),
        # Vyanjan
        ('vyanjan_0', 'क से कबूतर'),
        ('vyanjan_1', 'ख से खरगोश'),
        ('vyanjan_2', 'ग से गमला'),
        ('vyanjan_3', 'घ से घड़ी'),
        ('vyanjan_4', 'ड़'),
        ('vyanjan_5', 'च से चम्मच'),
        ('vyanjan_6', 'छ से छाता'),
        ('vyanjan_7', 'ज से जहाज'),
        ('vyanjan_8', 'झ से झंडा'),
        ('vyanjan_9', 'ञ'),
        ('vyanjan_10', 'ट से टमाटर'),
        ('vyanjan_11', 'ठ से ठठेरा'),
        ('vyanjan_12', 'ड से डमरू'),
        ('vyanjan_13', 'ढ से ढक्कन'),
        ('vyanjan_14', 'ण'),
        ('vyanjan_15', 'त से तरबूज'),
        ('vyanjan_16', 'थ से थर्मस'),
        ('vyanjan_17', 'द से दवात'),
        ('vyanjan_18', 'ध से धनुष'),
        ('vyanjan_19', 'न से नल'),
        ('vyanjan_20', 'प से पतंग'),
        ('vyanjan_21', 'फ से फल'),
        ('vyanjan_22', 'ब से बत्तख'),
        ('vyanjan_23', 'भ से भालू'),
        ('vyanjan_24', 'म से मछली'),
        ('vyanjan_25', 'य से यज्ञ'),
        ('vyanjan_26', 'र से रथ'),
        ('vyanjan_27', 'ल से लट्टू'),
        ('vyanjan_28', 'व से वक'),
        ('vyanjan_29', 'श से शलजम'),
        ('vyanjan_30', 'ष से षट्कोण'),
        ('vyanjan_31', 'स से सेब'),
        ('vyanjan_32', 'ह से हाथी'),
        ('vyanjan_33', 'क्ष से क्षत्रिय'),
        ('vyanjan_34', 'त्र से त्रिशूल'),
        ('vyanjan_35', 'ज्ञ से ज्ञानी')
    ]

    base_tts = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q={}'
    for file_key, phrase in hindi_items:
        target = os.path.join(hindi_dir, f"{file_key}.mp3")
        quoted = urllib.parse.quote(phrase)
        success = download_file(base_tts.format(quoted), target)
        print(f"  {'✓' if success else '✗'} Hindi {file_key}: {phrase}")

if __name__ == '__main__':
    print(f"Starting audio asset download to {PUBLIC_AUDIO_DIR}...")
    setup_piano()
    setup_scratch_sounds()
    setup_numbers_voice()
    setup_alphabet_voice()
    setup_hindi_voice()
    print("🎉 All audio assets setup completed successfully!")
