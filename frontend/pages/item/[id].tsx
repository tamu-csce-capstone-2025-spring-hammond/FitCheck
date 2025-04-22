// filepath: frontend/pages/product/[id].tsx
import Tag from "@/components/tags-and-buttons/tag";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import LightButton from "@/components/tags-and-buttons/light-button";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { Button } from "@/components/imported-ui/button";
import { Loader2 } from "lucide-react";
import { ArrowLeft } from "lucide-react";

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
  style?: string;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/clothing_items/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch item details");
        }
        const data = await response.json();
        // Ensure tags is always an array
        const processedData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : [],
          style: data.style || undefined
        };
        setItemData(processedData);
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/clothing_items/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response:", response);

      if (response.ok) {
        console.log("Item deleted successfully");
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      router.push("/");
    }
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
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
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-3">
          <div className="my-24 grid grid-cols-1 md:grid-cols-2 gap-24">
            {/* Left column - Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  onClick={() => router.push('/')}
                  className="title flex justify-center  items-center px-2 lg:px-16 py-4 rounded-lg hover:text-black hover:bg-accent text-center"
                >
                  Back
                </Button>
              </div>
              <div className="border border-gray-100 bg-gray-50">
                <Image
                  src={itemData.s3url || "/placeholder.svg"}
                  alt={itemData.description || "Item image"}
                  width={500}
                  height={500}
                  className="w-full object-cover h-full"
                />
              </div>
            </div>

            {/* Right column - Product details */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <p className="bold">Item ID: {id}</p>
                <DarkButton text="Edit Item" href={`/edit-item/${id}`} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {itemData.style ? (
                  itemData.style.split(',').map((tag, index) => (
                    <Tag key={index} text={tag.trim()} />
                  ))
                ) : (
                  <p className="text-gray-500">No tags attached.</p>
                )}
              </div>

              <hr className="my-4" />

              {/* Description */}
              <p className="mb-6">
                <span className="font-semibold">Description:</span>{" "}
                {itemData.description || "No description available"}
              </p>

              <hr className="my-4" />

              {/* Details */}
              <div className="space-y-2 mb-6">
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {itemData.category || "Not specified"}
                </p>
                <p>
                  <span className="font-semibold">Size:</span>{" "}
                  {itemData.size || "Not specified"}
                </p>
                <p>
                  <span className="font-semibold">Brand:</span>{" "}
                  {itemData.brand || "Not specified"}
                </p>
                <p>
                  <span className="font-semibold">Color:</span>{" "}
                  {itemData.color || "Not specified"}
                </p>
                <p className="italic">
                  Last Worn:{" "}
                  {itemData.last_worn
                    ? new Date(itemData.last_worn).toLocaleDateString()
                    : "Not recorded"}
                </p>
                <p className="italic">
                  Date Archived:{" "}
                  {itemData.archived_date
                    ? new Date(itemData.archived_date).toLocaleDateString()
                    : "Not recorded"}
                </p>
              </div>

              <hr className="my-4" />

              {/* List item button */}
              <div className="mt-12">
                <LightButton
                  text="List Item"
                  href={`/initial-list-item/${id}`}
                />
              </div>

              <div className="mt-6 p-6 border-heart-red border-2 rounded-xl">
                <Button
                  onClick={handleDelete}
                  className="w-full border-heart-red border-2 py-8 hover:bg-heart-red"
                >
                  <p className="text-heart-red hover:text-white">
                    Delete Item
                  </p>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Navbar></Navbar>
      </main>

      <Footer></Footer>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <p className="text-lg font-medium">
                Are you sure you want to delete this item?
              </p>
              <p className="text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="default"
                onClick={handleCancel}
                className="border-heart-red border-[1px] hover:bg-heart-red"
                disabled={isDeleting}
              >
                <p className="text-heart-red text-lg hover:text-white">
                  Cancel
                </p>
              </Button>
              <Button
                variant="default"
                onClick={confirmDelete}
                className="border-heart-red border-[1px] hover:bg-heart-red"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-heart-red text-lg">Deleting...</p>
                  </div>
                ) : (
                  <p className="text-heart-red text-lg hover:text-white">
                    Delete
                  </p>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
