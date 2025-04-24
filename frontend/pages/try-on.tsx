import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import CameraModal from "@/components/cameramodal";

interface ClothingItem {
  brand: string;
  category: string;
  color: string;
  created_at: string;
  description: string;
  id: number;
  last_worn: string;
  name: string;
  s3url: string;
  size: string;
  user_id: number;
}

export default function AddItem() {
  const router = useRouter();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [uploadedSelfie, setUploadedSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle closing the camera modal
  const handleCameraClose = () => {
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  };

  // Function to capture a selfie from the video feed
  const handleTakeSelfie = async () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const selfieDataUrl = canvasRef.current.toDataURL("image/jpeg");
        setSelfie(selfieDataUrl);
      }
    }
  };

  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
  }, [showCamera]);

  // Upload selfie to the backend
  const handleUploadSelfie = async () => {
    if (selfie) {
      const formData = new FormData();
      formData.append("file", dataURItoBlob(selfie));

      const res = await fetch('/api/virtual-try-on', {
        method: 'POST',
        credentials: "include",

        body: formData
      });
       
      if (res.ok) {
        const data = await res.json();
        setUploadedSelfie(data.s3_url);
      } else {
        console.error("Selfie upload failed");
      }
    }
  };

  // Convert the DataURL of the selfie to a Blob for uploading
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: "image/jpeg" });
  };

  // Handle try-on with the Fashn API
  const handleFashnTryOn = async () => {
    if (uploadedSelfie && selectedItem) {
      const response = await fetch("https://api.fashn.ai/v1/run", {
        method: "POST",
        body: JSON.stringify({
          model_image: uploadedSelfie,
          garment_image: selectedItem.s3url,
          category: selectedItem.category,
        }),
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Try-on successful", data);
      } else {
        console.error("Try-on failed");
      }
    }
  };

  // Fetch clothing items for the user
  useEffect(() => {
    const fetchClothingItems = async () => {
      const res = await fetch("/api/clothing-items", {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setClothingItems(data);
      } else {
        console.error("Failed to fetch clothing items");
      }
    };

    fetchClothingItems();
  }, []);

  // Handle item selection for the try-on process
  const handleItemSelect = (item: ClothingItem) => {
    setSelectedItem(item);
  };

  // Start the camera stream for selfie capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  return (
    <div className="FitCheck">
      <Header />

      <main className="_site-grid min-h-[80vh] relative mb-64">
        <div className="my-36 _grid-3 h-full">
          <div className="flex flex-col gap-6 px-6 py-12 md:px-16 md:py-24 bg-white shadow-lg rounded-lg border-2 border-gray-200">
            <h1 className="bold text-center mb-6">Select Clothing Item to Try On</h1>

            {/* Display clothing items in grid format */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {clothingItems.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer border-2 p-4 rounded-lg text-center hover:border-gray-500"
                  onClick={() => handleItemSelect(item)}
                >
                  <Image
                    src={item.s3url}
                    alt={item.description}
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                  <p className="text-sm mt-2">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Display selected item for try-on */}
            {selectedItem && (
              <div className="mt-6 text-center">
                <h2 className="font-bold">Selected Item</h2>
                <Image
                  src={selectedItem.s3url}
                  alt={selectedItem.description}
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
                <p>{selectedItem.description}</p>
              </div>
            )}

            {/* Camera UI */}
            {showCamera && (
              <div className="mt-6 text-center">
                <h2 className="font-bold">Take Your Selfie</h2>
                <video
                  ref={videoRef}
                  width="320"
                  height="240"
                  autoPlay
                  muted
                  playsInline
                  style={{ borderRadius: 8 }}
                /> 
                <div className="mt-4">
                  <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
                  <DarkButton text="Take Selfie" onClick={handleTakeSelfie} />
                </div>
              </div>
            )}

            {/* Display the selfie */}
            {selfie && (
              <div className="mt-6 text-center">
                <h2 className="font-bold">Your Selfie</h2>
                <Image src={selfie} alt="Selfie" width={200} height={200} className="rounded-lg" />
              </div>
            )}

            {/* Buttons */}
            <div className="mt-auto">
              {!showCamera ? (
                <DarkButton text="Start Camera" onClick={() => setShowCamera(true)} />
              ) : (
                <DarkButton text="Upload Selfie" onClick={handleUploadSelfie} />
              )}
              <DarkButton text="Try-On with Fashn" onClick={handleFashnTryOn} />
            </div>
          </div>
        </div>

        <Navbar
          onAddClick={() => {
            setShowCamera(true);
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
