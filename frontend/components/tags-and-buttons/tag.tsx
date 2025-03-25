import React from "react";

interface TagProps {
  text: string;
}

const Tag: React.FC<TagProps> = ({ text }) => {
  return (
    <div>
      <p className="flex justify-center items-center px-8 py-1 bg-accent-2 text-white text-center">
        {text}
      </p>
    </div>
  );
};

export default Tag;
