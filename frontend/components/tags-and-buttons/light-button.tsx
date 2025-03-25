import React from "react";
import Link from "next/link";

interface LightButtonProps {
  text: string;
  href: string;
}

const LightButton: React.FC<LightButtonProps> = ({ text, href }) => {
  return (
    <div>
      <Link href={href}>
        <p className="title flex justify-center items-center border-2 border-black px-16 py-4 bg-white text-black rounded-lg hover:bg-accent text-center">
          {text}
        </p>
      </Link>
    </div>
  );
};

export default LightButton;
