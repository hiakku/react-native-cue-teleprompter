export type Script = {
  id: string;
  title: string;
  body: string;
  starred: boolean;
  updatedAt: string;
};
export type Preferences = {
  wpm: number;
  fontSize: number;
  mirror: boolean;
  countdown: boolean;
};
export const DEFAULT_PREFERENCES: Preferences = {
  wpm: 130,
  fontSize: 40,
  mirror: false,
  countdown: true,
};
export function words(body: string): number {
  return body.trim() ? body.trim().split(/\s+/u).length : 0;
}
export function duration(count: number, wpm: number): string {
  const seconds = Math.ceil((count / wpm) * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export function parseLibrary(raw: string): {
  scripts: Script[];
  preferences: Preferences;
} {
  const value = JSON.parse(raw);
  if (
    value?.version !== 1 ||
    !Array.isArray(value.scripts) ||
    !value.scripts.every(
      (x: Script) =>
        x &&
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        typeof x.body === "string" &&
        typeof x.starred === "boolean" &&
        typeof x.updatedAt === "string" &&
        Number.isFinite(Date.parse(x.updatedAt)),
    )
  )
    throw new Error("Invalid library");
  const p = value.preferences;
  if (
    !p ||
    !Number.isFinite(p.wpm) ||
    p.wpm < 60 ||
    p.wpm > 240 ||
    !Number.isFinite(p.fontSize) ||
    p.fontSize < 24 ||
    p.fontSize > 64 ||
    typeof p.mirror !== "boolean" ||
    typeof p.countdown !== "boolean"
  )
    throw new Error("Invalid preferences");
  return { scripts: value.scripts, preferences: p };
}
const created = new Date().toISOString();
export const INITIAL_SCRIPTS: Script[] = [
  {
    id: "welcome",
    title: "Your first take",
    starred: true,
    updatedAt: created,
    body: "Hey there. Welcome to Cue.\n\nTake a breath. Relax your shoulders. There’s no rush.\n\nThis is your space to practise, prepare, and say what you really mean. You don’t need to memorise every word. Just find a pace that feels like you.\n\nTap the play button below and let the words come to you. You can change the speed, make the text bigger, or mirror it for your teleprompter setup.\n\nIf you lose your place, pause and swipe back. A great take doesn’t have to be a perfect take.\n\nLook up. Be yourself. You’ve got this.",
  },
  {
    id: "intro",
    title: "A little introduction",
    starred: false,
    updatedAt: created,
    body: "Hi, I’m [your name], and I’m glad you’re here.\n\nI started this channel because I believe that the things we’re curious about are worth sharing.\n\nHere, you’ll find [your topic], a few things I’ve learned along the way, and an honest look at the process.\n\nWhether you’re just getting started or have been at it for years, there’s a place for you here.\n\nThanks for being part of the beginning. Let’s make something good.",
  },
  {
    id: "story",
    title: "Tell your story",
    starred: false,
    updatedAt: created,
    body: "There’s a moment I keep coming back to.\n\n[Describe a small moment that changed the way you thought about something.]\n\nAt the time, I didn’t realise how much it would matter. But looking back, that was the beginning of something different.\n\nHere’s what I learned.\n\n[Share your lesson in a few clear sentences.]\n\nIf you’re in a similar place right now, I hope this helps you take that next small step.",
  },
];
