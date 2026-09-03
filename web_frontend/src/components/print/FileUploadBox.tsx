// components/print/FileUploadBox.tsx
import { useRef } from "react";
import { UploadIcon } from "../../assets/icons/Icons";

interface FileUploadBoxProps {
  onFilesSelected: (files: File[]) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

const FileUploadBox = ({
  onFilesSelected,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: FileUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFilesSelected(files);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div
      className={`font-roboto relative rounded-2xl border-4 border-dashed transition-all duration-200 px-8 py-6 flex flex-col items-center justify-center gap-7 cursor-pointer select-none
        ${
          isDragging
            ? "border-blue-700 bg-slate-50"
            : "border-blue-600 bg-white"
        }`}
      onClick={handleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Floating PDF card */}
      <div className="float-page absolute -top-12 -right-6 lg:right-5 lg:w-20 lg:h-26 bg-white rounded-lg shadow-md p-3 flex flex-col gap-2 border border-gray-300">
        <div className="w-1/2 h-1.5 rounded bg-purple-500" />
        <div className="w-full h-1 rounded bg-blue-300" />
        <div className="w-4/5 h-1 rounded bg-yellow-300" />
        <div className="w-full h-1 rounded bg-pink-300" />
        <div className="flex text-[10px] text-black px-3 bg-blue-100 m-auto rounded-lg">
          PDF
        </div>
      </div>

      {/* Main text */}
      <p className="font-spaceG text-lg md:text-[22px] font-bold text-gray-900 mt-4 text-center text-shadow-sm">
        Drag &amp; drop your File here
      </p>

      {/* Button */}
      <button
        type="button"
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-102 hover:transition-transform active:scale-95 transition-all text-white shadow-[0px_4px_6px_rgba(0,0,0,0.3)]"
        onClick={(e) => {
          e.stopPropagation(); // avoid double trigger from parent div
          handleClick();
        }}
      >
        <UploadIcon className="w-6 h-6 text-shadow-lg" />
        <p className="text-sm md:text-base font-medium">or click to choose a file</p>
      </button>

      {/* Subtext */}
      <p className="text-xs md:text-sm text-gray-500 font-light italic">(Keep 15 MB max file size)</p>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default FileUploadBox;
