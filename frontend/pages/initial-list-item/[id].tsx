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

// initial-list-item/[id].tsx
export default function EditItemPage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentScreen, setCurrentScreen] = useState<"form" | "platforms">(
    "form"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    size: "",
    brand: "",
    color: "",
    tags: [],
    lastWorn: "",
    archivedDate: "",
    description: "",
    price: 0,
    currency: "USD",
    quantity: 1,
    retailer_id: "",
  });

  const [photos, setPhotos] = useState(["/placeholder.svg"]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

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

  // Fetch item details when component mounts
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/clothing_items/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch item details");
        }
        const data = await response.json();

        // Generate name from color, brand, and category
        const nameParts = [];
        if (data.color) nameParts.push(data.color);
        if (data.brand) nameParts.push(data.brand);
        if (data.category) nameParts.push(data.category);
        const generatedName = nameParts.join(" ");

        // Update form data with fetched values
        setFormData((prev) => ({
          ...prev,
          name: generatedName,
          category: data.category || "",
          size: data.size || "",
          brand: data.brand || "",
          color: data.color || "",
          description: data.description || "",
          lastWorn: data.last_worn
            ? new Date(data.last_worn).toISOString().split("T")[0]
            : "",
          archivedDate: data.archived_date
            ? new Date(data.archived_date).toISOString().split("T")[0]
            : "",
          tags: data.tags || [],
        }));

        // Update photos if there's an image URL
        if (data.s3url) {
          setPhotos([data.s3url]);
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentScreen("platforms");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle platform selection
  const handlePlatformContinue = async (platforms: string[]) => {
    setSelectedPlatforms(platforms);
    setIsPosting(true);

    try {
      // First, update the clothing item's name in the database
      const updateResponse = await fetch(`/api/clothing_items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update item name");
      }

      // Generate retailer_id using email and item name
      const timestamp = Date.now();
      const retailer_id = `${userEmail}-${formData.name}`;

      // Post to selected platforms
      for (const platform of platforms) {
        if (platform === "facebook") {
          const apiUrl = "/api/facebook/catalog";
          console.log("Price before sending to backend:", formData.price);

          // Prepare the data exactly as expected by the backend
          const postData = {
            name: formData.name,
            currency: formData.currency,
            price: formData.price,
            image_url: photos[0],
            size: formData.size,
            quantity: formData.quantity,
            retailer_id: retailer_id,
            description: formData.description,
            website_link: "https://facebook.com/business/shops",
          };

          console.log("Posting to Facebook with data:", postData);

          const facebookResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(postData),
          });

          if (!facebookResponse.ok) {
            const errorText = await facebookResponse.text();
            console.error("Facebook API Error:", errorText);
            throw new Error(`Failed to post to Facebook: ${errorText}`);
          }

          // Create resale listing in our database
          if (!userId) {
            throw new Error("User ID not found");
          }

          const resaleListingData = {
            user_id: userId,
            clothing_item_id: parseInt(id as string),
            platform: "facebook",
            price: formData.price,
            url: "https://facebook.com/business/shops", // This should be updated with the actual listing URL
            status: "active",
          };

          const resaleListingResponse = await fetch("/api/resale_listings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(resaleListingData),
          });

          if (!resaleListingResponse.ok) {
            const errorData = await resaleListingResponse.json();
            console.error("Resale Listing API Error:", errorData);
            throw new Error(
              `Failed to create resale listing: ${
                errorData.details || errorData.error || "Unknown error"
              }`
            );
          }

          const responseData = await resaleListingResponse.json();
          console.log("Resale listing created successfully:", responseData);
        } else if (platform === "ebay") {
          // Prepare eBay listing data
          const ebayData = {
            title: formData.name,
            description: formData.description,
            price: formData.price,
            currency: formData.currency,
            condition: "NEW", // You might want to make this configurable
            category_id: "9355", // Default category for clothing, you might want to make this configurable
            image_urls: photos,
            quantity: formData.quantity,
            location: {
              country: "US", // You might want to make this configurable
              postal_code: "77840", // You might want to make this configurable
            },
            shipping_options: [
              {
                shipping_service_code: "USPSPriority",
                shipping_cost: 0.00, // You might want to make this configurable
                shipping_type: "FLAT_RATE"
              }
            ]
          };

          // Post to eBay
          const ebayResponse = await fetch("/api/ebay/listing", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(ebayData),
          });

          if (!ebayResponse.ok) {
            const errorText = await ebayResponse.text();
            console.error("eBay API Error:", errorText);
            throw new Error(`Failed to post to eBay: ${errorText}`);
          }

          // Create resale listing in our database
          if (!userId) {
            throw new Error("User ID not found");
          }

          const resaleListingData = {
            user_id: userId,
            clothing_item_id: parseInt(id as string),
            platform: "ebay",
            price: formData.price,
            url: "https://www.ebay.com", // This should be updated with the actual listing URL
            status: "active",
          };

          const resaleListingResponse = await fetch("/api/resale_listings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(resaleListingData),
          });

          if (!resaleListingResponse.ok) {
            const errorData = await resaleListingResponse.json();
            console.error("Resale Listing API Error:", errorData);
            throw new Error(
              `Failed to create resale listing: ${
                errorData.details || errorData.error || "Unknown error"
              }`
            );
          }

          const responseData = await resaleListingResponse.json();
          console.log("eBay listing created successfully:", responseData);
        }
      }

      setIsPosting(false);
      // Show success message
      setShowSuccess(true);

      // Wait for 3 seconds to show the success message
      setTimeout(() => {
        // Redirect to listings page
        router.push("/listings");
      }, 3000);
    } catch (error) {
      setIsPosting(false);
      console.error("Error posting to platforms:", error);
      throw error;
    }
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

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    const newFormData = { ...formData, [e.target.name]: value };

    // If color, brand, or category changes, update the name
    if (["color", "brand", "category"].includes(e.target.name)) {
      const nameParts = [];
      if (newFormData.color) nameParts.push(newFormData.color);
      if (newFormData.brand) nameParts.push(newFormData.brand);
      if (newFormData.category) nameParts.push(newFormData.category);

      newFormData.name = nameParts.join(" ");
    }

    setFormData(newFormData);
  };

  const handleAddPhoto = () => {
    // In a real implementation, this would open a file picker
    console.log("Add photo clicked");
  };

  return (
    <div className="FitCheck">
      <Header />

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="my-24 _grid-3 relative">
          <Image
            src="/images/index-decor-1.svg"
            width={150}
            height={150}
            alt="Closet"
            className="absolute opacity-5 top-[50px] left-[60%] -z-1 -rotate-[20deg]"
          />
          <Image
            src="/images/shirt.svg"
            width={150}
            height={150}
            alt="Closet"
            className="absolute opacity-5 top-[200px] left-[40%] -z-1 rotate-[10deg]"
          />
          <Image
            src="/images/smile.svg"
            width={150}
            height={150}
            alt="Closet"
            className="absolute opacity-5 top-[100px] left-[20%] -z-1 rotate-[20deg]"
          />
          {isPosting ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <h1 className="bold text-2xl">Posting your listing...</h1>
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
                  Your item has been listed successfully.
                </span>
                <p className="mt-2">Redirecting to your listings...</p>
              </div>
            </div>
          ) : currentScreen === "form" ? (
            <>
              <h1 className="bold mb-4">List Your Item (ID: {id})</h1>
              <form
                onSubmit={handleFormSubmit}
                className="flex flex-col gap-12"
              >
                <p className="text-accent-2 bold">Step 1 of 2 — Item Details</p>
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
                    {/* <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="w-32 h-32 border-2 border-dashed flex items-center justify-center text-gray-400 hover:border-black transition"
                >
                  <Plus />
                </button> */}
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
                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-black"
                        placeholder={`Enter ${field}`}
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
                        // Only allow numbers
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

                {/* Last Worn & Archived Date */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["lastWorn", "archivedDate"].map((field) => (
                <div key={field} className="flex flex-col gap-2">
                  <label className="font-medium">
                    {field === "lastWorn" ? "Last Worn" : "Archived Date"}
                  </label>
                  <input
                    type="date"
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div> */}

                {/* submit */}
                <div className="flex justify-end gap-4 mt-6 items-center">
                  <LightButton text="Cancel" href={`/item/${id}`} />
                  <button
                    type="submit"
                    className="title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-2 bg-black rounded-lg  hover:bg-accent text-center"
                  >
                    <p className="bold  text-white hover:text-black">
                      Continue to Platforms
                    </p>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <PlatformSelection
              itemId={id as string}
              onBack={() => setCurrentScreen("form")}
              onContinue={handlePlatformContinue}
            />
          )}
        </div>

        <Navbar />
      </main>

      <Footer />
    </div>
  );
}
