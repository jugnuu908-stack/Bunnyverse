export const heroRoles = [
  "Jung Kook Fangirl Forever 🐰",
  "GOLDEN Era Collector ✨",
  "Purple Heart Distributor 💌",
  "BTS Choreo Student 💃",
  "Borahae Believer 💜",
];

/* ---------------- JK MOMENTS gallery categories (the solar system) ---------------- */

export const projects = [
  {
    emoji: "🎤",
    title: "On Stage",
    desc: "Concert stages, mic in hand, and purple oceans stretching to the horizon.",
    tags: ["Photo Wall", "Stage", "Add Photos"],
    gradient: "from-violet-600 to-fuchsia-500",
    prompt: "Pick your favorite JK stage and watch it twice in a row. Minimum twice.",
  },
  {
    emoji: "☕",
    title: "Off Stage",
    desc: "The soft, off-duty moments between eras — airport fits, studio clips, and cozy selca energy.",
    tags: ["Photo Wall", "Soft Hours", "Add Photos"],
    gradient: "from-fuchsia-600 to-pink-500",
    prompt: "Find one cozy off-stage clip and keep it safe in your heart pocket.",
  },
  {
    emoji: "✨",
    title: "GOLDEN",
    desc: "Everything from the golden era of his solo — album visuals, concept photos, and that 2023 shine.",
    tags: ["Photo Wall", "GOLDEN", "Add Photos"],
    gradient: "from-purple-600 to-violet-500",
    prompt: "Replay the GOLDEN Live On Stage and try not to cry. Spoiler: you will.",
  },
  {
    emoji: "🎧",
    title: "Music",
    desc: "Studio moments, lyric pages, and that voice doing things science cannot explain.",
    tags: ["Photo Wall", "Music", "Add Photos"],
    gradient: "from-pink-600 to-rose-500",
    prompt: "Queue your top 3 JK songs and send them to someone who needs a little joy.",
  },
  {
    emoji: "🧥",
    title: "Fashion",
    desc: "The outfits that rewired my brain chemistry and emptied my pinterest boards.",
    tags: ["Photo Wall", "Fashion", "Add Photos"],
    gradient: "from-indigo-600 to-purple-500",
    prompt: "Pick one JK outfit you'd steal for your own wardrobe. No judgment here.",
  },
  {
    emoji: "😆",
    title: "Funny Moments",
    desc: "The compilations I watch when I need serotonin. Laughing JK is a national treasure.",
    tags: ["Photo Wall", "Serotonin", "Add Photos"],
    gradient: "from-fuchsia-500 to-violet-600",
    prompt: "Watch JK laughing compilations until your face physically hurts. It will.",
  },
];

/* ---------------- THE VERIFIED PLAYLIST (official, embeddable YouTube) ----------------
   Every videoId below was verified through YouTube's oEmbed endpoint or
   confirmed official channel uploads. Broken / unembeddable / unofficial
   tracks were removed — quality over quantity. */

export interface JkSong {
  title: string;
  artist: string;
  videoId: string;
}

export const jkSongs: JkSong[] = [
  // ---- JUNG KOOK (9 verified) ----
  { title: "Standing Next to You", artist: "Jung Kook", videoId: "UNo0TG9LwwI" },
  { title: "Seven (feat. Latto)", artist: "Jung Kook", videoId: "QU9c0053UAU" },
  { title: "3D (feat. Jack Harlow)", artist: "Jung Kook", videoId: "mHNCM-YALSA" },
  { title: "Never Let Go", artist: "Jung Kook", videoId: "M5kkbesUmZ4" },
  { title: "Still With You", artist: "Jung Kook", videoId: "BksBNbTIoPE" },
  { title: "Euphoria", artist: "Jung Kook", videoId: "kX0vO4vlJuU" },
  { title: "Dreamers", artist: "Jung Kook", videoId: "IwzkfMmNMpM" },
  { title: "Left and Right", artist: "Charlie Puth & Jung Kook", videoId: "a7GITgqwDVg" },
  { title: "Hate You", artist: "Jung Kook", videoId: "D1cEMLGvAQk" },
  // ---- BLACKPINK (7 verified) ----
  { title: "DDU-DU DDU-DU", artist: "BLACKPINK", videoId: "IHNzOHi8sJs" },
  { title: "Kill This Love", artist: "BLACKPINK", videoId: "2S24-y0Ij3Y" },
  { title: "How You Like That", artist: "BLACKPINK", videoId: "ioNng23DkIM" },
  { title: "Lovesick Girls", artist: "BLACKPINK", videoId: "dyRsYk0LyA8" },
  { title: "Pink Venom", artist: "BLACKPINK", videoId: "gQlMMD8auMs" },
  { title: "Shut Down", artist: "BLACKPINK", videoId: "POe9SOEKotk" },
  { title: "Playing With Fire", artist: "BLACKPINK", videoId: "9pdj4iJD08s" },
  // ---- LISA (2 verified) ----
  { title: "MONEY", artist: "LISA", videoId: "dNCWe_6HAM8" },
  { title: "ROCKSTAR", artist: "LISA", videoId: "hbcGx4MGUMg" },
];

/* ---------------- OFFICIAL JUNG KOOK CATALOG (YouTube listening) ---------------- */

