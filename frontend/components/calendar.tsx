//ootd-calendar.tsx
import { useState } from "react";
import OOTDModal from "@/components/ootd-modal";
import Image from "next/image";

type Outfit = {
  date: string; 
  thumbnailUrl?: string;
};

const mockOutfits: Outfit[] = [
  { date: "2025-04-03", thumbnailUrl: "/mock-outfit.jpg" },
  { date: "2025-04-07", thumbnailUrl: "/mock-outfit-2.jpg" },
];

export default function OOTDCalendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  const gridDays = Array.from({ length: startDay + daysInMonth }, (_, i) => {
    const day = i - startDay + 1;
    return day > 0 ? new Date(year, month, day) : null;
  });

  const getOutfitForDate = (dateStr: string) =>
    mockOutfits.find((o) => o.date === dateStr);

  return (
    <div className="grid grid-cols-7 gap-2 p-4 bg-gray-50 rounded-xl shadow">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div key={d} className="text-center font-bold text-sm text-gray-500">
          {d}
        </div>
      ))}

      {gridDays.map((date, idx) => {
        const dateStr = date?.toISOString().split("T")[0];
        const outfit = date ? getOutfitForDate(dateStr!) : null;

        return (
          <div
            key={idx}
            className="aspect-square border border-gray-200 rounded-lg bg-white hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center text-xs"
            onClick={() => date && setSelectedDate(dateStr!)}
          >
            {date && (
              <>
                <span className="mb-1 font-medium">{date.getDate()}</span>
                {outfit?.thumbnailUrl && (
                  <Image
                    src={outfit.thumbnailUrl}
                    alt="Outfit"
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                )}
              </>
            )}
          </div>
        );
      })}

      {selectedDate && (
        <OOTDModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
