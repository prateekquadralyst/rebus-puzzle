import { Puzzle } from '../models/puzzle.model';

export const REBUS_PUZZLES: Puzzle[] = [
  // ==========================================
  // 🟢 EASY MODE (2 Direct Picture Clues)
  // ==========================================
  {
    id: 'easy_01',
    difficulty: 'easy',
    category: 'Marine & Nature',
    answer: 'STARFISH',
    hintText: 'A marine creature with arms shaped like a celestial object',
    points: 100,
    explanation: '⭐ STAR + 🐟 FISH = STARFISH!',
    images: [
      { emoji: '⭐', alt: 'Star', label: 'STAR' },
      { emoji: '🐟', alt: 'Fish', label: 'FISH' }
    ]
  },
  {
    id: 'easy_02',
    difficulty: 'easy',
    category: 'Sweets & Treats',
    answer: 'CUPCAKE',
    hintText: 'A sweet individual dessert baked in a small cup-shaped container',
    points: 100,
    explanation: '☕ CUP + 🎂 CAKE = CUPCAKE!',
    images: [
      { emoji: '☕', alt: 'Cup', label: 'CUP' },
      { emoji: '🎂', alt: 'Cake', label: 'CAKE' }
    ]
  },
  {
    id: 'easy_03',
    difficulty: 'easy',
    category: 'Sky & Weather',
    answer: 'RAINBOW',
    hintText: 'A spectrum of light appearing in the sky after a rain shower',
    points: 100,
    explanation: '🌧️ RAIN + 🏹 BOW = RAINBOW!',
    images: [
      { emoji: '🌧️', alt: 'Rain', label: 'RAIN' },
      { emoji: '🏹', alt: 'Bow', label: 'BOW' }
    ]
  },
  {
    id: 'easy_04',
    difficulty: 'easy',
    category: 'Flora & Sunlight',
    answer: 'SUNFLOWER',
    hintText: 'A tall plant with large golden petals that tracks the sun',
    points: 100,
    explanation: '☀️ SUN + 🌸 FLOWER = SUNFLOWER!',
    images: [
      { emoji: '☀️', alt: 'Sun', label: 'SUN' },
      { emoji: '🌸', alt: 'Flower', label: 'FLOWER' }
    ]
  },
  {
    id: 'easy_05',
    difficulty: 'easy',
    category: 'Breakfast Food',
    answer: 'PANCAKE',
    hintText: 'A flat, round batter cake fried on a griddle with syrup',
    points: 100,
    explanation: '🍳 PAN + 🍰 CAKE = PANCAKE!',
    images: [
      { emoji: '🍳', alt: 'Pan', label: 'PAN' },
      { emoji: '🍰', alt: 'Cake', label: 'CAKE' }
    ]
  },
  {
    id: 'easy_06',
    difficulty: 'easy',
    category: 'Insects',
    answer: 'FIREFLY',
    hintText: 'A beetle whose abdomen glows with bioluminescent light at night',
    points: 100,
    explanation: '🔥 FIRE + 🪰 FLY = FIREFLY!',
    images: [
      { emoji: '🔥', alt: 'Fire', label: 'FIRE' },
      { emoji: '🪰', alt: 'Fly', label: 'FLY' }
    ]
  },
  {
    id: 'easy_07',
    difficulty: 'easy',
    category: 'Summer Treats',
    answer: 'ICECREAM',
    hintText: 'A frozen sweetened dairy dessert served in scoops or cones',
    points: 100,
    explanation: '🧊 ICE + 🥛 CREAM = ICECREAM!',
    images: [
      { emoji: '🧊', alt: 'Ice', label: 'ICE' },
      { emoji: '🥛', alt: 'Cream', label: 'CREAM' }
    ]
  },
  {
    id: 'easy_08',
    difficulty: 'easy',
    category: 'Everyday Objects',
    answer: 'FOOTBALL',
    hintText: 'A popular team sport played with a spherical or oval ball',
    points: 100,
    explanation: '🦶 FOOT + ⚽ BALL = FOOTBALL!',
    images: [
      { emoji: '🦶', alt: 'Foot', label: 'FOOT' },
      { emoji: '⚽', alt: 'Ball', label: 'BALL' }
    ]
  },

  // ==========================================
  // 🟡 MEDIUM MODE (Clever Concept & Idiom Puzzles)
  // ==========================================
  {
    id: 'med_01',
    difficulty: 'medium',
    category: 'Decisions & Paths',
    answer: 'CROSSROADS',
    hintText: 'A crucial intersection where two roads meet, representing an important choice in life',
    points: 200,
    explanation: '❌ CROSS + 🛣️ ROAD = CROSSROADS!',
    images: [
      { emoji: '❌', alt: 'Cross', label: 'CROSS' },
      { emoji: '🛣️', alt: 'Road', label: 'ROAD' }
    ]
  },
  {
    id: 'med_02',
    difficulty: 'medium',
    category: 'Avid Readers',
    answer: 'BOOKWORM',
    hintText: 'A metaphor for someone who is passionately devoted to reading literature',
    points: 200,
    explanation: '📚 BOOK + 🐛 WORM = BOOKWORM!',
    images: [
      { emoji: '📚', alt: 'Books', label: 'BOOK' },
      { emoji: '🐛', alt: 'Worm', label: 'WORM' }
    ]
  },
  {
    id: 'med_03',
    difficulty: 'medium',
    category: 'Technology & Typing',
    answer: 'KEYBOARD',
    hintText: 'The essential input device equipped with keys used to type commands into a computer',
    points: 200,
    explanation: '🔑 KEY + 🛹 BOARD = KEYBOARD!',
    images: [
      { emoji: '🔑', alt: 'Key', label: 'KEY' },
      { emoji: '🛹', alt: 'Board', label: 'BOARD' }
    ]
  },
  {
    id: 'med_04',
    difficulty: 'medium',
    category: 'Cyber Security',
    answer: 'FIREWALL',
    hintText: 'A digital barrier system designed to protect internal computer networks from cyber threats',
    points: 250,
    explanation: '🔥 FIRE + 🧱 WALL = FIREWALL!',
    images: [
      { emoji: '🔥', alt: 'Fire', label: 'FIRE' },
      { emoji: '🧱', alt: 'Wall', label: 'WALL' }
    ]
  },
  {
    id: 'med_05',
    difficulty: 'medium',
    category: 'Mind & Riddles (3 Clues)',
    answer: 'BRAINTEASER',
    hintText: 'An intricate problem, puzzle, or enigma created to challenge and exercise intellect',
    points: 250,
    explanation: '🧠 BRAIN + ☕ TEA + ✂️ SIR/TEASER = BRAINTEASER!',
    images: [
      { emoji: '🧠', alt: 'Brain', label: 'BRAIN' },
      { emoji: '☕', alt: 'Tea', label: 'TEA' },
      { emoji: '✂️', alt: 'Scissors', label: 'TEASER' }
    ]
  },
  {
    id: 'med_06',
    difficulty: 'medium',
    category: 'Love & Affection',
    answer: 'SWEETHEART',
    hintText: 'An affectionate endearment for a dearly beloved, trusted companion',
    points: 250,
    explanation: '🍬 SWEET + ❤️ HEART = SWEETHEART!',
    images: [
      { emoji: '🍬', alt: 'Candy', label: 'SWEET' },
      { emoji: '❤️', alt: 'Heart', label: 'HEART' }
    ]
  },
  {
    id: 'med_07',
    difficulty: 'medium',
    category: 'Dreams & Midnight (3 Clues)',
    answer: 'NIGHTMARE',
    hintText: 'A deeply distressing and frightening nocturnal dream during deep sleep',
    points: 250,
    explanation: '🌙 NIGHT + 🐴 MARE + 😱 SCARE = NIGHTMARE!',
    images: [
      { emoji: '🌙', alt: 'Night', label: 'NIGHT' },
      { emoji: '🐴', alt: 'Mare/Horse', label: 'MARE' },
      { emoji: '😱', alt: 'Scare', label: 'FEAR' }
    ]
  },
  {
    id: 'med_08',
    difficulty: 'medium',
    category: 'Forces of Nature (3 Clues)',
    answer: 'EARTHQUAKE',
    hintText: 'A sudden, intense vibration and trembling of the planetary crust along tectonic faults',
    points: 300,
    explanation: '🌍 EARTH + 🫨 QUAKE + ⚡ SHOCK = EARTHQUAKE!',
    images: [
      { emoji: '🌍', alt: 'Earth', label: 'EARTH' },
      { emoji: '🫨', alt: 'Shake', label: 'QUAKE' },
      { emoji: '⚡', alt: 'Fault', label: 'TREMOR' }
    ]
  },

  // ==========================================
  // 🔴 HARD MODE (Multi-Clue, Cryptic, Idioms & Abstract)
  // ==========================================
  {
    id: 'hard_01',
    difficulty: 'hard',
    category: 'Cognition & Wisdom (3 Clues)',
    answer: 'UNDERSTAND',
    hintText: 'To perceive the deeper intent, philosophy, or mathematical logic behind an idea',
    points: 350,
    explanation: '⬇️ UNDER + 🧍 STAND + 💡 GRASP = UNDERSTAND!',
    images: [
      { emoji: '⬇️', alt: 'Down/Under', label: 'UNDER' },
      { emoji: '🧍', alt: 'Person Standing', label: 'STAND' },
      { emoji: '💡', alt: 'Insight', label: 'INSIGHT' }
    ]
  },
  {
    id: 'hard_02',
    difficulty: 'hard',
    category: 'Famous Proverbs (3 Clues)',
    answer: 'TIMEFLIES',
    hintText: 'Ancient philosophical proverb expressing how swiftly moments pass when absorbed in joy',
    points: 350,
    explanation: '⏳ TIME + 🪰 FLIES + 💨 SPEED = TIMEFLIES!',
    images: [
      { emoji: '⏳', alt: 'Hourglass', label: 'TIME' },
      { emoji: '🪰', alt: 'Flies', label: 'FLIES' },
      { emoji: '💨', alt: 'Fast', label: 'SWIFT' }
    ]
  },
  {
    id: 'hard_03',
    difficulty: 'hard',
    category: 'Astrophysics (4 Clues)',
    answer: 'BLACKHOLE',
    hintText: 'A cosmic gravitational singularity in space where escape velocity exceeds the speed of light',
    points: 400,
    explanation: '⬛ BLACK + 🕳️ HOLE + 🌌 COSMOS + 🧲 GRAVITY = BLACKHOLE!',
    images: [
      { emoji: '⬛', alt: 'Black', label: 'DARK' },
      { emoji: '🕳️', alt: 'Hole', label: 'VOID' },
      { emoji: '🌌', alt: 'Galaxy', label: 'SPACE' },
      { emoji: '🧲', alt: 'Gravity', label: 'PULL' }
    ]
  },
  {
    id: 'hard_04',
    difficulty: 'hard',
    category: 'Global Economics (3 Clues)',
    answer: 'BRAINDRAIN',
    hintText: 'The sociological departure and emigration of a nation\'s most skilled thinkers and scientists',
    points: 400,
    explanation: '🧠 BRAIN + 🚰 DRAIN + ✈️ EMIGRATE = BRAINDRAIN!',
    images: [
      { emoji: '🧠', alt: 'Mind', label: 'TALENT' },
      { emoji: '🚰', alt: 'Drain', label: 'DRAIN' },
      { emoji: '✈️', alt: 'Flight', label: 'EXODUS' }
    ]
  },
  {
    id: 'hard_05',
    difficulty: 'hard',
    category: 'Stellar Cataclysms (4 Clues)',
    answer: 'SUPERNOVA',
    hintText: 'A stupendous stellar explosion of a collapsing massive star that briefly outshines an entire galaxy',
    points: 450,
    explanation: '🦸 SUPER + 🌟 NOVA + 💥 EXPLOSION + 🔭 ASTRONOMY = SUPERNOVA!',
    images: [
      { emoji: '🦸', alt: 'Super Hero', label: 'SUPER' },
      { emoji: '🌟', alt: 'Bright Star', label: 'NOVA' },
      { emoji: '💥', alt: 'Blast', label: 'BURST' },
      { emoji: '🔭', alt: 'Telescope', label: 'STELLAR' }
    ]
  },
  {
    id: 'hard_06',
    difficulty: 'hard',
    category: 'Behavioral Idioms (3 Clues)',
    answer: 'COLDFEET',
    hintText: 'An idiom describing sudden hesitation, loss of nerve, or reluctance at the decisive moment',
    points: 350,
    explanation: '❄️ COLD + 🦶 FEET + 😰 ANXIETY = COLDFEET!',
    images: [
      { emoji: '❄️', alt: 'Ice', label: 'FROST' },
      { emoji: '🦶', alt: 'Feet', label: 'STEPS' },
      { emoji: '😰', alt: 'Nervous', label: 'DREAD' }
    ]
  },
  {
    id: 'hard_07',
    difficulty: 'hard',
    category: 'Effortless Feats (3 Clues)',
    answer: 'CAKEWALK',
    hintText: 'An idiomatic phrase for an achievement or challenge that is conquered with effortless ease',
    points: 350,
    explanation: '🍰 CAKE + 🚶 WALK + 🥇 TRIUMPH = CAKEWALK!',
    images: [
      { emoji: '🍰', alt: 'Cake', label: 'SWEET' },
      { emoji: '🚶', alt: 'Walk', label: 'STRIDE' },
      { emoji: '🥇', alt: 'Gold Medal', label: 'VICTORY' }
    ]
  },
  {
    id: 'hard_08',
    difficulty: 'hard',
    category: 'Storms & Mythology (4 Clues)',
    answer: 'THUNDERBOLT',
    hintText: 'A flash of lightning accompanied by a deafening clap of thunder, symbolic weapon of ancient sky gods',
    points: 500,
    explanation: '⚡ THUNDER + 🔩 BOLT + ⛈️ TEMPEST + 🏛️ MYTH = THUNDERBOLT!',
    images: [
      { emoji: '⚡', alt: 'Lightning', label: 'FLASH' },
      { emoji: '🔩', alt: 'Hardware Bolt', label: 'BOLT' },
      { emoji: '⛈️', alt: 'Storm', label: 'FURY' },
      { emoji: '🏛️', alt: 'Pantheon', label: 'DEITY' }
    ]
  }
];
