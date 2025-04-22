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
  const [uploadType, setUploadType] = useState<"item" | "outfit">("item");

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
        "image/jpeg"
      );
    });

  const uploadToBackend = async (file: File, endpoint: string) => {
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      setUploadResult(data.s3_url || data.file_name || data.message);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadResult("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const file = await capturePhoto();
      const endpoint =
        uploadType === "item"
          ? "/api/upload-new-image"
          : "/api/upload-new-outfit";
      await uploadToBackend(file, endpoint);
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
          className="absolute top-6 p-4 right-6 bg-black rounded-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="white"
            className="size-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <video
          ref={videoRef}
          autoPlay
          className="w-full rounded-xl h-full object-cover"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="flex flex-col items-center mt-6 gap-4">
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as "item" | "outfit")}
            className="text-white bg-black px-4 py-2"
          >
            <option value="item">Upload Item Photo</option>
            <option value="outfit">Upload Outfit Photo</option>
          </select>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`bg-black p-4  ${
              uploading ? "opacity-50 cursor-not-allowed" : " hover:bg-gray-800"
            }`}
          >
            <Image
              src="/images/icons/camera-button.svg"
              alt="Take Photo"
              width={72}
              height={72}
            />
          </button>

          <p className="text-white text-sm">
            {uploading ? "Uploading…" : ``}
          </p>

          {/* Upload result */}
          {uploadResult && (
            <div className="mt-2 text-center text-sm text-gray-300 break-all max-w-xs">
              ✅ {uploadResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
