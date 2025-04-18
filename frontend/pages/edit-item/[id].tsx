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
}

export default function EditItemPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [itemData, setItemData] = useState<ItemData | null>(null);

  // Fetch item data when component mounts
  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/clothing_items/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }
        const data = await response.json();
        setItemData(data);
      } catch (error) {
        console.error('Error fetching item details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    description: "",
    color: "",
    style: "",
    last_worn: "",
    size: "",
    category: "",
    archived_date: "",
  });

  // Update form data when itemData changes
  useEffect(() => {
    if (itemData) {
      setFormData({
        description: itemData.description || "",
        color: itemData.color || "",
        style: itemData.tags?.join(', ') || "",
        last_worn: itemData.last_worn ? new Date(itemData.last_worn).toISOString().split('T')[0] : "",
        size: itemData.size || "",
        category: itemData.category || "",
        archived_date: itemData.archived_date ? new Date(itemData.archived_date).toISOString().split('T')[0] : "",
      });
    }
  }, [itemData]);

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
        user_id: userData.id,
        description: formData.description || null,
        color: formData.color || null,
        style: formData.style || null,
        last_worn: formData.last_worn ? new Date(formData.last_worn).toISOString() : null,
        size: formData.size || null,
        category: formData.category || null,
        archived_date: formData.archived_date ? new Date(formData.archived_date).toISOString() : null,
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(`/api/clothing_items/${id}`, {
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
        throw new Error(data.message || `Failed to update item: ${response.status}`);
      }

      // Redirect back to the product page
      router.push(`/item/${id}`);
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

  if (!itemData) {
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
            {/* Photos */}
            <div className="flex flex-col gap-4">
              <p className="title">Photos</p>
              <div className="flex gap-2">
                {/* Main item photo */}
                <div className="w-[130px] h-[130px] border border-gray-300 overflow-hidden bg-white">
                  <Image
                    src={itemData.s3url || "/placeholder.svg"}
                    alt="Main item photo"
                    width={130}
                    height={130}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div
                  onClick={handleAddPhoto}
                  className="w-[130px] h-[130px] border border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-white"
                >
                  <Plus className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Tags (Style) */}
            <div className="flex flex-col gap-4">
              <p className="title">Tags</p>
              <input
                type="text"
                name="style"
                value={formData.style}
                onChange={handleChange}
                placeholder="Enter tags separated by commas"
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

            {/* Last Worn */}
            <div className="flex flex-col gap-4">
              <p className="title">Last Worn</p>
              <input
                type="date"
                name="last_worn"
                value={formData.last_worn}
                onChange={handleChange}
                className="border-black w-full border-2 px-3 py-2"
              />
            </div>

            {/* Date Archived */}
            <div className="flex flex-col gap-4">
              <p className="title">Date Archived</p>
              <input
                type="date"
                name="archived_date"
                value={formData.archived_date}
                onChange={handleChange}
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

