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
    <div className="flex flex-col gap-12">
      <h2 className="bold mb-6">Select Platforms to List On</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facebook Option */}
        <div 
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
            selectedPlatforms.includes('facebook') 
              ? 'border-black bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => togglePlatform('facebook')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 relative">
              <Image
                src="/facebook-logo.png"
                alt="Facebook"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold">Facebook Marketplace</h3>
          </div>
          <p className="text-gray-600">
            List your item on Facebook Marketplace to reach local buyers.
          </p>
        </div>

        {/* eBay Option */}
        <div 
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
            selectedPlatforms.includes('ebay') 
              ? 'border-black bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => togglePlatform('ebay')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 relative">
              <Image
                src="/ebay-logo.png"
                alt="eBay"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold">eBay</h3>
          </div>
          <p className="text-gray-600">
            List your item on eBay to reach a global audience of buyers.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-6 items-center justify-center">
        <LightButton text="Back" onClick={onBack} />
        <button
          onClick={() => onContinue(selectedPlatforms)}
          disabled={selectedPlatforms.length === 0}
          className={`title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-2 ${
            selectedPlatforms.length === 0 
              ? 'bold bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bold bg-black text-white hover:text-black hover:bg-accent'
          } rounded-lg text-center`}
        >
        Continue
        </button>
      </div>
    </div>
  );
} 