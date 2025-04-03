"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (navigator.mediaDevices?.getUserMedia) {
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
  }, []);

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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-new-outfit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploadResult(data.file_name || data.message);
      setPhotoUrl(data.s3_url); // Assuming the backend returns the S3 URL of the uploaded image
    } catch (err) {
      console.error("Upload failed", err);
      setUploadResult("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl mb-6">Create an Outfit</h2>
      <div className="relative w-full max-w-md mx-auto">
        <video ref={videoRef} autoPlay className="w-full rounded-lg" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={() => router.push("/")} // Add a navigation action here for exit
            className="bg-black text-white rounded-full p-2"
          >
            ✕
          </button>
        </div>
      </div>
      <button
        onClick={takePhoto}
        disabled={uploading}
        className="mt-4 w-full bg-black text-white py-2 rounded-lg"
      >
        {uploading ? "Uploading..." : "Take & Upload Outfit"}
      </button>

      {photoUrl && (
        <div className="mt-6 text-center">
          <img src={photoUrl} alt="Taken outfit" className="w-full rounded-lg" />
          <p className="mt-2 text-gray-500">Your outfit has been uploaded!</p>
        </div>
      )}

      {uploadResult && (
        <div className="mt-4 text-center text-sm text-gray-700 break-all">
          ✅ Uploaded: {uploadResult}
        </div>
      )}
    </div>
  );
}
