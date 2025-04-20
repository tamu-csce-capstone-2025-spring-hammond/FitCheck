import React from "react";
import Link from "next/link";

interface DarkButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
}

export default function DarkButton({ text, href, onClick }: DarkButtonProps) {

  const classNames="title flex justify-center  border-2 border-black items-center px-2 lg:px-16 py-4 bg-black text-white rounded-lg hover:text-black hover:bg-accent text-center"
  if (href) {
    return (
      <Link href={href} className={classNames}>
        {text}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classNames}>
      {text}
    </button>
  );
}
