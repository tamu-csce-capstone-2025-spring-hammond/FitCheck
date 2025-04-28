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
import { Button } from "@/components/imported-ui/button";
import { Loader2 } from "lucide-react";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [productName, setProductName] = useState<string>("");
  const [productImage, setProductImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [facebookStatus, setFacebookStatus] = useState<string>("");

  const handleDeleteListing = async () => {
    setIsDeleting(true);
    try {
      // First get the clothing item ID
      const clothingItemResponse = await fetch(`/api/clothing-items?name=${encodeURIComponent(productName)}`);
      if (!clothingItemResponse.ok) {
        throw new Error('Failed to fetch clothing item details');
      }
      const clothingItems = await clothingItemResponse.json();
      
      // Find the matching clothing item by name
      const matchingItem = clothingItems.find((item: any) => item.name === productName);
      if (!matchingItem) {
        throw new Error('No matching clothing item found');
      }

      // Delete from Facebook
      const facebookResponse = await fetch(`/api/facebook/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: productName }),
      });

      if (!facebookResponse.ok) {
        throw new Error('Failed to delete Facebook listing');
      }

      // Delete from our database
      const resaleListingResponse = await fetch(`/api/resale_listings/${matchingItem.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resaleListingResponse.ok) {
        throw new Error('Failed to delete resale listing');
      }

      // Redirect to listings page after successful deletion
      router.push('/listings');
    } catch (error) {
      console.error('Error deleting listing:', error);
      setIsDeleting(false);
      // You might want to show an error message to the user here
    }
  };

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

        // Fetch Facebook availability
        const availabilityResponse = await fetch(`/api/facebook/availability/${nameData.name}`);
        if (!availabilityResponse.ok) {
          throw new Error('Failed to fetch Facebook availability');
        }
        const availabilityData = await availabilityResponse.json();
        console.log("Facebook availability:", availabilityData);
        if (availabilityData.availability === "in stock") {
          setFacebookStatus("Status: Listed");
        }
        else {
          setFacebookStatus("Status: Sold");
        }
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
                <Button 
                  onClick={handleDeleteListing}
                  disabled={isDeleting}
                  className="border-2 border-heart-red text-heart-red items-center active:bg-heart-red active:text-white hover:bg-heart-red hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    'Remove Listing'
                  )}
                </Button>
              </div>

              <div>
                <PlatformTracker platforms={[
                  {
                    platform: "Facebook",
                    status: facebookStatus,
                    platformUrl: "https://www.facebook.com/marketplace"
                  },
                  {
                    platform: "eBay",
                    status: facebookStatus,
                    platformUrl: "https://www.ebay.com"
                  }
                ]} />
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
