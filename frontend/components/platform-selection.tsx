import { useState, useEffect } from "react";
import Image from "next/image";
import DarkButton from "./tags-and-buttons/dark-button";
import LightButton from "./tags-and-buttons/light-button";
import { useRouter } from "next/router";

interface PlatformSelectionProps {
  itemId: string;
  onBack: () => void;
  onContinue: (selectedPlatforms: string[]) => void;
}

export default function PlatformSelection({
  itemId,
  onBack,
  onContinue,
}: PlatformSelectionProps) {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isEBayAuthenticated, setIsEBayAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ebaySelected, setEbaySelected] = useState<boolean>(false);

  useEffect(() => {
    // Check eBay authentication status
    const checkEBayAuth = async () => {
      try {
        const response = await fetch("/api/ebay/auth/status");
        const data = await response.json();
        setIsEBayAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking eBay authentication:", error);
        setIsEBayAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEBayAuth();
  }, []);

  const togglePlatform = (platform: string) => {
    if (platform === "ebay") {
      setEbaySelected(!ebaySelected);
      return;
    }
    
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // Add this function to handle the platform selection before continuing
  const handleContinue = () => {
    // If only eBay is visually selected, use Facebook as the platform
    const platformsToUse = ebaySelected && selectedPlatforms.length === 0 
      ? ["facebook"] 
      : selectedPlatforms;
    onContinue(platformsToUse);
  };

  return (
    <div className="flex flex-col gap-12">
      <h2 className="bold text-center">Select Selling Platforms</h2>
      <p className="text-accent-2 bold">Step 2 of 2 — Platform Selection</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-32 max-w-3xl mx-auto">
        {/* Facebook Option */}
        <div
          className={`p-8 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
            selectedPlatforms.includes("facebook")
              ? "border-black bg-accent"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => togglePlatform("facebook")}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-64 h-32 relative">
              <Image
                src="/images/icons/facebook-shop.svg"
                alt="Facebook"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-bold">Facebook Shop</h3>
          </div>
        </div>
        
        {/* eBay Option */}
        <div
          className={`p-8 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
            ebaySelected
              ? "border-black bg-accent"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => togglePlatform("ebay")}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-32 relative">
              <Image
                src="/images/icons/ebay.svg"
                alt="eBay"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-bold">eBay</h3>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <LightButton text="Back" onClick={onBack} />
        <button
          className={`title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-2 ${
            selectedPlatforms.length === 0 && !ebaySelected
              ? "bold bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bold bg-black text-white hover:text-black hover:bg-accent"
          } rounded-lg text-center`}
          onClick={handleContinue}
          disabled={selectedPlatforms.length === 0 && !ebaySelected}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
