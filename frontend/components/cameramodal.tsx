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

  // Start / stop camera
  useEffect(() => {
    if (isVisible && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Camera error:", err));
    }
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isVisible]);

  // Capture a File from the live video
  const capturePhoto = (): Promise<File> =>
    new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        return reject(new Error("Video or canvas not ready"));
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("2D context failed"));

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Blob conversion failed"));
          resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
      );
    });

  // Generic upload helper
  const uploadToBackend = async (file: File, endpoint: string) => {
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadResult(data.s3_url || data.file_name || data.message);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadResult("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Two button handlers
  const handleUploadItem = async () => {
    try {
      const file = await capturePhoto();
      await uploadToBackend(file, "/api/upload-new-image");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadOutfit = async () => {
    try {
      const file = await capturePhoto();
      await uploadToBackend(file, "/api/upload-new-outfit");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-black rounded-lg w-[90%] md:w-[60%] h-[90%] relative px-8 pt-12 pb-64">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black font-bold text-xl"
        >
          <div className="p-4 bg-black rounded-xl">
            {/* ... X icon SVG ... */}
          </div>
        </button>

        <video
          ref={videoRef}
          autoPlay
          className="w-full rounded-xl h-full object-cover"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Two-button row */}
        <div className="flex justify-center gap-6 my-8">
          {/* Upload single item */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleUploadItem}
              disabled={uploading}
              className="bg-black p-4 rounded-lg"
            >
              <Image
                src="/images/icons/camera-button.svg"
                alt="Upload Item"
                width={72}
                height={72}
              />
            </button>
          </div>

          {/* Upload outfit */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleUploadOutfit}
              disabled={uploading}
              className="bg-black p-4 rounded-lg"
            >
              <Image
                src="/images/icons/camera-button.svg"
                alt="Upload Outfit"
                width={72}
                height={72}
              />
            </button>
            
          </div>
          <p className="mt-2 text-white text-sm">
              {uploading ? "Uploading…" : "Upload Outfit"}
            </p>
        </div>

        {/* Show result */}
        {uploadResult && (
          <div className="mt-4 text-center text-sm text-gray-300 break-all">
            ✅ {uploadResult}
          </div>
        )}
      </div>
    </div>
  );
}
