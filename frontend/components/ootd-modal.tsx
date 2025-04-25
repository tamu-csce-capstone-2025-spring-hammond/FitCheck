// ootd-modal.tx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  date: string;
  onClose: () => void;
  outfit?: {
    s3url?: string;
    name?: string;
  };
  outfitId?: number;
};

export default function OOTDModal({ date, onClose, outfit, outfitId }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-12 w-full max-w-5xl shadow-lg relative">
        <button className="absolute top-8 right-12 text-gray-500" onClick={onClose}>
          ✕
        </button>

        <h2 className="font-bold mb-4">OOTD for {date}</h2>

        <div>
          {outfit?.s3url ? (
            <Image
              src={outfit.s3url}
              alt={outfit.name || "Outfit"}
              width={1024}
              height={768}
              className="rounded-lg w-full object-cover"
            />
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
              No outfit image available
            </div>
          )}
          <div className="flex flex-col gap-8 pt-12">
            {outfitId && (
              <Link href={`/outfit/${outfitId}`}>
                <button className="px-12 py-2 bg-black text-white rounded-lg w-full">
                  <p className="text-white rounded-lg">Go to Outfit</p>
                </button>
              </Link>
            )}
            <button className="text-heart-red underline">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
