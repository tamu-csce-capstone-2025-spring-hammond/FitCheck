import React from "react";
import Link from "next/link";

interface LightButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
}

const LightButton: React.FC<LightButtonProps> = ({ text, href, onClick }) => {
  const buttonContent = (
    <p className="title flex justify-center items-center border-2 border-black px-16 py-4 bg-white text-black rounded-lg hover:bg-accent text-center">
      {text}
    </p>
  );

  if (href) {
    return (
      <div>
        <Link href={href}>
          {buttonContent}
        </Link>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      {buttonContent}
    </div>
  );
};

export default LightButton;
