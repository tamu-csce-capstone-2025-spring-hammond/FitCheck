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

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OOTDCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const gridDays = Array.from({ length: startDay + daysInMonth }, (_, i) => {
    const day = i - startDay + 1;
    return day > 0 ? new Date(currentYear, currentMonth, day) : null;
  });

  const getOutfitForDate = (dateStr: string) =>
    mockOutfits.find((o) => o.date === dateStr);

  const handleMonthChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentYear, currentMonth + (direction === "next" ? 1 : -1));
    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());
  };

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      {/* Month Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleMonthChange("prev")}
          className="text-gray-500 hover:text-black"
        >
          ←
        </button>
        <h2 className="">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => handleMonthChange("next")}
          className="text-gray-500 hover:text-black"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="w-full grid grid-cols-7 gap-2 p-4 bg-gray-50 rounded-xl shadow">
        {dayLabels.map((d) => (
          <div key={d} className="text-center font-bold text-gray-500">
            {d}
          </div>
        ))}

        {gridDays.map((date, idx) => {
          const dateStr = date?.toISOString().split("T")[0];
          const outfit = date ? getOutfitForDate(dateStr!) : null;

          return (
            <div
              key={idx}
              className="aspect-square border border-gray-200 rounded-lg bg-white hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center text-lg relative"
              onClick={() => date && setSelectedDate(dateStr!)}
            >
              {date && (
                <>
                  <span className="mb-1 absolute top-4 right-6">
                    {date.getDate()}
                  </span>
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
    </div>
  );
}
