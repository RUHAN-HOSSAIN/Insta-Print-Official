// Body.tsx
import { useState, useCallback } from "react";
import FileUploadBox from "../../components/print/FileUploadBox";
import SelectedFileCard from "../../components/print/SelectedFileCard";
import { CopyIcon } from "../../assets/icons/Icons";
import PrinterStatus from "./PrinterStatus";

const Body = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf",
    );
    if (files.length > 0) handleFilesSelected(files);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div style={{ height: "var(--header-height, 72px)" }} />

      <div className="relative px-20 py-10">
        {/* background pattern */}
        <div
          className="absolute inset-0 -z-5 pointer-events-none opacity-100"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative grid grid-cols-2 gap-25 p-10">
          {/* ─── LEFT ─── */}
          <div className="flex flex-col gap-6 p-10 pt-15 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] bg-white rounded-lg h-fit">
            <FileUploadBox
              onFilesSelected={handleFilesSelected}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-4 font-roboto">
                {selectedFiles.map((file, index) => (
                  <SelectedFileCard
                    key={index}
                    file={file}
                    index={index}
                    onRemove={handleFileRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT ─── */}
          <div className="flex-1 sticky top-24 self-start p-10 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] bg-white rounded-lg">
            <PrinterStatus />

            <div className="flex flex-col gap-3 mt-10 shadow-[0px_0px_4px_rgba(0,0,0,0.2)] p-5 border border-gray-300 rounded-lg">
              <h2 className="font-spaceG text-lg font-bold">Pay via (Send Money)</h2>
              <div>
                <div className="flex items-center gap-5 my-2 mr-2">
                  BKash: 017XXXXXXXX <CopyIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex items-center gap-5 my-2 mr-2">
                  Nagad: 017XXXXXXXX <CopyIcon className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-7 my-5 mr-2">
              <div className="shadow-[0px_0px_4px_rgba(0,0,0,0.2)] border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between gap-3 w-full">
                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="w-full focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-gray-700 shrink-0">
                <p className="text-sm">cover letter<sup>?</sup> (optional)</p>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            </div>

            <div className="flex justify-between items-center text-2xl my-4 mx-2">
              <h2 className="font-medium text-gray-900">Total Price</h2>
              <div className="font-bold text-blue-700 text-3xl flex items-baseline gap-2">
                <h3 className="font-normal text-lg text-gray-500 line-through">5.73</h3>
                <h1>৳ 5</h1>
              </div>
            </div>

            <div className="w-full">
              <button className="w-full font-bold bg-green-600 text-white px-4 py-2 rounded-lg hover:scale-102 transition-transform">
                Start Printing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Body;



// // Body.tsx — শুধু left side এর drag-drop অংশটুকু
// import { useState, useCallback } from "react";
// import FileUploadBox from "../../components/print/FileUploadBox";
// import { CloseIcon, CopyIcon } from "../../assets/icons/Icons";

// import PrinterStatus from "./PrinterStatus";

// const Body = () => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

//   const handleFilesSelected = useCallback((files: File[]) => {
//     setSelectedFiles((prev) => [...prev, ...files]);
//   }, []);

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => setIsDragging(false);

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = Array.from(e.dataTransfer.files).filter(
//       (f) => f.type === "application/pdf",
//     );
//     if (files.length > 0) handleFilesSelected(files);
//   };

//   const handleFileRemove = (index: number) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <>
//       <div style={{ height: "var(--header-height, 72px)" }} />

//       <div className="relative px-20 py-10">
//         {/* background pattern */}
//         <div
//           className="absolute inset-0 -z-5 pointer-events-none opacity-100"
//           style={{
//             backgroundImage: `
//                 repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px),
//                 repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px)
//               `,
//             backgroundSize: "40px 40px",
//           }}
//         />

//         <div className="relative grid grid-cols-2 gap-25 p-10">
//           {/* ─── LEFT: File upload + selected file list ─── */}
//           <div className="flex-1 flex flex-col gap-10 p-10 pt-15 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] bg-white rounded-lg h-fit">
//             {/* Drag & drop box — selectedFiles.length === 0 হলে বড়ো দেখাবে, file থাকলে compact হবে পরে */}
//             <FileUploadBox
//               onFilesSelected={handleFilesSelected}
//               isDragging={isDragging}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//             />

//             {/* TODO: SelectedFileCard list — selectedFiles.map(...) */}
//             {/* প্রতিটা card এ: filename, B&W/Color toggle, Copies counter, Page range (All/Custom) */}
//             <div className="flex flex-col gap-4 font-roboto">
//               {selectedFiles.length > 0 ? (
//                 <div className="flex flex-col gap-4">
//                   {selectedFiles.map((file, index) => (
//                     <div
//                       key={index}
//                       className="bg-white px-8 py-6  shadow-md border border-gray-300"
//                     >
//                       <div className="flex justify-between items-center gap-5 border-b-2 border-gray-300 pb-3">
//                         <h2 className="font-medium text-gray-900 line-clamp-1 overflow-auto">
//                           {file.name}
//                         </h2>
//                         <div className="flex items-center gap-4">
//                           <div className="shrink-0 bg-gray-50 border border-gray-200 shadow text-gray-700 px-3 py-1 rounded-full text-sm hover:scale-102 transition-transform">
//                             5 pages
//                           </div>
//                           <button
//                             type="button"
//                             className="font-medium"
//                             onClick={() => handleFileRemove(index)}
//                           >
//                             <CloseIcon className="text-white bg-red-700 rounded hover:scale-102" />
//                           </button>
//                         </div>
//                       </div>

//                       <div className="flex flex-col gap-3 pt-4">
//                         <div className="flex justify-between items-center gap-5 border border-gray-50 rounded px-4 py-2 shadow-[0px_0px_4px_rgba(0,0,0,0.2)]">
//                           <div>Color Printing</div>
//                           <div className="flex items-center justify-start px-3  py-1  rounded-full bg-gray-200">
//                             <div className="p-3 rounded-full bg-white"></div>
//                           </div>
//                         </div>

//                         <div className="flex justify-between items-center gap-5 border border-gray-50 rounded px-4 py-2 shadow-[0px_0px_4px_rgba(0,0,0,0.2)]">
//                           <div>Copies</div>
//                           <div className="flex items-center justify-start px-3  py-1  rounded-full bg-gray-200">
//                             - 1 +
//                           </div>
//                         </div>
                        
                        
//                       </div>

//                       <div className="mt-4 pt-4 px-1 flex justify-between items-center border-t-2 border-gray-300 text-gray-700">
//                         <div>5p &times; B&W &times; 1 :</div>
//                         <div>৳ 5</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : null}
//             </div>
//           </div>

//           {/* ─── RIGHT: Sticky order summary panel ─── */}
//           <div className="flex-1 sticky top-24 self-start p-10 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] bg-white rounded-lg">
//             {/* TODO: Printer selector dropdown (online/offline status) */}
//             {/* TODO: Payment info (bKash/Nagad number) */}
//             {/* TODO: Price breakdown */}
//             {/* TODO: Add cover letter button */}
//             {/* TODO: Pay Now button */}

//             <PrinterStatus />

//             <div className="flex flex-col gap-3 mt-10 shadow-[0px_0px_4px_rgba(0,0,0,0.2)] p-5 border border-gray-300 rounded-lg">
//               <h2 className="font-spaceG text-lg font-bold">Pay via (Send Money)</h2>
//               <div>
//                 <div className="flex items-center gap-5 my-2 mr-2">
//                   BKash: 017XXXXXXXX <CopyIcon className="w-5 h-5 text-gray-700" />
//                 </div>
//                 <div className="flex items-center gap-5 my-2 mr-2">
//                   Nagad: 017XXXXXXXX <CopyIcon className="w-5 h-5 text-gray-700" />
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-between gap-7 my-5 mr-2">
//               <div className="shadow-[0px_0px_4px_rgba(0,0,0,0.2)] border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between gap-3 w-full">
//                 <input
//                   type="text"
//                   placeholder="Transaction ID"
//                   className="w-full"
//                 />
//               </div>
//               <div className="flex items-center text-gray-700">
//                 <p>cover letter<sup>?</sup> (optional)</p>
//                 <input type="checkbox" className="w-7 h-7" />
//               </div>
//             </div>

//             <div className="flex justify-between items-center text-2xl my-4 mx-2">
//               <h2 className="font-medium text-gray-900">Total Price</h2>
//               <div className="font-bold text-blue-700 text-3xl flex items-baseline gap-2">
//                 <h3 className="font-normal text-lg text-gray-500 line-through">
//                   5.73
//                 </h3>
//                 <h1>৳ 5</h1>
//               </div>
//             </div>
//             <div className="w-full">
//               <button className="w-full font-bold bg-green-600 text-white px-4 py-2 rounded-lg hover:scale-102 transition-transform">
//                 Start Printing
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Body;
