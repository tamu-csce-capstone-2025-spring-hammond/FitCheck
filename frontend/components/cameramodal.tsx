"use client";

import { useEffect, useRef, useState } from "react";

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
        const res = await fetch(`/api/upload-image`, {
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
      <div className="bg-white p-4 rounded-xl w-full max-w-md relative">
        <video ref={videoRef} autoPlay className="w-full rounded-xl" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black font-bold text-xl"
        >
          ✕
        </button>
        <button
          onClick={takePhoto}
          disabled={uploading}
          className="mt-4 w-full bg-black text-white py-2 rounded-lg"
        >
          {uploading ? "Uploading..." : "Take & Upload Photo"}
        </button>

        {uploadResult && (
          <div className="mt-4 text-center text-sm text-gray-700 break-all">
            ✅ Uploaded: {uploadResult}
          </div>
        )}
      </div>
    </div>
  );
}
