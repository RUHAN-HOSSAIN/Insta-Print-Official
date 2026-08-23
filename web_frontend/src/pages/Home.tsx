import SelectDocumentsPanel from "../components/home/SelectedDocumentsPanel";
import HowToPrint from "./HowToPrint";

const Home = () => {
  return (
    <>
      <div className=" text-black dark:bg-gray-900 dark:text-white w-full h-screen flex flex-col font-jura">
        <div className="h-18 w-full" />

        <div className="text-lg w-full h-full flex justify-between gap-10 py-15 px-30">
          <SelectDocumentsPanel />

          {/** 2. Action panel */}
          <div className="shadow-xl p-5 border-2 border-blue bg-light-blue w-full rounded-2xl flex flex-col gap-4">
            <div className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center justify-between pr-5 text-sm">
                <p className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                  Select Printer
                </p>
                <div className="text-sm font-bold bg-green-500 text-white px-2 rounded-lg">
                  On
                </div>
                {/* <div className="text-sm font-bold bg-red-500 text-white px-2 rounded-lg">Off</div> */}
              </div>
              <select className="w-full mt-2 px-2 py-1 border border-gray-300 rounded hover:bg-gray-200">
                <option value="printer1" selected>
                  Male Hall 2
                </option>
                <option value="printer1">Coming Soon...</option>
              </select>
            </div>

            <div className="bg-white border border-gray-300 p-4 rounded flex items-center gap-4">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="30px"
                  viewBox="0 -960 960 960"
                  width="30px"
                  fill="#3f3f3f"
                >
                  <path d="M160-501q0 71 47.5 122T326-322l-62-62 56-56 160 160-160 160-56-56 64-64q-105-6-176.5-81T80-500q0-109 75.5-184.5T340-760h140v80H340q-75 0-127.5 52T160-501Zm400 261v-80h320v80H560Zm0-220v-80h320v80H560Zm0-220v-80h320v80H560Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                  Live Queue status
                </p>
                <p className="font-semibold tracking-wide text-base">
                  No pending jobs
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-300 p-4 rounded flex flex-col gap-3">
              <p className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                Payment Info (Send Money to this number)
              </p>
              <div className="flex items-center gap-4 font-roboto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  viewBox="-6.6741 -11.07275 57.8422 66.4365"
                >
                  <g fill="none">
                    <path
                      fill="#DF146E"
                      d="M42.31 44.291H2.182C.981 44.291 0 43.308 0 42.107V2.186C0 .982.981 0 2.182 0H42.31c1.203 0 2.184.982 2.184 2.186v39.921c0 1.201-.981 2.184-2.184 2.184"
                    />
                    <path
                      fill="#FFF"
                      d="M31.894 24.251l-14.107-2.246 1.909 8.329zm.572-.682L21.374 8.16l-3.623 13.106zm-15.402-2.482L5.441 6.239l15.221 1.819zm-5.639-6.154l-6.449-6.08h1.695zm24.504 1.15L33.2 23.486l-4.426-6.118zM21.417 30.232l10.71-4.3.454-1.365zm-8.933 7.821l4.589-16.102 2.326 10.479zm24.099-21.914l-1.128 3.056 4.059-.07z"
                    />
                  </g>
                </svg>
                <p>BKash (01572902567)</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#3f3f3f"
                >
                  <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                </svg>
              </div>

              <div className="flex items-center gap-4 font-roboto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  viewBox="-6.6741 -11.07275 57.8422 66.4365"
                >
                  <g fill="none">
                    <path
                      fill="#DF146E"
                      d="M42.31 44.291H2.182C.981 44.291 0 43.308 0 42.107V2.186C0 .982.981 0 2.182 0H42.31c1.203 0 2.184.982 2.184 2.186v39.921c0 1.201-.981 2.184-2.184 2.184"
                    />
                    <path
                      fill="#FFF"
                      d="M31.894 24.251l-14.107-2.246 1.909 8.329zm.572-.682L21.374 8.16l-3.623 13.106zm-15.402-2.482L5.441 6.239l15.221 1.819zm-5.639-6.154l-6.449-6.08h1.695zm24.504 1.15L33.2 23.486l-4.426-6.118zM21.417 30.232l10.71-4.3.454-1.365zm-8.933 7.821l4.589-16.102 2.326 10.479zm24.099-21.914l-1.128 3.056 4.059-.07z"
                    />
                  </g>
                </svg>
                <p>Nagad (01572902567)</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#3f3f3f"
                >
                  <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                </svg>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter Transaction ID"
                  className="w-full px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
                />
              </div>
            </div>

            <div className="flex gap-10 justify-between">
              <div className="flex-3 border">
                <div className="flex flex-col font-black text-base p-2">
                  <h4>Total Pages</h4>
                  <h4>Color: <span className="font-roboto ml-5">20</span></h4>
                  <h4>B & W: <span className="font-roboto ml-5">0</span></h4>
                </div>
                <div className="flex gap-1 font-black text-xl items-center border-t p-2">
                  <p>Total Cost:</p>
                  <p className="font-roboto ml-5">10.00 /=</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-2">
                <div className="flex flex-col gap-2 border border-blue-500 px-4 py-2 rounded">
                  <div className="flex items-center justify-between gap-3">
                    <p>Cover Page?</p>
                    <input type="checkbox" className="w-4 h-4 mr-3" />
                    {/* Parent div keh click korle ai checkbox ta check hobe */}
                  </div>
                  <p className="text-sm text-gray-800">If you want to collect latter</p>
                </div>
                <button className="flex justify-center items-center gap-3 font-spaceG font-bold bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#fff"
                  >
                    <path d="M640-640v-120H320v120h-80v-200h480v200h-80Zm-480 80h640-640Zm560 100q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Zm80-240v-160q0-17-11.5-28.5T760-560H200q-17 0-28.5 11.5T160-520v160h80v-80h480v80h80Z" />
                  </svg>
                  Print Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HowToPrint />
    </>
  );
};

