import { useState } from 'react';

export default function VirtualTryOn() {
  const [personImage, setPersonImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [personImageUrl, setPersonImageUrl] = useState(null);
  const [clothingImageUrl, setClothingImageUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePersonImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonImage(reader.result);
      };
      reader.readAsDataURL(file);
      uploadImage(file).then(url => setPersonImageUrl(url));
    }
  };

  const handleClothingImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClothingImage(reader.result);
      };
      reader.readAsDataURL(file);
      uploadImage(file).then(url => setClothingImageUrl(url));
    }
  };

  const uploadImage = async (file) => {
    // Using Cloudinary for this example
    // Note: You'd need to set up your own Cloudinary account and configuration
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'virtual-try-on'); // Replace with your upload preset

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`, // Replace with your cloud name
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
      return null;
    }
  };

  const handleTryOn = async () => {
    if (!personImageUrl || !clothingImageUrl) {
      setError('Please upload both person and clothing images');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/virtual-try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personImageUrl,
          clothingImageUrl,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process virtual try-on');
      }
      
      setResultUrl(data.resultUrl);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Try-On</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Person Image</h2>
          <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
            {personImage ? (
              <img 
                src={personImage} 
                alt="Person" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No image</span>
            )}
          </div>
          <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition">
            Upload Person
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePersonImageChange}
            />
          </label>
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Clothing Image</h2>
          <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
            {clothingImage ? (
              <img 
                src={clothingImage} 
                alt="Clothing" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No image</span>
            )}
          </div>
          <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition">
            Upload Clothing
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleClothingImageChange}
            />
          </label>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={handleTryOn}
          disabled={loading || !personImageUrl || !clothingImageUrl}
          className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition"
        >
          {loading ? 'Processing...' : 'Try On Clothing'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="text-center mb-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Processing your images. This may take a minute...</p>
        </div>
      )}
      
      {resultUrl && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Result</h2>
          <div className="flex justify-center">
            <img 
              src={resultUrl} 
              alt="Virtual Try-On Result" 
              className="max-w-full max-h-96 rounded-lg shadow"
            />
          </div>
        </div>
      )}
    </div>
  );
}