import { useRef, useState } from "react";

interface FileUploadBoxProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
}

const FileUploadBox = ({
  onFilesSelected,
  accept = ".pdf",
}: FileUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`w-full h-30 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
        dragActive
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
          : "border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        className="fill-gray-400 dark:fill-gray-500"
      >
        <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
      </svg>
      <p className="text-gray-500 dark:text-gray-400">
        Click or drop PDF files here
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default FileUploadBox;