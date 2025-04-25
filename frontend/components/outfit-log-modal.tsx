import { useState } from "react";
import { Button } from "@/components/imported-ui/button";
import { useRouter } from "next/router";

type Props = {
  onClose: () => void;
};

export default function OutfitLogModal({ onClose }: Props) {
  const router = useRouter();
  const { id } = router.query;
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogOutfit = async () => {
    if (!id) {
      console.error('No outfit ID found');
      return;
    }

    try {
      setIsLogging(true);
      console.log('Logging outfit with ID:', id, 'and date:', selectedDate);
      
      const response = await fetch(`/api/outfits/${id}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to log outfit');
      }

      console.log('Outfit logged successfully');
      onClose();
      router.push('/ootd-calendar');
    } catch (error) {
      console.error('Error logging outfit:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-4">Log Outfit Date</h2>
          <p className="text-gray-500 mb-4">
            Select the date when you wore this outfit
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="default"
            onClick={onClose}
            className="border-heart-red border-[1px] hover:bg-heart-red"
          >
            <p className="text-heart-red text-lg hover:text-white">
              Cancel
            </p>
          </Button>
          <Button
            variant="default"
            onClick={handleLogOutfit}
            className="border-heart-red border-[1px] hover:bg-heart-red"
            disabled={isLogging}
          >
            {isLogging ? (
              <p className="text-heart-red text-lg">Logging...</p>
            ) : (
              <p className="text-heart-red text-lg hover:text-white">
                Log Outfit
              </p>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 