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

export default function EditItemPage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentScreen, setCurrentScreen] = useState<'form' | 'platforms'>('form');
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

  // Fetch user email when component mounts
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    fetchUserEmail();
  }, []);

  // Fetch item details when component mounts
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/clothing_items/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }
        const data = await response.json();
        
        // Generate name from color, brand, and category
        const nameParts = [];
        if (data.color) nameParts.push(data.color);
        if (data.brand) nameParts.push(data.brand);
        if (data.category) nameParts.push(data.category);
        const generatedName = nameParts.join(' ');
        
        // Update form data with fetched values
        setFormData(prev => ({
          ...prev,
          name: generatedName,
          category: data.category || "",
          size: data.size || "",
          brand: data.brand || "",
          color: data.color || "",
          description: data.description || "",
          lastWorn: data.last_worn ? new Date(data.last_worn).toISOString().split('T')[0] : "",
          archivedDate: data.archived_date ? new Date(data.archived_date).toISOString().split('T')[0] : "",
          tags: data.tags || [],
        }));

        // Update photos if there's an image URL
        if (data.s3url) {
          setPhotos([data.s3url]);
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentScreen('platforms');
  };

  // Handle platform selection
  const handlePlatformContinue = async (platforms: string[]) => {
    setSelectedPlatforms(platforms);
    setIsPosting(true);
    
    try {
      // Generate retailer_id using email and item name
      const timestamp = Date.now();
      const retailer_id = `${userEmail}-${formData.name}`;
      
      // Post to selected platforms
      for (const platform of platforms) {
        if (platform === 'facebook') {
          const apiUrl = '/api/facebook/catalog';
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
            website_link: "https://facebook.com/business/shops"
          };
          
          console.log('Posting to Facebook with data:', postData);

          const facebookResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(postData),
          });

          if (!facebookResponse.ok) {
            const errorText = await facebookResponse.text();
            console.error('Facebook API Error:', errorText);
            throw new Error(`Failed to post to Facebook: ${errorText}`);
          }
        }
        // Add similar logic for eBay when ready
      }

      setIsPosting(false);
      // Show success message
      setShowSuccess(true);
      
      // Wait for 3 seconds to show the success message
      setTimeout(() => {
        // Redirect to listings page
        router.push('/listings');
      }, 3000);
    } catch (error) {
      setIsPosting(false);
      console.error('Error posting to platforms:', error);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    const newFormData = { ...formData, [e.target.name]: value };
    
    // If color, brand, or category changes, update the name
    if (['color', 'brand', 'category'].includes(e.target.name)) {
      const nameParts = [];
      if (newFormData.color) nameParts.push(newFormData.color);
      if (newFormData.brand) nameParts.push(newFormData.brand);
      if (newFormData.category) nameParts.push(newFormData.category);
      
      newFormData.name = nameParts.join(' ');
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
        <div className="my-24 _grid-3">
          {isPosting ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <h1 className="bold text-2xl">Posting your listing...</h1>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : showSuccess ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold text-2xl">Success!</strong>
                <span className="block sm:inline text-lg"> Your item has been listed successfully.</span>
                <p className="mt-2">Redirecting to your listings...</p>
              </div>
            </div>
          ) : currentScreen === 'form' ? (
            <>
              <h1 className="bold mb-12">List Your Item (ID: {id})</h1>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-12">
                {/* Photos */}
                <div className="flex flex-col gap-4">
                  <p className="title">Photos</p>
                  <div className="flex gap-2">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="w-[130px] h-[130px] border border-gray-300 overflow-hidden bg-white"
                      >
                        <Image
                          src={photo}
                          alt={`Product photo ${index + 1}`}
                          width={130}
                          height={130}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                    {/* <div
                      onClick={handleAddPhoto}
                      className="w-[130px] h-[130px] border border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-white"
                    >
                      <Plus className="text-gray-400" />
                    </div> */}
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-4">
                  <p className="title">Item Name</p>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-4">
                  <p className="title">Category</p>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-4">
                  <p className="title">Color</p>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-4">
                  <p className="title">Brand</p>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Size */}
                <div className="flex flex-col gap-4">
                  <p className="title">Size</p>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-4">
                  <p className="title">Price (USD)</p>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleChange}
                      placeholder="Enter price"
                      className="border-black w-full border-2 px-3 py-2"
                    />
                    <input type="hidden" name="currency" value="USD" />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-4">
                  <p className="title">Quantity</p>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || ''}
                    onChange={handleChange}
                    min="1"
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Custom Tags */}
                <div className="flex flex-col gap-4">
                  <p className="title">Custom Tags</p>
                  <input
                    type="text"
                    name="tags"
                    onChange={handleChange}
                    placeholder="Add custom tags (comma separated)"
                    className="border-black w-full border-2 px-3 py-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Tag key={index} text={tag} />
                    ))}
                  </div>
                </div>

                {/* Last Worn */}
                <div className="flex flex-col gap-4">
                  <p className="title">Last Worn</p>
                  <input
                    type="date"
                    name="lastWorn"
                    value={formData.lastWorn}
                    onChange={handleChange}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Archived Date */}
                <div className="flex flex-col gap-4">
                  <p className="title">Date Archived</p>
                  <input
                    type="date"
                    name="archivedDate"
                    value={formData.archivedDate}
                    onChange={handleChange}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-4">
                  <p className="title">Description</p>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="border-black w-full border-2 px-3 py-2"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6 items-center justify-center">
                  <LightButton text="Cancel" href={`/item/${id}`} />
                  <button
                    type="submit"
                    className="title flex justify-center border-4 border-black items-center px-2 lg:px-16 py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center"
                  >
                    List Item
                  </button>
                </div>
              </form>
            </>
          ) : (
            <PlatformSelection
              itemId={id as string}
              onBack={() => setCurrentScreen('form')}
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
