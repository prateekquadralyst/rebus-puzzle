# 🧸 Toddler Mind World & Rebus Puzzle (टॉडलर माइंड वर्ल्ड)

> **A Magical, Ad-Free Early Learning & Sensory Puzzle Playground for Toddlers, Preschoolers & Young Kids (Ages 1.5 - 6 Years).**  
> Built with **Angular 19 (Standalone Components & Signals)**, **Web Audio API synthesizers**, **HTML5 Canvas**, and **Capacitor 7** for Android APK & Web.

---

## 🌟 Highlights at a Glance
- 🌈 **11 Interactive Games & Learning Modules**
- 🔊 **Zero-Latency In-Memory Soundbank (`public/audio/`)**: Real sampled Grand Piano notes, authentic animal roars/barks/meows, vehicle sounds, studio alphabet phonics voices (A-Z), clear number counting (1-10), and studio Hindi pronunciations (Swar, Vyanjan, and Samyuktakshar) with Web Audio buffer caching!
- 🎨 **Multi-Theme Engine**: 6 hand-tailored visual themes (*Midnight Sky, Candy Land, Jungle Safari, Sunshine Play, Ocean Breeze, Space Galaxy*).
- 🗣️ **Bilingual Speech & Phonics**: Studio voice clips and Web Speech synthesis in **English** and **Hindi (hi-IN)** for colors, letters, numbers, and praise.
- 📱 **Auto Landscape Rainbow Piano**: Seamlessly locks screen orientation to Landscape mode via `@capacitor/screen-orientation` and Web Orientation API for maximum toddler touch accuracy.
- ⏭️ **On-Demand Quiz Progression**: Instant 3D candy **"Next Question ⏭️" / "अगला सवाल"** button across quiz modes so kids advance at their own pace.
- 🏰 **100dvh Toddler Wonderland Start Portal**: Living Mascot companion on cloud throne, 6 instant 1-tap buddy avatar dots, 7-note rainbow music halo, grand 3D candy jelly play button, and rolling meadow with Choo-Choo train & critters.
- 🛡️ **Parent Gate & Screen Time Controls**: Protected by math challenge locks to manage healthy digital habits.
- 📱 **Cross-Platform**: Runs in modern web browsers and compiles directly to a native **Android APK** with Capacitor 7.

---

## 🎮 Complete Games & Features Catalogue

### 1. 🎨 Magic Finger Coloring & Glow Slate (जादुई रंग भरो)
* **Tap & Color Mode**:
  - **11 Handcrafted Vector Templates**:
    1. 🧸 **Teddy Bear** (भालू)
    2. 🦋 **Happy Butterfly** (तितली)
    3. 🚗 **Cartoon Car** (कार)
    4. 🍎 **Juicy Apple** (सेब)
    5. 🦕 **Baby Dinosaur** (डायनासोर)
    6. 🎂 **Birthday Cake** (केक)
    7. 🚀 **Space Rocket** (रॉकेट)
    8. 🦁 **Brave Lion** (शेर)
    9. 🦄 **Magical Unicorn** (यूनिकॉर्न)
    10. 🐠 **Little Fish** (मछली)
    11. 🍦 **Sweet Ice Cream** (आइसक्रीम)
  - All templates start as clean white coloring book pages.
  - **12 Candy Colors + 🌈 Magic Rainbow Color**: Fills SVG paths with watercolor splash sounds and ripple feedback.
  - **🗣️ Hindi Voice Color Announcements**: Tap any color to hear clear Hindi speech (*"लाल रंग!", "नीला रंग!", "पीला रंग!"*).
  - **🪄 Magic Auto-Fill Wand**: 1-tap smart autofill that paints the entire picture with harmonic colors.
  - **↩️ Undo**: Easily step back if a color was placed by mistake.
  - **📸 Save Artwork**: Download the colored masterpiece directly as an image file.
  - **Celebration Popup**: Automatically triggers **ONLY when 100% of parts are colored**, accompanied by confetti, cheering fanfare, and encouraging voice praise (*"वाह! आपने पूरा चित्र बहुत सुंदर रंग दिया!"*).
