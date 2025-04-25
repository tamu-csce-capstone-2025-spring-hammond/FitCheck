import { useState, useEffect } from "react";
import OOTDModal from "@/components/ootd-modal";
import Image from "next/image";

interface Outfit {
  date: string;
  outfit_id: number;
  outfit?: {
    s3url?: string;
    name?: string;
  };
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OOTDCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    const fetchWearHistory = async () => {
      try {
        const response = await fetch('/api/outfit_wear_history');
        if (!response.ok) {
          throw new Error('Failed to fetch wear history');
        }
        const data = await response.json();
        console.log('Wear history data:', data);
        setOutfits(data.map((item: any) => ({
          date: new Date(item.date).toISOString().split('T')[0],
          outfit_id: item.outfit_id,
          outfit: item.outfit
        })));
      } catch (error) {
        console.error('Error fetching wear history:', error);
      }
    };

    fetchWearHistory();
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const gridDays = Array.from({ length: startDay + daysInMonth }, (_, i) => {
    const day = i - startDay + 1;
    return day > 0 ? new Date(currentYear, currentMonth, day) : null;
  });

  const getOutfitForDate = (dateStr: string) =>
    outfits.find((o) => o.date === dateStr);

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
          const isToday = dateStr === today.toISOString().split("T")[0];

          return (
            <div
              key={idx}
              className={`aspect-square border border-gray-200 rounded-lg bg-white hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center text-lg relative ${
                isToday ? "border-blue-500" : ""
              }`}
              onClick={() => date && setSelectedDate(dateStr!)}
            >
              {date && (
                <>
                  {outfit?.outfit?.s3url && (
                    <div className="absolute inset-0">
                      <Image
                        src={outfit.outfit.s3url}
                        alt={outfit.outfit.name || "Outfit"}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                  )}
                  <span className="mb-1 absolute top-4 right-6 z-10 text-black font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                    {date.getDate()}
                  </span>
                </>
              )}
            </div>
          );
        })}

        {selectedDate && (
          <OOTDModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
            outfit={getOutfitForDate(selectedDate)?.outfit}
            outfitId={getOutfitForDate(selectedDate)?.outfit_id}
          />
        )}
      </div>
    </div>
  );
}
