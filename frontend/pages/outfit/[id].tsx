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
import Link from "next/link";
import OutfitLogModal from "@/components/outfit-log-modal";

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


interface OutfitItemData {
  id: number;
  description: string;
  outfit_id: number;
  clothing_item_id: number;
}

interface OutfitData {
  id: number;
  name: string;
  user_id: number;
  description: string;
  s3url: string;
  created_at: string;
  items: OutfitItemData[];
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [outfitData, setOutfitData] = useState<OutfitData | null>(null);
  const [outfitItems, setOutfitItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

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

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/outfits/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response:", response);

      if (response.ok) {
        console.log("Outfit deleted successfully");
      } else {
        console.error("Failed to delete outfit");
      }
    } catch (error) {
      console.error("Error deleting outfit:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      router.push("/");
    }
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
  };

  const handleLogOutfit = async (date: string) => {
    try {
      const response = await fetch(`/api/outfits/${id}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      });

      if (response.ok) {
        console.log("Outfit logged successfully");
        router.push("/ootd-calendar");
      } else {
        console.error("Failed to log outfit");
      }
    } catch (error) {
      console.error("Error logging outfit:", error);
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

  if (!outfitData) {
    return (
      <div className="FitCheck">
        <Header />
        <main className="_site-grid min-h-[90vh] relative mb-64">
          <div className="my-24 _grid-3">
            <h1 className="bold mb-12">Outfit not found</h1>
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
                  className="title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center"
                >
                  Back
                </Button>
              </div>
              <div className="border border-gray-100 bg-gray-50">
                <Image
                  src={outfitData.s3url || "/placeholder.svg"}
                  alt={outfitData.description || "Item image"}
                  width={500}
                  height={500}
                  className="w-full object-cover h-full"
                />
              </div>
            </div>

            {/* Right column - Product details */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-1 gap-4 mt-4">
                <h1 className="bold mb-4">{outfitData.name || "Unnamed Outfit"}</h1>
                <p className="bold">Outfit ID: {id}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <DarkButton text="Edit Outfit" href={`/edit-outfit/${id}`} />
                  <Button
                    onClick={() => setShowLogModal(true)}
                    className="w-full border-2 border-black py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center"
                  >
                    Log Outfit
                  </Button>
                </div>
              </div>



              <hr className="my-4" />

              {/* Description */}
              <p className="mb-6">
                <span className="font-semibold">Description:</span>{" "}
                {outfitData.description || "No description available"}
              </p>

              <hr className="my-4" />

              {/* Items */}
              <div className="mb-6">
                <h2 className="bold mb-4">Items in this outfit:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outfitItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 bg-gray-50 p-4 rounded-lg mb-5"
                    >
                      <Link href={`/item/${item.id}`}>
                        <Image
                          src={item.s3url || "/placeholder.svg"}
                          alt={item.description || "Item image"}
                          width={500}
                          height={500}
                          className="w-full object-cover h-full mb-4"
                        />
                      </Link>
                      <p className="bold mb-2">{item.description}</p>
                    </div>
                  ))}
                  </div>
              </div>

              <hr className="my-24 mb-4" />


              <div className="">
                <Button
                  onClick={handleDelete}
                  className="w-full border-heart-red border-2 py-8 hover:bg-heart-red"
                >
                  <p className="text-heart-red hover:text-white">
                    Delete Outfit
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

      {/* Log Outfit Modal */}
      {showLogModal && (
        <OutfitLogModal
          onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
