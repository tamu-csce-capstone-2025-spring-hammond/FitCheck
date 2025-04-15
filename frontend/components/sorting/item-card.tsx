import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/imported-ui/button";

interface Props {
  itemName: string;
  category?: string;
  imageSrc: string;
  href: string;
  id: number;
  showDeleteButton: boolean;
  onDelete?: (id: number) => void;
}

const ProductCard: React.FC<Props> = ({ itemName, category, imageSrc, href, id, showDeleteButton, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/clothing_items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Delete response:", response);
      
      if (response.ok) {
        console.log("Item deleted successfully");
        if (onDelete) {
          onDelete(id);
        }
        setShowDeleteModal(false);
        router.push('/');
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="relative">
      <Link href={href}>
        <div className="border rounded-lg overflow-hidden">
          <div className="aspect-square bg-muted">
            <img src={imageSrc} alt={itemName} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <p className="title">{itemName}</p>
            <p className="">{category}</p>
          </div>
        </div>
      </Link>

      {showDeleteButton && (
        <button
          onClick={handleDelete}
          className="absolute top-1 right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <p className="text-lg font-medium">Are you sure you want to delete this item?</p>
              <p className="text-gray-500 mt-2">This action cannot be undone.</p>
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
};

export default ProductCard;