export const jkCatalog = [
  { title: "Seven (feat. Latto)", note: "GOLDEN · 2023", yt: "QU9c0053UAU" },
  { title: "3D (feat. Jack Harlow)", note: "GOLDEN · 2023", yt: "XpDEEnZQxNU" },
  { title: "Standing Next to You", note: "GOLDEN · 2023", yt: "M_EpTvMOnT0" },
  { title: "Yes or No", note: "GOLDEN · 2023", yt: null },
  { title: "Hate You", note: "GOLDEN · 2023", yt: null },
  { title: "Shot Glass of Tears", note: "GOLDEN · 2023", yt: null },
  { title: "Somebody", note: "GOLDEN · 2023", yt: null },
  { title: "Closer to You (feat. Major Lazer)", note: "GOLDEN · 2023", yt: null },
  { title: "Please Don't Change (feat. DJ Snake)", note: "GOLDEN · 2023", yt: null },
  { title: "Too Sad to Dance", note: "GOLDEN · 2023", yt: null },
  { title: "Still With You", note: "Fan release · 2020", yt: null },
  { title: "My You", note: "Fan song · 2022", yt: null },
  { title: "Dreamers (feat. Fahad Al Kubaisi)", note: "FIFA World Cup · 2022", yt: null },
  { title: "Never Let Go", note: "Fan song · 2024", yt: "M5kkbesUmZ4" },
  { title: "Stay Alive (Prod. SUGA)", note: "Webtoon OST · 2022", yt: null },
  { title: "Euphoria", note: "Love Yourself: Answer · 2018", yt: null },
  { title: "My Time", note: "MAP OF THE SOUL: 7 · 2020", yt: null },
  { title: "Begin", note: "WINGS · 2016", yt: null },
  { title: "Left and Right (with Charlie Puth)", note: "Single · 2022", yt: null },
];

/* ---------------- QUICK FACTS (flip cards) ---------------- */

export const jkFacts = [
  { emoji: "🎂", label: "Born", value: "September 1, 1997" },
  { emoji: "📍", label: "Birthplace", value: "Busan, South Korea" },
  { emoji: "🐣", label: "In BTS", value: "Youngest member" },
  { emoji: "👑", label: "Nickname", value: "Golden Maknae" },
  { emoji: "🐇", label: "BT21", value: "Cooky" },
  { emoji: "💿", label: "Solo album", value: "GOLDEN" },
  { emoji: "🏆", label: "First solo Hot 100 No. 1", value: "Seven" },
  { emoji: "💌", label: "Fan song", value: "Never Let Go" },
];

/* ---------------- REAL JK QUOTES ---------------- */

export const jkQuotes = [
  {
    text: "Effort makes you. You will regret someday if you don't do your best now. So practice.",
    by: "— Jung Kook",
  },
  {
    text: "I'd rather die than to live without passion.",
    by: "— Jung Kook",
  },
];

/* ---------------- JK SONG QUIZ ---------------- */

export const quizQuestions = [
  {
    q: "Which song is from GOLDEN?",
    options: ["Euphoria", "Seven", "My Time", "Dreamers"],
    answer: 1,
  },
  {
    q: "Which BT21 character is associated with Jung Kook?",
    options: ["Chimmy", "Koya", "Cooky", "Mang"],
    answer: 2,
  },
  {
    q: "Which song features Latto?",
    options: ["3D", "Seven", "Dreamers", "Stay Alive"],
    answer: 1,
  },
  {
    q: "Which song was released as a special fan gift?",
    options: ["Never Let Go", "Shot Glass of Tears", "Begin", "3D"],
    answer: 0,
  },
  {
    q: "Which year did Jung Kook debut with BTS?",
    options: ["2012", "2013", "2014", "2015"],
    answer: 1,
  },
  {
    q: "Where was Jung Kook born?",
    options: ["Seoul", "Daegu", "Busan", "Gwangju"],
    answer: 2,
  },
  {
    q: "What is Jung Kook's solo album called?",
    options: ["EUPHORIA", "SEVEN", "GOLDEN", "STILL WITH YOU"],
    answer: 2,
  },
];

export function quizRank(score: number, total: number) {
  const pct = score / total;
  if (pct >= 0.9) return { title: "GOLDEN LEVEL 🏆", msg: "Flawless. You know this golden maknae like the back of your hand." };
  if (pct >= 0.7) return { title: "CERTIFIED JK FAN 💜", msg: "Seriously good. Your JK knowledge is officially certified." };
  if (pct >= 0.5) return { title: "YOU'RE GETTING THERE 🐰", msg: "Solid effort! A few more loops of the discography and you're golden." };
  return { title: "TIME FOR ANOTHER JK MARATHON 🎧", msg: "No worries — grab headphones and hit play. We've all been there." };
}

export function popRank(score: number) {
  if (score >= 400) return { title: "GOLDEN CATCHER 🏆", msg: "Jung Kook-level reflexes. Absolutely golden!" };
  if (score >= 250) return { title: "STAR SPEEDSTER ✨", msg: "Your hands move faster than the GOLDEN era hype train!" };
  if (score >= 120) return { title: "RISING STAR 🌟", msg: "Not bad! Keep catching those golden stars." };
  return { title: "WARM-UP MODE 🫧", msg: "The golden stars escaped! One more round?" };
}
