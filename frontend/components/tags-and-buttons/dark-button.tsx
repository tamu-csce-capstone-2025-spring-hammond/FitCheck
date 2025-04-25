import React from "react";
import Link from "next/link";

interface DarkButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function DarkButton({ text, href, onClick, disabled }: DarkButtonProps) {
  const classNames = `title flex justify-center border-2 border-black items-center px-2 lg:px-16 py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {text}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined} 
      className={classNames}
      disabled={disabled} 
    >
      {text}
    </button>
  );
}
