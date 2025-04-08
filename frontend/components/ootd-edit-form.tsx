// ootd-edit-form.tsx
import { useState } from "react";

type Props = {
  date: string;
  onCancel: () => void;
};

const TAG_OPTIONS = ["Work", "Casual", "Date Night", "Rainy", "Comfy", "Formal"];

export default function OOTDEditForm({ date, onCancel }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    //Send to backend (upload to S3, save to DB)
    console.log({ image, notes, tags });
    onCancel();
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <img src={preview} alt="Preview" className="rounded-lg w-full object-cover" />
      ) : (
        <label className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer block text-gray-500">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          Click or drag image here
        </label>
      )}

      <textarea
        className="w-full border border-gray-300 rounded-lg p-2"
        rows={3}
        placeholder="Write outfit notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {TAG_OPTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`px-8 py-1 rounded-full text-lg border ${
              tags.includes(tag)
                ? "bg-black text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-12 pt-8 ">
        <button
          onClick={onCancel}
          className="text-gray-500 underline"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-black text-white min-w-48 py-2 rounded-xl"
        >
          Save
        </button>
      </div>
    </div>
  );
}
