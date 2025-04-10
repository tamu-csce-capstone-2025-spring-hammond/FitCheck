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
        <p className="title flex justify-center  border-4 border-black items-center px-2 lg:px-16 py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center">
          {text}
        </p>
      </Link>
    </div>
  );
};

export default DarkButton;
