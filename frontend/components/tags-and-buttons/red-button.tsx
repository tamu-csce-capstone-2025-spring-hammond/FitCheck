import React from "react";
import Link from "next/link";

interface RedButtonProps {
  text: string;
  href: string;
}

const RedButton: React.FC<RedButtonProps> = ({ text, href }) => {
  return (
    <div>
      <Link href={href}>
        <p className="title flex justify-center items-center border-2 border-heart-red px-16 py-4 hover:border-red-800 hover:bg-red-800 rounded-lg text-white bg-heart-red text-center">
          {text}
        </p>
      </Link>
    </div>
  );
};

export default RedButton;
