import React from "react";
import Link from "next/link";

interface Props {
  itemName: string;
  category?: string;
  imageSrc: string;
  href: string;
}

const ProductCard: React.FC<Props> = ({ itemName, category, imageSrc, href}) => {
  return (
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
  );
};


export default ProductCard;
