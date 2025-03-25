import React from "react";
import Link from "next/link";

interface Props {
  key: number;
  itemName: string;
  category?: string;
  href: string;
}

const ProductCard: React.FC<Props> = ({ key, itemName, category, href }) => {
  return (
    <Link href={href}>
      <div className="border rounded-lg overflow-hidden">
        <div className="aspect-square bg-muted"></div>
        <div className="p-4">
          <p className="title">{key}{itemName}</p>
          <p className="">{category}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
