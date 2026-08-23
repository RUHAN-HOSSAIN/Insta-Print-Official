import { useState } from "react";
import FileUploadBox from "./FileUploadBox";
import SelectedFileCard from "./SelectedFileCard";
import {
  DEFAULT_PRINT_OPTIONS,
  type SelectedFile,
  type PrintFileOptions,
} from "../../types/Print.types";

interface SelectDocumentsPanelProps {
  onFilesChange?: (files: SelectedFile[]) => void;
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;



const SelectDocumentsPanel = ({ onFilesChange }: SelectDocumentsPanelProps) => {
  const [files, setFiles] = useState<SelectedFile[]>([]);

  const updateFiles = (next: SelectedFile[]) => {
    setFiles(next);
    onFilesChange?.(next);
  };

  const handleFilesSelected = (newFiles: File[]) => {
    const newItems: SelectedFile[] = newFiles.map((file) => ({
      id: makeId(),
      file,
      totalPages: null, // filled in later once backend processes the file
      options: { ...DEFAULT_PRINT_OPTIONS },
    }));
    updateFiles([...files, ...newItems]);
  };

  const handleOptionsChange = (id: string, options: PrintFileOptions) => {
    updateFiles(
      files.map((item) => (item.id === id ? { ...item, options } : item))
    );
  };

  const handleRemove = (id: string) => {
    updateFiles(files.filter((item) => item.id !== id));
  };

  return (
    <div className="shadow-xl p-5 w-full rounded-2xl flex flex-col gap-4 border-2 bg-light-blue border-blue dark:border-blue-900/40">
      <div className="flex items-center justify-between">
        <div className="text-xl text-gray-800 dark:text-gray-100">
          Select Documents
        </div>
        <button className="ml-auto hover:bg-blue-500 text-gray-900 hover:text-white font-bold px-4 py-1 rounded border border-blue">Clear</button>
      </div>

      <FileUploadBox onFilesSelected={handleFilesSelected} />
      

      {files.length > 0 && (
        <div className="w-full flex flex-col gap-3">
          {files.map((item) => (
            <SelectedFileCard
              key={item.id}
              item={item}
              onOptionsChange={handleOptionsChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDocumentsPanel;