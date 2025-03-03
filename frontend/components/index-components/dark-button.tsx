import React from "react";
import Link from "next/link";

interface DarkButtonProps {
  text: string;
  href: string;
}

const DarkButton: React.FC<DarkButtonProps> = ({ text, href }) => {
  return (
    <div>
      <Link href={href}>
        <p className="title flex justify-center items-center px-16 py-4 bg-black text-white rounded-lg hover:bg-accent text-center">
          {text}
        </p>
      </Link>
    </div>
  );
};

export default DarkButton;
