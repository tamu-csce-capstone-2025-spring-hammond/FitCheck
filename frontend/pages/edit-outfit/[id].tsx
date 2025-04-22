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

interface ItemData {
  id: number;
  description: string;
  category: string;
  size: string;
  brand: string;
  color: string;
  tags: string[];
  last_worn: string;
  archived_date: string;
  s3url: string;
  style: string;
}

interface OutfitItemData {
  id: number;
  description: string;
  outfit_id: number;
  clothing_item_id: number;
}

interface OutfitData {
  name: string;
  id: number;
  user_id: number;
  description: string;
  s3url: string;
  created_at: string;
  items: OutfitItemData[];
}

export default function EditItemPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [outfitData, setOutfitData] = useState<OutfitData | null>(null);
  const [outfitItems, setOutfitItems] = useState<ItemData[]>([]);

  // Fetch item data when component mounts
  useEffect(() => {
      let canceled = false;
  
      async function fetchOutfit() {
        // 1) reset UI immediately on every run
        setIsLoading(true);
        setOutfitItems([]);
        setOutfitData(null);
  
        if (!id) {
          // still clear loading if there's no id
          setIsLoading(false);
          return;
        }
  
        try {
          // 2) fetch outfit metadata
          const resp = await fetch(`/api/outfits/${id}`);
          if (!resp.ok) throw new Error("Failed to fetch outfit");
          const data: OutfitData = await resp.json();
          if (canceled) return;
          setOutfitData(data);
  
          // 3) fetch _all_ items in parallel
          const itemsArray: ItemData[] = await Promise.all(
            data.items.map(async (oi) => {
              const r = await fetch(`/api/clothing_items/${oi.clothing_item_id}`);
              if (!r.ok) throw new Error("Failed to fetch item");
              return (await r.json()) as ItemData;
            })
          );
          if (canceled) return;
  
          // 4) one single state update
          setOutfitItems(itemsArray);
        } catch (err) {
          console.error(err);
        } finally {
          if (!canceled) setIsLoading(false);
        }
      }
  
      fetchOutfit();
  
      // cleanup for stale requests + clear items on unmount
      return () => {
        canceled = true;
        setOutfitItems([]);
      };
    }, [id]);

  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    // clothingItemsIds: [] as number[],
  });

  // Update form data when itemData changes
  useEffect(() => {
    if (outfitData) {
      setFormData({
        name: outfitData.name || "",
        description: outfitData.description || "",
        // clothingItemsIds: outfitData.items.map((item) => item.clothing_item_id) || [],
      });
    }
  }, [outfitData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the current user's ID from the session
      const userResponse = await fetch('/api/me');
      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }
      const userData = await userResponse.json();

      // Prepare the update data
      const updateData = {
        name: formData.name || null,
        description: formData.description || null,
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(`/api/outfits/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Update failed with status:', response.status);
        console.error('Error response:', data);
        throw new Error(data.message || `Failed to update outfit: ${response.status}`);
      }

      // Redirect back to the product page
      router.push(`/outfit/${id}`);
    } catch (error: any) {
      console.error('Error updating item:', error);
      alert(`Failed to update item: ${error.message}`);
    }
  };

  const [photos, setPhotos] = useState(["/placeholder.svg"]);

  const handleAddPhoto = () => {
    // In a real implementation, this would open a file picker
    console.log("Add photo clicked");
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

  if (!outfitData) {
    return (
      <div className="FitCheck">
        <Header />
        <main className="_site-grid min-h-[90vh] relative mb-64">
          <div className="my-24 _grid-3">
            <h1 className="bold mb-12">Item not found</h1>
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
          <h1 className="bold mb-12">Edit Item (ID: {id})</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-12">

            {/* Outfit Photo */}
            <div className="flex flex-col gap-4">
              <p className="title">Outfit Photo</p>
              <div className="w-[300px] h-[300px] border border-gray-300 overflow-hidden bg-white">
                <Image
                  src={outfitData.s3url || "/placeholder.svg"}
                  alt="Outfit photo"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Item Photos */}
            <div className="flex flex-col gap-4">
              <p className="title">Clothing Items</p>
              <div className="flex gap-2">
                {/* Main item photo */}
                {outfitItems.map((item, index) => (
                  <div key={index} className="w-[130px] h-[130px] border border-gray-300 overflow-hidden bg-white">
                    <Image
                      src={item.s3url || "/placeholder.svg"}
                      alt="Main item photo"
                      width={130}
                      height={130}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
                {/* Add new photo button */}
                <div
                  onClick={/*handleAddPhoto*/ ()=>alert("Todo!")}
                  className="w-[130px] h-[130px] border border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-white"
                >
                  <Plus className="text-gray-400" />
                </div>
              </div>
            </div>


            {/* Name */}
            <div className="flex flex-col gap-4">
              <p className="title">Name</p>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                className="title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        <Navbar />
      </main>

      <Footer />
    </div>
  );
}

