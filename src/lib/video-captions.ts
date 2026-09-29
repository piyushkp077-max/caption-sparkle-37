import type { AiCaption } from "@/lib/caption-ai.functions";

export const videoCaptions: AiCaption[] = [
  { text: "Main character energy for your reel! 🎬✨", translation: "", hashtags: ["#ReelsViral", "#TrendingReels", "#ExplorePage", "#ViralReels", "#ShortsVideo", "#ReelItFeelIt"] },
  { text: "Kahaani abhi khatam nahi hui, bas ek naya chapter shuru hua hai... 🔥🎥", translation: "The story isn't over yet, a new chapter has just begun.", hashtags: ["#AttitudeReels", "#ReelsIndia", "#DesiSwag", "#StatusVideo", "#ViralContent", "#Trending"] },
  { text: "Slowing down time, capturing moments that feel like art. 🌌✨", translation: "", hashtags: ["#AestheticReels", "#VibesOnly", "#CinematicVideo", "#ChillVibes", "#ReelsInstagram", "#Aesthetic"] },
  { text: "Koshish aisi karo ki harne wala bhi keh sake, kya बात hai! 💪⚡", translation: "Try so hard that even the one who loses says, what a performance!", hashtags: ["#MotivationReels", "#HustleHard", "#SuccessMindset", "#DailyMotivation", "#ViralVideo", "#Goals"] },
  { text: "Stop scrolling! This moment deserved to be on your feed. 🔥👀", translation: "", hashtags: ["#ReelsOfInstagram", "#DailyVibes", "#ExplorePage", "#ViralReels", "#ContentCreator", "#Trending"] },
  { text: "Making memories that last longer than this 15-second reel. ✨💫", translation: "", hashtags: ["#Memories", "#GoodTimes", "#VibeCheck", "#ReelLife", "#Explore", "#ReelsDaily"] },
  { text: "Work hard in silence, let your reels make the noise. 🚀🔥", translation: "", hashtags: ["#Hustle", "#SuccessVibes", "#MotivationDaily", "#ViralReels", "#Swag", "#ReelsIndia"] },
  { text: "Just dropping this masterpiece here, do your magic guys! ❤️🍿", translation: "", hashtags: ["#Masterpiece", "#ViralEdits", "#TrendingNow", "#ReelsExplore", "#ContentDay", "#ReelsStyle"] },
];

export const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
