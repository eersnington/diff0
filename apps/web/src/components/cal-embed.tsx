"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    if (!calLink) {
      return;
    }

    async function initializeCalendar() {
      const cal = await getCalApi();

      cal("ui", {
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    }

    initializeCalendar();
  }, [calLink]);

  if (!calLink) {
    return null;
  }

  return (
    <Cal
      calLink={calLink}
      config={{ layout: "month_view", theme: "dark" }}
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
    />
  );
}
