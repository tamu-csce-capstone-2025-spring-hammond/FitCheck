import { useRouter } from "next/router";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import LightButton from "@/components/tags-and-buttons/light-button";
import Image from "next/image";
import { Plus } from "lucide-react";
import Tag from "@/components/tags-and-buttons/tag";

export default function EditItemPage() {
  const router = useRouter();
  const { id } = router.query;

  // Simulated existing data (replace with actual API fetch)
  const [formData, setFormData] = useState({
    name: "Denim Jacket",
    category: "Jacket",
    size: "Small",
    brand: "Levi's",
    color: "Blue",
    tags: ["Casual", "Spring"],
    lastWorn: "2024-03-10",
    archivedDate: "2024-02-15",
    description: "A stylish denim jacket.",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Item Data:", formData);
    // Here, you would send the updated data to an API or database
    router.push(`/product/${id}`); // Redirect back to product page
  };

  const [photos, setPhotos] = useState(["/placeholder.svg"]);

  const handleAddPhoto = () => {
    // In a real implementation, this would open a file picker
    console.log("Add photo clicked");
  };

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
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="w-[130px] h-[130px] border border-gray-300 overflow-hidden bg-white"
                  >
                    <Image
                      src={photo || "/placeholder.svg"}
                      alt={`Product photo ${index + 1}`}
                      width={130}
                      height={130}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
                <div
                  onClick={handleAddPhoto}
                  className="w-[130px] h-[130px] border border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-white"
                >
                  <Plus className="text-gray-400" />
                </div>
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
              {/* <DarkButton text="Save Changes" type="submit" /> */}
              <LightButton text="Cancel" href={`/product/${id}`} />
              <DarkButton text="Save" href={`/product/${id}`} />
            </div>
          </form>
        </div>

        <Navbar />
      </main>

      <Footer />
    </div>
  );
}
