import { useEffect, useState } from "react";
import splash from "@/assets/splash.png.asset.json";

export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "done">("show");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade"), 2500);
    const t2 = setTimeout(() => setPhase("done"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[1000000] flex items-center justify-center bg-[oklch(0_0_0)] transition-opacity duration-500 select-none ${phase === "fade" ? "opacity-0" : "opacity-100"}`}
      aria-label="Caption Craze — Created by Piyush KP"
      role="img"
    >
      <img src={splash.url} alt="Caption Craze by Piyush KP" className="h-full w-full max-w-md object-contain" />
    </div>
  );
}

export default SplashScreen;