* **✨ Magic Glow Slate Mode (जादुई स्लेट)**:
  - **3 Drawing Tools**: `🖌️ Brush`, `🎨 Stamps/Stickers`, and `🧼 Eraser`.
  - **4 Magical Brush Styles**:
    - 🌟 **Neon Glow**: Vibrant luminous neon trails.
    - 🌈 **Rainbow**: Spectrum shifting colors on every touch stroke.
    - ✨ **Sparkling Stars**: Sparkling star particles trailing behind the stroke.
    - 🫧 **Floating Bubbles**: Colorful floating bubbles expanding as you draw.
  - **8 Glowing Stamps**: ⭐, 💖, 🌸, 🦋, 👑, 🐾, 🎈, ☀️ with pop audio and voice praise.
  - **Brush Size Selector**: Small (5px), Medium (12px), Large (24px).
  - **↩️ Canvas Undo History & 📸 Save PNG**: Full multi-step undo stack and high-res PNG export.

---

### 2. 🎹 Rainbow Animal Piano & Xylophone (संगीत और पियानो)
* **Auto-Landscape Immersion**:
  - Automatically locks screen orientation to landscape upon entry so keys are wide and spacious. Restores portrait upon exit.
* **8 Sampled Grand Piano Keys**:
  - Real sampled Grand Piano audio (`C4.mp3` through `C5.mp3`) with Western Solfège (`Do, Re, Mi, Fa, So, La, Ti, Do`) and Indian Swaras (`सा, रे, ग, म, प, ध, नि, सां`).
* **4 Fun Sound Modes**:
  - 🎹 **Classic Grand Piano**: Sampled acoustic grand piano.
  - 🐱 **Cat Choir ("Meow")**: Playful cat choir notes.
  - 🐶 **Puppy Dog ("Woof")**: Energetic puppy barks.
  - 🦆 **Duckie ("Quack")**: Bouncy duck quack tones.
* **Dual-Mode Song Tutor (6 Nursery Rhymes)**:
  - 🎧 **"Demo सुनो (Auto)" Mode**: The piano plays the melody automatically with glowing keys.
  - 🎹 **"अब आप बजाओ (Play Along)" Mode**: Interactive play-along tutor where each correct key glows with an animated star.
  - Songs included: *"Twinkle Twinkle Little Star"*, *"Mary Had a Little Lamb"*, *"Row Row Row Your Boat"*, *"Old MacDonald Had a Farm"*, *"Jingle Bells"*, and *"Happy Birthday to You"*.

---

### 3. 🔤 ABCD Alphabet Safari (अल्फाबेट सफारी)
* **Full A to Z Explorer**:
  - 26 chunky candy cards featuring uppercase & lowercase letters, phonics sounds, and animal illustrations.
  - **Real Voice Audio**: Tapping any letter plays crystal-clear human phonics pronunciation (`/audio/alphabet/A.mp3` - `Z.mp3`).
* **Spotlight Theater**:
  - Highlighting individual letters with rich saturated background gradients, animal animations, and speech audio.
* **Find-the-Letter Quiz ("अक्षर खोजो")**:
  - Friendly voice prompts (*"Can you find the letter B?"*) with positive reinforcement, celebration sounds, star rewards, and a prominent 3D **"Next Question ⏭️"** button.

---

### 4. 🔢 1 2 3 4 Numbers & Counting (संख्या और गिनती)
* **Interactive Numbers 1 to 10**:
  - Vibrant cards with large typography and counting objects.
* **Tap-to-Count Sensory Play**:
  - Tapping each object triggers bounce physics, star sparks, and **real human voice counting** (`/audio/numbers/1.mp3` - `10.mp3`).
