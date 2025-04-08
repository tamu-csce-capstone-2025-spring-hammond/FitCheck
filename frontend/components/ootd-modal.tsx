// ootd-modal.tx
import { useState } from "react";
import Image from "next/image";
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
      <div className="bg-white rounded-lg p-12 w-full max-w-5xl shadow-lg relative">
        <button className="absolute top-8 right-12 text-gray-500" onClick={onClose}>
          ✕
        </button>

        <h2 className="font-bold mb-4">OOTD for {date}</h2>

        {isEditing ? (
          <OOTDEditForm date={date} onCancel={() => setIsEditing(false)} />
        ) : (
          <div>
            <Image
              src={mockOutfitData.imageUrl}
              alt="Outfit"
              width={1024}
              height={768}
              className="rounded-lg w-full object-cover"
            />
            <div className="">{mockOutfitData.notes}</div>
            <div className="flex flex-wrap justify-start gap-2 mt-4">
              {mockOutfitData.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex justify-center align-center bg-accent-3 text-gray-500 min-w-36 py-1 text-lg"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-8 pt-12 ">
              <button
                onClick={() => setIsEditing(true)}
                className="px-12 py-2 bg-black text-white rounded-lg w-full"
              >
                <p className="text-white rounded-lg">
                Edit
                </p>
              </button>
              <button className="text-heart-red underline">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
