// ootd-modal.tx
import { useState } from "react";
import OOTDEditForm from "@/components/ootd-edit-form";

type Props = {
  date: string;
  onClose: () => void;
};

const mockOutfitData = {
  imageUrl: "/mock-outfit.jpg",
  notes: "Went for a casual rainy day look 🌧️",
  tags: ["Casual", "Rainy"],
};

export default function OOTDModal({ date, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative">
        <button className="absolute top-2 right-4 text-gray-500" onClick={onClose}>
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4">Outfit for {date}</h2>

        {isEditing ? (
          <OOTDEditForm date={date} onCancel={() => setIsEditing(false)} />
        ) : (
          <div className="space-y-4">
            <img
              src={mockOutfitData.imageUrl}
              alt="Outfit"
              className="rounded-lg w-full object-cover"
            />
            <div className="text-sm text-gray-700">{mockOutfitData.notes}</div>
            <div className="flex flex-wrap gap-2">
              {mockOutfitData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm px-4 py-2 bg-black text-white rounded-xl"
              >
                Edit
              </button>
              <button className="text-sm text-red-500 underline">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