* **"How Many?" Counting Quiz**:
  - Visual objects appear on screen, prompting the toddler to tap the matching number card, with a 3D **"Next Question ⏭️"** button to advance freely.

---

### 5. 🕉️ क, ख, ग, घ हिंदी वर्णमाला (Hindi Varnamala)
* **Complete Hindi Swar, Vyanjan & Samyuktakshar**:
  - **स्वर (Vowels)**: अ से अनार 🍎, आ से आम 🥭, इ से इमली 🌿 ... अं से अंगूर 🍇
  - **व्यंजन (Consonants)**: क से कबूतर 🕊️, ख से खरगोश 🐇, ग से गमला 🪴 ... ह से हाथी 🐘
  - **संयुक्त व्यंजन (Joint Consonants)**: **क्ष से क्षत्रिय ⚔️**, **त्र से त्रिशूल 🔱**, **ज्ञ से ज्ञानी 📜**
* **Dedicated Filter Pills**:
  - `सभी अक्षर (All)`, `🍎 स्वर (Swar)`, `🕊️ व्यंजन (Vyanjan)`, and `⚔️ संयुक्त (क्ष, त्र, ज्ञ)`.
* **Authentic Studio Voice Clips**:
  - Dedicated studio audio clips (`public/audio/hindi/`) for 100% reliable offline pronunciation.
* **अक्षर खोजो क्विज (Interactive Quiz)**:
  - Audio prompts in Hindi (*"खोजो: 'क' कहाँ है?"*) with celebratory cheers and an **"अगला सवाल ⏭️"** progression button.

---

### 6. 🎈 Balloon Pop Burst (गुब्बारे फोड़ो)
* **Physics-based Floating Balloons**:
  - Multi-colored balloons rising gently with number badges and glossy reflections.
* **Realistic Burst Mechanics**:
  - Real balloon burst sound (`/audio/fx/pop.wav`), expanding shockwave rings, flash cores, and clear number speech.

---

### 7. 🧩 2-4 Piece Puzzle Snap (पहेली जोड़ो)
* **Toddler Jigsaw Mechanics**:
  - 2-piece and 4-piece cute cartoon animal puzzles.
  - Magnetic drag-and-drop snapping with satisfying snap audio and tactile feedback.

---

### 8. 🐮 Animal & Vehicle Sounds Matcher (आवाज़ पहचानो)
* **Realistic Soundboard**:
  - Authentic recordings of Dogs, Cats, Cows, Lions, Ducks, Frogs, Horses, Roosters, Sheep, Trains, Car Horns, Sirens, and Bicycle Bells.
* **Audio Ear-Training Quiz**:
  - Listen to the sound and choose the matching creature or vehicle, complete with **"Next Sound ⏭️"** advance button.

---

### 9. 🔶 Shape & Color Sorter (आकार और रंग)
* **Animated Geometric Shapes**:
  - Circles, Squares, Triangles, Stars, Hearts, and Diamonds with smiling cartoon faces.
* **Color Matching Trays**:
  - Drag shapes into matching colored hollow silhouettes.

---

### 10. 🃏 Toddler Memory Match Flip (मेमोरी फ्लिप)
* **Card Matching Pairs**:
  - 4 to 8 card grids designed specifically for toddler working memory.
  - Smooth 3D card-flip animations with peek previews.

---

### 11. 🔡 Picture-Word Rebus Puzzles (चित्र शब्द पहेली)
* **Visual Word Riddles**:
  - Emoji equations (e.g. ☀️ + 👓 = Sunglasses).
  - Letter bank with intuitive tap/drag-to-slot mechanics.
  - Daily Mystery Challenge, Speed Run Blitz (1x, 2x, 3x score multipliers), and Custom Puzzle Builder.

---

