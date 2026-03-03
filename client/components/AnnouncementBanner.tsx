import React, { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AnnouncementBannerProps {
  className?: string;
}

export default function AnnouncementBanner({
  className = "",
}: AnnouncementBannerProps) {
  const [announcement, setAnnouncement] = useState<{
    id: string;
    message: string;
    link?: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, message, link")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const dismissedKey = `dismissed_announcement_${data.id}`;
        if (!sessionStorage.getItem(dismissedKey)) {
          setAnnouncement(data);
        }
      }
    };
    load();
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`dismissed_announcement_${announcement.id}`, "1");
    setDismissed(true);
  };

  return (
    <div
      className={`bg-hope-red text-white px-4 py-2.5 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm font-medium truncate">
          {announcement.message}
          {announcement.link && (
            <a
              href={announcement.link}
              className="underline ml-2 hover:opacity-80"
            >
              Learn more
            </a>
          )}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
