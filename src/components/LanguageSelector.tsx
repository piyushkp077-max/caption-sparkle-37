import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { captionLanguages, type CaptionLanguage } from "@/lib/caption-settings";

export function LanguageSelector({ value, onChange }: { value: CaptionLanguage; onChange: (value: CaptionLanguage) => void }) {
  return <div className="mt-3 flex items-center gap-3">
    <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground"><Languages className="size-4 text-primary" /> Language</span>
    <Select value={value} onValueChange={(next) => { const found = captionLanguages.find((language) => language === next); if (found) onChange(found); }}>
      <SelectTrigger aria-label="Caption language" className="h-10 flex-1 bg-background"><SelectValue /></SelectTrigger>
      <SelectContent className="z-[1000002] max-h-80">{captionLanguages.map((language) => <SelectItem key={language} value={language}>{language === "Hindi" ? "Hindi · हिंदी" : language === "Hinglish" ? "Hinglish · Hindi + English" : language === "Arabic" ? "Arabic · العربية" : language}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}