## 🎨 Multi-Theme Customization Engine
The app features 6 hand-crafted visual themes switchable anytime via the 🎨 Theme button:
1. 🌙 **Midnight Sky (डिफ़ॉल्ट)**: Deep cosmic navy with glowing purple and indigo accents.
2. 🍭 **Candy Land (कैंडी लैंड)**: Sugary pastel pinks, purples, and warm strawberry clouds.
3. 🌿 **Jungle Safari (जंगल सफारी)**: Lush forest greens, golden sunlight, and earthy tones.
4. ☀️ **Sunshine Play (सनशाइन)**: Bright warm amber, sky blue, and cheerful golden sunshine.
5. 🌊 **Ocean Breeze (समुद्री दुनिया)**: Deep ocean teals, aqua waves, and coral highlights.
6. 🚀 **Space Galaxy (अंतरिक्ष)**: Starlit obsidian violet, nebula magenta, and glowing stars.

---

## 🏰 Central UX & Architecture

### 🎪 Welcome Wonderland Start Portal (100dvh Layout)
- **Top Brand Hero**: 3D jelly floating badge `✨ TODDLER ADVENTURE WORLD ✨` + glowing dual-tone `TODDLER MIND` title + Hindi tagline `⭐ जादुई दुनिया • खेलो, सीखो और मुस्कुराओ! ⭐`.
- **Living Mascot Companion**: Sitting on a fluffy cloud throne (`☁️`) with interactive speech bubble (*"नमस्ते दोस्त! मैं टेडी हूँ, चलो मिलकर खेलें!"*), dynamic colored radiant aura matching the chosen animal, and cheerful waving paw (`👋`).
- **6 Instant 1-Tap Buddy Avatars**: `🧸 Teddy`, `🐶 Puppy`, `🐱 Kitty`, `🐰 Bunny`, `🦁 Lion`, `🐘 Elephant` with real animal voices.
- **Sleek Rainbow Music Halo**: 7-note piano gem arc (`सा, रे, ग, म, प, ध, सां`) for instant musical play.
- **Grand 3D Candy Jelly "TAP TO PLAY!" Button**: Pulsing emerald jelly button with animated ripple waves.
- **Rolling Green Meadow Ground**: Choo-Choo train puffing smoke, hopping frog `🐸`, fluttering butterfly `🦋`, buzzing bee `🐝`, and touch-reactive flowers.
- **Floating Balloons**: Can be popped directly on the home screen!

### 🛡️ Parent Gate & Settings
- Math verification lock prevents accidental changes by toddlers.
- Configurable **Screen Time Limits**: 15 minutes, 30 minutes, 45 minutes, or Unlimited.
- Voice narration toggle and master audio mute.

### 🏰 Toddler Hub
- Responsive 2-column candy card grid with Category Filter Pills:
  - 🌈 **All (11)**
  - ✨ **New Top Hits (5)** (Magic Coloring, Rainbow Piano, ABCD Safari, 123 Counting, क ख ग घ)
  - 🎈 **Fun & Sounds (3)**
  - 🧩 **Puzzles (3)**

---

## 💻 Tech Stack & Engineering

| Technology | Purpose |
| :--- | :--- |
| **Angular 19** | Standalone Components, Signals (`signal`, `computed`), Vite build engine |
| **Capacitor 7** | Cross-platform runtime compiling web app into native Android APK |
| **Capacitor Screen Orientation** | Locks Landscape mode for Rainbow Piano and resets to Portrait |
| **Web Audio API** | Sampled instrument buffers and procedural audio synthesizers |
| **Web Speech API** | Native English and Hindi (`hi-IN`) voice synthesis |
| **HTML5 Canvas** | High-DPI 60fps Neon Glow drawing slate, stamps, and particle sparkle loop |
| **SVG Vector Graphics** | Scalable, high-contrast, resolution-independent cartoon templates |
| **Vanilla SCSS** | Multi-theme system, Glassmorphism, candy gradients, micro-animations |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Android Studio](https://developer.android.com/studio) (for building/running Android APK)

### Installation
```bash
# Clone the repository
git clone https://github.com/prateekquadralyst/rebus-puzzle.git
cd rebus-puzzle

# Install dependencies
npm install
```

### Run Locally in Browser
```bash
# Starts local development server at http://localhost:4200/
npm start
```

### Build for Production
```bash
# Compiles optimized web assets into dist/rebus-puzzle
npm run build
```

---

## 📱 Mobile Android APK Setup

This project is configured with **Capacitor** to build native Android APKs.

### One-Command Build & Launch
We have created a dedicated npm script that compiles the Angular app, syncs native assets, compiles the Android debug APK, and opens Android Studio:

```bash
npm run android
```

### Pre-built APK Location
After running the build command, the compiled debug APK is located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
You can transfer this `.apk` directly to any Android tablet or phone to install and test.

---

## 🎨 Asset Generation
The app includes high-resolution 3D launcher icons and splash screens automatically generated for all Android display densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) using:
```bash
python3 scripts/generate_assets.py
```

