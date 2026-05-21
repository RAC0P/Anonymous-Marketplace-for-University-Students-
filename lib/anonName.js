const ADJECTIVES = [
  'Silent', 'Swift', 'Clever', 'Bright', 'Calm', 'Bold',
  'Fuzzy', 'Cosmic', 'Mystic', 'Neon', 'Turbo', 'Sneaky',
  'Fierce', 'Lucky', 'Wicked', 'Gentle', 'Quirky', 'Zappy',
  'Cobalt', 'Solar', 'Lunar', 'Phantom', 'Blazing', 'Frozen',
];

const ANIMALS = [
  'Owl', 'Fox', 'Bear', 'Wolf', 'Hawk', 'Lynx',
  'Otter', 'Panda', 'Raven', 'Tiger', 'Drake', 'Viper',
  'Moose', 'Bison', 'Gecko', 'Hyena', 'Ibis', 'Kite',
  'Manta', 'Narwhal', 'Quokka', 'Tapir', 'Yak', 'Zebu',
];

const AVATARS = ['🦊', '🐼', '🦉', '🐺', '🦅', '🦁', '🐯', '🦋', '🦈', '🐸', '🦜', '🦔'];

export function generateAnonName() {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num    = Math.floor(Math.random() * 900) + 100; // 3-digit for uniqueness
  return `${adj}${animal}${num}`;
}

export function generateAnonAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