export default Home;

// const Home = () => {
//   return (
//     <>
//       <div className="bg-slate-50 text-black dark:bg-gray-900 dark:text-white w-full h-screen flex flex-col font-jura">
//         <div className="h-18 w-full" />

//         <div className="text-lg w-full h-full flex justify-between gap-10 py-15 px-30">
//           <div className="p-5 w-full rounded-lg flex flex-col gap-4 border border-blue">
//             <div>Select Documents</div>
//             <div>
//               <input
//                 type="file"
//                 multiple
//                 className="w-full h-30 bg-slate-100 flex border border-gray-300 rounded"
//               />
//             </div>
//             <div className="w-full bg-white flex flex-col border border-gray-300 rounded font-roboto">
//               {/* Selected files will show & Edit here! */}
//               <div className="m-4 border rounded-xl border-gray-300">
//                 <div className="flex items-center justify-between gap-4 p-2 border-b border-gray-30 text-base">
//                   <div className="flex items-center gap-4">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       height="20px"
//                       viewBox="0 -960 960 960"
//                       width="20px"
//                       fill="#123"
//                     >
//                       <path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
//                     </svg>
//                     <h2 className="line-clamp-1">Ruhan's Resume.pdf</h2>
//                   </div>
//                   <div className="shrink-0">20 Pages</div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between gap-4 p-4 text-sm">
//                     <div>
//                       <h3>copies</h3>
//                       <div>
//                         <button className="px-2 py-1 border border-gray-300 rounded-l hover:bg-gray-200">
//                           -
//                         </button>
//                         <span className="px-4 py-1 border-t border-b border-gray-300">
//                           1
//                         </span>
//                         <button className="px-2 py-1 border border-gray-300 rounded-r hover:bg-gray-200">
//                           +
//                         </button>
//                       </div>
//                     </div>
//                     <div>
//                       <h3>Color</h3>
//                       <div className="flex gap-4 bg-gray-100 p-2 rounded-2xl text-xs">
//                         <div className="px-2 py-1 rounded hover:bg-gray-200">
//                           B&W
//                         </div>
//                         <div className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-200">
//                           Color
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <h3>Page per sheet</h3>
//                       <select name="pagePerSheet" id="pagePerSheet" className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200">
//                         <option value="1">Select</option>
//                         <option value="2">2</option>
//                         <option value="4">4</option>
//                         <option value="6">6</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="flex flex-col p-4 text-sm">
//                       <h3 className="">Color</h3>
//                       <div className="flex gap-4 rounded-2xl text-xs">
//                         <div className="flex gap-4 bg-gray-100 p-2 rounded-2xl text-xs">
//                           <div className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-200">
//                             All
//                           </div>
//                           <div className="px-2 py-1  rounded hover:bg-gray-200">
//                             Custom
//                           </div>
//                         </div>
//                         <div className="flex gap-4 bg-gray-100 p-2 rounded-2xl text-xs w-full px-5">
//                           <input type="text" placeholder="e.g.1-5, 8, 11-13" />
//                         </div>
//                       </div>
//                   </div>
//                 </div>
//               </div>
//               {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/></svg> */}
//             </div>
//           </div>
//           <div className="p-5 border-2 border-fuchsia-300 w-full rounded-lg flex flex-col gap-4">
//             2
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Home;
