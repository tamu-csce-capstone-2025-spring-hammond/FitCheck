"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CameraModal({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Camera error:", err));
    }
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isVisible]);

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      await uploadToBackend(file);
    }, "image/jpeg");
  };

  const uploadToBackend = async (file: File) => {
    setUploading(true);
    setUploadResult(null);

    // TEMPLATE FOR HOW TO UPLOAD AN IMAGE TO THE BACKEND
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/upload-new-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploadResult(data.file_name || data.message);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadResult("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-black  rounded-lg w-full h-[90%] w-[90%] md:w-[60%] relative px-8 pt-12 pb-64">
        <video
          ref={videoRef}
          autoPlay
          className="w-full rounded-xl h-full object-cover"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black font-bold text-xl"
        >
          <div className="p-4 md:p-8 bg-black rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="white"
              className="size-12"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </button>

        <div className="flex flex-col justify-center align-center gap-4 my-8 w-full">
          <button
            onClick={takePhoto}
            disabled={uploading}
            className="flex flex-col justify-center align-center gap-6 mt-4 w-full bg-black text-white py-2 rounded-lg"
          >
            <Image
              src="/images/icons/camera-button.svg"
              alt="Add"
              width={72}
              height={72}
              className="h-24 w-auto"
            />
          </button>
          <p className="text-center text-sm text-white bold">
            {" "}
            {uploading ? "Uploading..." : "Take & Upload Photo"}
          </p>
        </div>

        {uploadResult && (
          <div className="mt-4 text-center text-sm text-gray-700 break-all">
            ✅ Uploaded: {uploadResult}
          </div>
        )}
      </div>
    </div>
  );
}
