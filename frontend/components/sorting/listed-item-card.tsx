import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  itemName: string;
  category?: string;
  price: string;
  href: string;
  imageUrl?: string;
  createdAt?: string;
}

const ListedItemCard: React.FC<Props> = ({ itemName, category, href, price, imageUrl, createdAt }) => {
  console.log('ListedItemCard props:', { itemName, imageUrl, price });
  
  const isValidImageUrl = imageUrl && imageUrl.trim() !== "" && imageUrl.startsWith('http');
  
  if (!isValidImageUrl) {
    console.warn('Invalid image URL:', imageUrl);
  }

  return (
    <Link href={href}>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative aspect-square bg-muted">
          {isValidImageUrl ? (
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={itemName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
                onError={(e) => {
                  console.error('Image failed to load:', e);
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="title">{itemName}</p>
          <p className="">{category}</p>
          <p className="">{price}</p>
          <p className="text-gray-500">Listed on: {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </Link>
  );
};

export default ListedItemCard;