---

## 📂 Project Structure
```
rebus-puzzle/
├── android/                         # Native Android project (Capacitor)
│   └── app/build/outputs/apk/debug/ # Compiled debug APK
├── scripts/
│   └── generate_assets.py           # Script to generate Android launcher icons & splash
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── games/
│   │   │   │   ├── magic-coloring.component.ts   # 🎨 11 Templates, Auto-Fill, Stamps, Brushes
│   │   │   │   ├── animal-piano.component.ts     # 🎹 Landscape Piano & Song Tutor
│   │   │   │   ├── alphabet-safari.component.ts  # 🔤 A-Z Letters & Voice Phonics
│   │   │   │   ├── number-counting.component.ts  # 🔢 1-10 Counting & Speech Quiz
│   │   │   │   ├── hindi-varnamala.component.ts  # 🕉️ Swar, Vyanjan, क्ष त्र ज्ञ & Speech
│   │   │   │   ├── balloon-pop.component.ts      # 🎈 Balloon Pop Game
│   │   │   │   ├── piece-puzzle.component.ts     # 🧩 2-4 Piece Snap Puzzle
│   │   │   │   ├── sound-matcher.component.ts    # 🐮 Animal Sounds Matcher
│   │   │   │   ├── shape-sorter.component.ts     # 🔶 Shape & Color Sorter
│   │   │   │   └── memory-flip.component.ts      # 🃏 Memory Card Flip
│   │   │   ├── hub/
│   │   │   │   └── toddler-hub.component.ts      # 🏰 Categorized Game Selection Hub
│   │   │   ├── start-portal/
│   │   │   │   └── start-portal.component.ts     # 🎪 100dvh Wonderland & Mascot Island
│   │   │   └── modals/                           # Theme Selector & Parent Gate Modals
│   │   ├── core/
│   │   │   └── services/
│   │   │       ├── sound.service.ts              # 🔊 Real Grand Piano & Animal Audio
│   │   │       ├── speech.service.ts             # 🗣️ English & Hindi voice engine
│   │   │       ├── theme.service.ts              # 🎨 6-Theme Palette Manager
│   │   │       ├── app-nav.service.ts            # 🧭 Seamless app screen router
│   │   │       └── confetti.service.ts           # 🎊 Canvas confetti particle engine
│   │   ├── app.ts                                # Root component & keyboard bindings
│   │   └── app.html                              # Root dynamic screen router
│   ├── styles.scss                               # Global theme CSS variables & reset
│   └── index.html                                # App shell & Google Fonts
├── capacitor.config.json                         # Capacitor configuration
└── package.json                                  # Scripts and dependencies
```

---

## 💖 Designed for Little Learners
- **No Ads, No Third-Party Tracking**: Completely safe environment for toddlers.
- **Large Touch Targets**: Chunky candy buttons designed for tiny fingers.
- **Encouraging Audio Feedback**: Positive reinforcement on every action promotes confidence and cognitive curiosity.
