import React from "react";
import Link from "next/link";

interface Props {
  itemName: string;
  category?: string;
  price: string;
  href: string;
}

const ListedItemCard: React.FC<Props> = ({ itemName, category, href, price }) => {
  return (
    <Link href={href}>
      <div className="border rounded-lg overflow-hidden">
        <div className="aspect-square bg-muted"></div>
        <div className="p-4">
          <p className="title">{itemName}</p>
          <p className="">{category}</p>
          <p className="">{price}</p>
        </div>
      </div>
    </Link>
  );
};

export default ListedItemCard;
