import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import LightButton from "@/components/tags-and-buttons/light-button";
import Image from "next/image";
import { Plus } from "lucide-react";
import Tag from "@/components/tags-and-buttons/tag";
import PlatformSelection from "@/components/platform-selection";

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentScreen, setCurrentScreen] = useState<"form" | "platforms">("form");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    size: "",
    brand: "",
    color: "",
    tags: [],
    description: "",
    price: 0,
    currency: "USD",
    quantity: 1,
  });

  const [photos, setPhotos] = useState(["/placeholder.svg"]);

  // Fetch user email and ID when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserEmail(data.email);
        setUserId(data.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch listing details when component mounts
  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!id) return;

      try {
        // First get the listing name from Facebook using the ID
        const nameResponse = await fetch(`/api/facebook/name/${id}`);
        if (!nameResponse.ok) {
          throw new Error("Failed to fetch Facebook listing name");
        }
        const nameData = await nameResponse.json();
        console.log('Name response:', nameData);
        const listingName = nameData.name;

        // Get the clothing item details by name
        const clothingItemResponse = await fetch(`/api/clothing-items?name=${encodeURIComponent(listingName)}`);
        if (!clothingItemResponse.ok) {
          throw new Error("Failed to fetch clothing item details");
        }
        const clothingItems = await clothingItemResponse.json();
        console.log('Clothing items response:', clothingItems);
        
        // Find the matching clothing item by name
        const matchingItem = clothingItems.find((item: any) => item.name === listingName);
        if (!matchingItem) {
          throw new Error("No matching clothing item found");
        }
        console.log('Matching item:', matchingItem);

        // Fetch additional Facebook details
        const [priceResponse, sizeResponse, imageResponse, descriptionResponse] = await Promise.all([
          fetch(`/api/facebook/price/${listingName}`),
          fetch(`/api/facebook/size/${listingName}`),
          fetch(`/api/facebook/image/${listingName}`),
          fetch(`/api/facebook/description/${listingName}`)
        ]);

        // Initialize form with clothing item data
        setFormData(prev => ({
          ...prev,
          name: listingName,
          category: matchingItem.category || "",
          brand: matchingItem.brand || "",
          color: matchingItem.color || "",
        }));

        // Update form with Facebook data if available
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log('Price response:', priceData);
          // Handle direct string value
          if (typeof priceData === 'string') {
            // Remove dollar sign and convert to number
            const priceString = priceData.replace(/[^0-9.]/g, '');
            const price = parseFloat(priceString);
            console.log('Converted price:', price);
            setFormData(prev => ({ ...prev, price }));
          } else {
            console.log('Invalid price format:', priceData);
            setFormData(prev => ({ ...prev, price: 0 }));
          }
        }

        if (sizeResponse.ok) {
          const sizeData = await sizeResponse.json();
          console.log('Size response:', sizeData);
          setFormData(prev => ({ ...prev, size: sizeData.size || "" }));
        }

        if (descriptionResponse.ok) {
          const descriptionData = await descriptionResponse.json();
          console.log('Description response:', descriptionData);
          // The description might be in a different format
          let descriptionText = "";
          if (typeof descriptionData === 'string') {
            // If it's a string, extract the description part
            const match = descriptionData.match(/Description for .* is: (.*)/);
            descriptionText = match ? match[1] : descriptionData;
          } else if (descriptionData.description) {
            descriptionText = descriptionData.description;
          }
          console.log('Extracted description:', descriptionText);
          setFormData(prev => ({ ...prev, description: descriptionText }));
        }

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          console.log('Image response:', imageData);
          if (imageData.image_url) {
            setPhotos([imageData.image_url]);
          }
        }

      } catch (error) {
        console.error("Error fetching listing details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsUpdating(true);

    try {
      // First get the listing name from Facebook using the ID
      const nameResponse = await fetch(`/api/facebook/name/${id}`);
      if (!nameResponse.ok) {
        throw new Error("Failed to fetch Facebook listing name");
      }
      const nameData = await nameResponse.json();
      const listingName = nameData.name;

      // Get the clothing item details by name
      const clothingItemResponse = await fetch(`/api/clothing-items?name=${encodeURIComponent(listingName)}`);
      if (!clothingItemResponse.ok) {
        throw new Error("Failed to fetch clothing item details");
      }
      const clothingItems = await clothingItemResponse.json();
      
      // Find the matching clothing item by name
      const matchingItem = clothingItems.find((item: any) => item.name === listingName);
      if (!matchingItem) {
        throw new Error("No matching clothing item found");
      }

      // Update the listing in the database using clothing_item_id
      const updateData = {
        user_id: userId,
        clothing_item_id: matchingItem.id,
        platform: "facebook",
        price: formData.price,
        url: "https://www.fitcheck.fashion",
        status: "active",
        sold_on: null
      };
      
      console.log('Sending update data:', updateData);
      
      const updateResponse = await fetch(`/api/resale_listings/${matchingItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update response:', updateResponse);
      if (!updateResponse.ok) {
        throw new Error("Failed to update listing");
      }

      // Update on Facebook (since it's the original platform)
      const facebookResponse = await fetch(`/api/facebook/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          currency: formData.currency,
          price: formData.price,
          size: formData.size,
          quantity: formData.quantity,
          image_url: photos[0],
          description: formData.description,
          website_link: "https://www.fitcheck.fashion"
        }),
      });

      if (!facebookResponse.ok) {
        throw new Error("Failed to update Facebook listing");
      }

      setIsUpdating(false);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/listings");
      }, 3000);
    } catch (error) {
      setIsUpdating(false);
      console.error("Error updating listing:", error);
      throw error;
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  if (isLoading) {
    return (
      <div className="FitCheck">
        <Header />
        <main className="_site-grid min-h-[90vh] relative mb-64">
          <div className="my-24 _grid-3">
            <h1 className="bold mb-12">Loading...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="FitCheck">
      <Header />
      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="my-24 _grid-3">
          {isUpdating ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <h1 className="bold text-2xl">Updating your listing...</h1>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : showSuccess ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold text-2xl">Success!</strong>
                <span className="block sm:inline text-lg">
                  {" "}
                  Your listing has been updated successfully.
                </span>
                <p className="mt-2">Redirecting to your listings...</p>
              </div>
            </div>
          ) : currentScreen === "form" ? (
            <>
              <h1 className="bold mb-4">Edit Listing (ID: {id})</h1>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-12">
                <p className="text-accent-2 bold">Update Item Details</p>
                
                {/* Photos */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-semibold">Photos</h2>
                  <div className="flex gap-4 flex-wrap">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="w-32 h-32 border rounded overflow-hidden bg-white"
                      >
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          width={130}
                          height={130}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Name, Category, Color, Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["name", "category", "color", "brand"].map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <label htmlFor={field} className="font-medium capitalize">
                        {field}
                      </label>
                      <input
                        type="text"
                        name={field}
                        id={field}
                        value={(formData as any)[field]}
                        onChange={handleChange}
                        className={`border border-gray-300 rounded px-3 py-2 ${
                          field === "name" ? "text-gray-500 bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-black"
                        }`}
                        placeholder={`Enter ${field}`}
                        readOnly={field === "name"}
                      />
                    </div>
                  ))}
                </div>

                {/* Size, Price, Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Size</label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2"
                      placeholder="e.g. M"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Price (USD)</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleChange({
                          target: {
                            name: 'price',
                            value: value,
                            type: 'text'
                          }
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="border border-gray-300 rounded px-3 py-2"
                    placeholder="Describe your item..."
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 mt-6 items-center">
                  <LightButton text="Cancel" href={`/listed-item/${id}`} />
                  <button
                    type="submit"
                    className="title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-2 bg-black rounded-lg hover:bg-accent text-center"
                  >
                    <p className="bold text-white hover:text-black">
                      Update Listing
                    </p>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <PlatformSelection
              itemId={id as string}
              onBack={() => setCurrentScreen("form")}
            />
          )}
        </div>
        <Navbar />
      </main>
      <Footer />
    </div>
  );
} 