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

interface UserSelfie {
  id: string;
  image_url: string;
  description: string;
  created_at: string;
  user_id: number;
}

interface TryOnResponse {
  id: string;
  error: string | null;
}

interface TryOnStatus {
  id: string;
  status: "starting" | "in_queue" | "processing" | "completed" | "failed";
  output?: string[];     // URLs of generated images
  error: string | null;
}

export default function AddItem() {
  const router = useRouter();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [userSelfies, setUserSelfies] = useState<UserSelfie[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [uploadedSelfie, setUploadedSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tryOnJob, setTryOnJob] = useState<TryOnResponse | null>(null);
  const [tryOnStatus, setTryOnStatus] = useState<TryOnStatus | null>(null);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);

  const selfieUrl = uploadedSelfie ?? selectedSelfie;
  const isTryOnDisabled = !selectedItem || !selfieUrl;
 
  useEffect(() => {
    if (!tryOnJob?.id) return;
    console.log('got here 5')
    const interval = setInterval(async () => {
      const statusRes = await fetch(`https://api.fashn.ai/v1/status/${tryOnJob.id}`, {
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_FASHN_KEY}` },
      });
      if (!statusRes.ok) {
        console.error("Status check failed");
        return;
      }
      console.log('got here 6')
      const statusData: TryOnStatus = await statusRes.json();
      setTryOnStatus(statusData);

      if (statusData.status === "completed" && statusData.output?.length) {
        setTryOnImage(statusData.output[0]);
        clearInterval(interval);
        console.log('got here 7')
      } else if (statusData.status === "failed") {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tryOnJob]);

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

  const handleFashnTryOn = async () => {
    if (isTryOnDisabled) return;
    const res = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_FASHN_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_image: selectedSelfie,
        garment_image: selectedItem.s3url,
        category: "auto",          
        segmentation_free: true,
        moderation_level: "permissive",
        garment_photo_type: "auto",
        mode: "balanced",
        num_samples: 1,
      }),
    });
    if (!res.ok) {
      console.error("Try-on run failed");
      return;
    }
    const data: TryOnResponse = await res.json();
    setTryOnJob(data);
    setTryOnStatus({ id: data.id, status: "starting", error: data.error });
    setTryOnImage(null);
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

  useEffect(() => {
    const fetchUserSelfies = async () => {
      const res = await fetch("/api/user-selfies", {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setUserSelfies(data);
      } else {
        console.error("Failed to fetch user selfies");
      }
    };

    fetchUserSelfies();
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
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="FitCheck">
      <Header />

      <main className="_site-grid min-h-[80vh] relative mb-64">
        <div className="my-36 _grid-3 h-full">
          <div className="flex flex-col gap-6 px-6 py-12 md:px-16 md:py-24 bg-white shadow-lg rounded-lg border-2 border-gray-200">
            <h1 className="bold text-center mb-6">Select Clothing Item to Try On</h1>

            <div className="relative mb-6">
              <div className="relative mb-6">
                <button
                  onClick={() =>
                    carouselRef.current?.scrollBy({ left: -400, behavior: "smooth" })
                  }
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-full p-2 shadow"
                >
                  ‹
                </button>

                <div
                  ref={carouselRef}
                  className="flex space-x-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide p-2"
                >
                  {clothingItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className="snap-center flex-shrink-0 w-64 md:w-80 cursor-pointer border-2 p-4 rounded-lg hover:border-gray-500 text-center"
                    >
                      <Image
                        src={item.s3url}
                        alt={item.description}
                        width={240}
                        height={240}
                        className="mx-auto rounded-lg"
                      />
                    </div>
                  ))}
                </div>

              <button
                onClick={() =>
                  carouselRef.current?.scrollBy({ left: 400, behavior: "smooth" })
                }
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-full p-2 shadow"
              >
                ›
              </button>
            </div>

            </div>
            <div className="relative w-full mb-6">
              <p className="text-center font-medium mb-2">
                Select the selfie you want to use below,  
                or use the camera to take a new one.
              </p>
              <button onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow">
                ‹
              </button>
              <div ref={carouselRef}
                className="flex space-x-4 overflow-x-auto snap-x snap-mandatory p-2 scrollbar-hide">
                {userSelfies.map(s => (
                  <div key={s.id}
                    className="snap-center flex-shrink-0 w-48 cursor-pointer"
                    onClick={() => setSelectedSelfie(s.image_url)}>
                    <Image src={s.image_url} alt={s.description} width={200} height={200} className={`rounded-lg border-2 ${selectedSelfie===s.image_url? 'border-blue-500': 'border-transparent'}`} />
                  </div>
                ))}
              </div>
              <button onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow">
                ›
              </button>
            </div>
            
            {selectedSelfie && (
            <div className="mt-4 text-center">
              <h2 className="font-bold">Selected Selfie</h2>
              <Image
                src={selectedSelfie}
                alt="Selected Selfie"
                width={200}
                height={200}
                className="rounded-lg mx-auto"
              />
            </div>
          )}
            {selectedItem && (
              <div className="mt-6 text-center place-items-center">
                <h2 className="font-bold">Selected Item</h2>
                <Image
                  src={selectedItem.s3url}
                  alt={selectedItem.description}
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
                {/* <p>{selectedItem.description}</p> */}
              </div>
            )}

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

            {selfie && (
              <div className="mt-6 text-center">
                <h2 className="font-bold">Your Selfie</h2>
                <Image src={selfie} alt="Selfie" width={200} height={200} className="rounded-lg" />
              </div>
            )}

            <div className="mt-auto">
              {!showCamera ? (
                <DarkButton text="Start Camera" onClick={() => setShowCamera(true)} />
              ) : (
                <DarkButton text="Upload Selfie" onClick={handleUploadSelfie} />
              )}
              {selectedItem && selfieUrl && (
              <p className="text-green-600">
                ✔️ You’ve selected both a garment and a selfie—ready to try on!
              </p>
            )}
              <DarkButton text="Try-On" onClick={handleFashnTryOn} disabled={isTryOnDisabled} />
              {tryOnStatus && (
                <div className="mt-6 text-center">
                  {tryOnStatus.error ? (
                    <p className="text-red-600">Error: {tryOnStatus.error}</p>
                  ) : tryOnStatus.status !== "completed" ? (
                    <p>
                      {`Job ${tryOnStatus.id} is ${tryOnStatus.status.replace("_", " ")}`}…
                    </p>
                  ) : null}
                </div>
              )}

              {tryOnImage && (
                <div className="mt-6 text-center">
                  <h2 className="font-bold">Your Virtual Try-On</h2>
                  <Image
                    src={tryOnImage}
                    alt="Fashn Try-On Result"
                    width={300}
                    height={400}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              )}
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
