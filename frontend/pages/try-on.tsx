import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import CameraModal from "@/components/cameramodal";



interface ClothingItem {
  brand: string;
  category: string;
  color: string;
  created_at: string;
  description: string;
  id: number;
  last_worn: string;
  name: string;
  s3url: string;
  size: string;
  user_id: number;
}


export default function AddItem() {
  const router = useRouter();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraClose = () => {
    setShowCamera(false);
    router.reload();
  };
  useEffect(() => {
    // Fetch clothing items for the user
    const fetchClothingItems = async () => {
      const res = await fetch("/api/clothing-items", {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setClothingItems(data);
      } else {
        console.error("Failed to fetch clothing items");
      }
    };

    fetchClothingItems();
  }, []);
  // Handle item selection for the try-on
  const handleItemSelect = (item: ClothingItem) => {
    setSelectedItem(item);
  };


  return (
    <div className="FitCheck">
      <Header />

      <main className="_site-grid min-h-[80vh] relative mb-64">
        <div className="my-36 _grid-3 h-full">
          <div className="flex flex-col gap-6 px-6 py-12 md:px-16 md:py-24 bg-white shadow-lg rounded-lg border-2 border-gray-200">
            <h1 className="bold text-center mb-6">Select Clothing Item to Try On</h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {clothingItems.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer border-2 p-4 rounded-lg text-center hover:border-gray-500"
                  onClick={() => handleItemSelect(item)}
                >
                  <Image
                    src={item.s3url}
                    alt={item.description}
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                  <p className="text-sm mt-2">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Display selected item for try-on */}
            {selectedItem && (
              <div className="mt-6 text-center">
                <h2 className="font-bold">Selected Item</h2>
                <Image
                  src={selectedItem.s3url}
                  alt={selectedItem.description}
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
                <p>{selectedItem.description}</p>
              </div>
            )}

            <div className="mt-auto">
              <DarkButton text="Add to Inventory" />
            </div>
          </div>
        </div>

        <Navbar
          onAddClick={() => {
            setShowCamera(true);
          }}
        />
      </main>

      <Footer />
      <CameraModal isVisible={showCamera} onClose={handleCameraClose} />
    </div>
  );
}
