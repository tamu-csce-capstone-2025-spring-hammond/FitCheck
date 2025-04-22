import { useState } from "react";
import Image from "next/image";
import DarkButton from "./tags-and-buttons/dark-button";
import LightButton from "./tags-and-buttons/light-button";

interface PlatformSelectionProps {
  itemId: string;
  onBack: () => void;
  onContinue: (selectedPlatforms: string[]) => void;
}

export default function PlatformSelection({ itemId, onBack, onContinue }: PlatformSelectionProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-center">Select Platforms to List On</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          {
            name: "facebook",
            title: "Facebook Marketplace",
            description: "List your item on Facebook Marketplace to reach local buyers.",
            image: "/facebook-logo.png",
          },
          {
            name: "ebay",
            title: "eBay",
            description: "List your item on eBay to reach a global audience of buyers.",
            image: "/ebay-logo.png",
          },
        ].map(({ name, title, description, image }) => (
          <div
            key={name}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex flex-col gap-4 hover:shadow-md ${
              selectedPlatforms.includes(name)
                ? "border-black bg-gray-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => togglePlatform(name)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-center justify-center mt-8">
        <LightButton text="Back" onClick={onBack} />
        <button
          onClick={() => onContinue(selectedPlatforms)}
          disabled={selectedPlatforms.length === 0}
          className={`flex justify-center items-center border-2 border-black px-8 py-2 rounded-lg font-semibold transition-all ${
            selectedPlatforms.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-accent hover:text-black"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
