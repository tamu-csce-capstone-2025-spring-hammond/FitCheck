interface ToggleSliderProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function ToggleSlider({ isOn, onToggle }: ToggleSliderProps) {
    return (
      <div className="flex items-center gap-4">
        <span className={`bold ${isOn ? 'text-gray-400' : 'text-accent '}`}>Items</span>
        <button
          onClick={onToggle}
          className={`relative w-14 h-7 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${
            isOn ? 'bg-black' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
              isOn ? 'translate-x-7' : 'translate-x-0'
            }`}
          ></div>
        </button>
        <span className={`bold ${isOn ? 'text-accent ' : 'text-gray-400'}`}>Outfits</span>
      </div>
    );
  }
  