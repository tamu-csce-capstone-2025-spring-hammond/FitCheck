// filepath: frontend/pages/product/[id].tsx
import Tag from "@/components/tags-and-buttons/tag";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import LightButton from "@/components/tags-and-buttons/light-button";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import PlatformTracker from "@/components/platform-tracker";
import { useState, useEffect } from "react";

// Sample data (to be fetched dynamically later)
const platformStatuses = [
  {
    platform: "Depop",
    status: "listed",
    analytics: { likes: 28, watchlistAdds: 3 },
    platformUrl: "https://depop.com/item/xyz",
  },
  {
    platform: "eBay",
    status: "offer_received",
    offerDetails: {
      price: 40,
      buyer: "vintageFan88",
    },
    analytics: { likes: 12, watchlistAdds: 1 },
    platformUrl: "https://ebay.com/item/abc",
  },
];

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [productName, setProductName] = useState<string>("");
  const [productImage, setProductImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      try {
        // Fetch product name
        const nameResponse = await fetch(`/api/facebook/name/${id}`);
        if (!nameResponse.ok) {
          throw new Error('Failed to fetch product name');
        }
        const nameData = await nameResponse.json();
        setProductName(nameData.name);

        // Fetch product image
        const imageResponse = await fetch(`/api/facebook/image/${nameData.name}`);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch product image');
        }
        const imageData = await imageResponse.json();
        setProductImage(imageData.image_url);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="FitCheck">
        <Header></Header>
        <main className="_site-grid min-h-[90vh] relative mb-64">
          <div className=" _grid-3">
            <div className="my-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative bg-white">
              <h1 className="bold">Loading...</h1>
            </div>
          </div>
        </main>
        <Footer></Footer>
      </div>
    );
  }

  return (
    <div className="FitCheck">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-3">
          <div className="my-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative bg-white">

            {/* LEFT column - Product details */}
            <div className="flex flex-col md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h1 className="bold">Listed Product: {productName || 'Loading...'}</h1>
              </div>

              <div>
                <PlatformTracker platforms={platformStatuses} />
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center my-4">
                <h2 className="mb-6">Item Details</h2>
                <DarkButton
                  text="Edit Listing Info"
                  href={`/edit-listing/${id}`}
                />
              </div>

              <hr className="my-4" />
            </div>

            {/* RIGHT column - Images */}
            <div className="flex md:flex-col flex-row justify-start gap-4">
              {productImage && (
                <div className="border border-gray-100 bg-gray-50">
                  <Image
                    src={productImage}
                    alt={productName}
                    width={500}
                    height={500}
                    className="w-full object-contain"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        <Navbar></Navbar>
      </main>

      <Footer></Footer>
    </div>
  );
}
