"use client";
import { useState } from "react";

export default function FileUpload({ label, onChange }: any) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFile = (file: File) => {
    if (!file) return;

    onChange(file);
    setFileName(file.name);

    if (file.type.startsWith("image")) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: any) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const removeFile = () => {
    setPreview(null);
    setFileName("");
    onChange(null);
  };

  return (
    <div className="space-y-3">

      {/* LABEL */}
      <p className="text-sm text-gray-300">{label}</p>

      {/* DROP AREA */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition"
      >
        <input type="file" className="hidden" onChange={handleChange} />

        {!fileName ? (
          <>
            <div className="text-yellow-400 text-2xl">📁</div>
            <p className="text-sm text-gray-400">
              Drag & drop or click to upload
            </p>
          </>
        ) : (
          <p className="text-sm text-green-400">{fileName}</p>
        )}
      </div>

      {/* PREVIEW */}
      {preview && (
        <img
          src={preview}
          className="w-28 h-28 object-cover rounded-lg border border-white/10"
        />
      )}

      {/* REMOVE BUTTON */}
      {fileName && (
        <button
          onClick={removeFile}
          className="text-red-400 text-sm hover:underline"
        >
          Remove file
        </button>
      )}

    </div>
  );
}