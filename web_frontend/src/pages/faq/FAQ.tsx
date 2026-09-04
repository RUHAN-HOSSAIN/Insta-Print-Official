
import { useState } from "react";
import { Link } from "react-router-dom";
import { handleHeaderNavClick } from "../../utils/headerScroll";
import { faqData } from "../../constant/faqData";
import { ArrowDownIcon } from "../../assets/icons/Icons";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="relative px-7 min-[500px]:px-10 md:px-15 py-15 sm:py-20 md:py-25 lg:py-30  flex items-start justify-center max-md:flex-col gap-20  md:gap-15 lg:gap-20 font-spaceG">
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
      
      <div className="flex-1 flex flex-col gap-4 font-spaceG">
        <h4 className="text-sm sm:text-base font-bold text-blue">
          FAQ
        </h4>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Questions, <br />
          answered
        </h1>
        <p className="text-gray-700 font-roboto tracking-wider">
          Everything about uploading, pricing, privacy and delivery. Still
          stuck? We usually reply within the hour.
        </p>

        <div className="min-w-70 relative flex gap-7 bg-white border border-gray-300 rounded-xl shadow-lg p-5 mt-10">
          <div className="float-page absolute -top-3 left-5 w-12 h-16 bg-white rounded-lg shadow-md p-3 flex flex-col gap-2 border border-gray-300">
            <div className="w-4/5 h-1.5 rounded bg-blue-600" />
            <div className="w-full h-1 rounded bg-gray-300" />
            <div className="w-1/2 h-1 rounded bg-gray-300" />
            <div className="w-full h-1 rounded bg-gray-300" />
          </div>

          <div className="flex flex-col ml-16">
            <h3 className="text lg:text-lg font-semibold text-gray-800">Still need a hand?</h3>
            <Link
              to="/#contact"
              onClick={(event) =>
              handleHeaderNavClick({
                event,
                to: "/#contact",
                pathname: location.pathname,
              })
            }
              className="text-blue-700 hover:scale-102 transition-all cursor-pointer hover:pl-1 group"
            >
              Contact the Insta Print Team <span className="group-hover:pl-1 transition-all">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-2 flex flex-col gap-3 font-roboto">
          <div>
            {faqData.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => toggleFaq(index)}
                  className="mb-4 border border-gray-300 rounded bg-white px-8 py-4 shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3 cursor-pointer">
                    <h3 className="lg:text-lg font-semibold text-gray-800 tracking-wide">{index + 1}. {faq.question}</h3>
                    <ArrowDownIcon
                      className={`w-7 h-7 shadow bg-gray-50 rounded-full p-1 text-gray-400 transition-transform duration-300 ${
                        isOpen ? "rotate-0" : "rotate-180"
                      }`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 pt-3" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <p className="text-sm lg:text-base text-gray-700 tracking-wider overflow-hidden">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};

export default FAQ;



// import { Link } from "react-router-dom";
// import { handleHeaderNavClick } from "../../utils/headerScroll";
// import { faqData } from "../../constant/faq";
// import { ArrowDownIcon } from "../../assets/icons/Icons";

// const FAQ = () => {
//   return (
//     <div className="relative px-40 py-30 flex items-start justify-center gap-20">
//       <div
//           className="absolute inset-0 -z-5 pointer-events-none opacity-100"
//           style={{
//             backgroundImage: `
//                 repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px),
//                 repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px)
//               `,
//             backgroundSize: "40px 40px",
//           }}
//         />
      
//       <div className="flex-1 flex flex-col gap-4 font-spaceG">
//         <h4 className="text-sm sm:text-base font-bold text-blue">
//           FAQ
//         </h4>
//         <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
//           Questions, <br />
//           answered
//         </h1>
//         <p className="text-gray-700 font-roboto tracking-wider">
//           Everything about uploading, pricing, privacy and delivery. Still
//           stuck? We usually reply within the hour.
//         </p>

//         <div className="min-w-70 relative flex gap-7 bg-white border border-gray-300 rounded-xl shadow-lg p-5 mt-10">
//           <div className="float-page absolute -top-3 left-5 w-12 h-16 bg-white rounded-lg shadow-md p-3 flex flex-col gap-2 border border-gray-300">
//             <div className="w-4/5 h-1.5 rounded bg-blue-600" />
//             <div className="w-full h-1 rounded bg-gray-300" />
//             <div className="w-1/2 h-1 rounded bg-gray-300" />
//             <div className="w-full h-1 rounded bg-gray-300" />
//           </div>

//           <div className="flex flex-col ml-16">
//             <h3 className="text-lg font-semibold text-gray-800">Still need a hand?</h3>
//             <Link
//               to="/#contact"
//               onClick={(event) =>
//               handleHeaderNavClick({
//                 event,
//                 to: "/#contact",
//                 pathname: location.pathname,
//               })
//             }
//               className="text-blue-700 hover:scale-102 transition-all cursor-pointer"
//             >
//               Contact the Insta Print Team →
//             </Link>
//           </div>
//         </div>
//       </div>

//       <div className="flex-2 flex flex-col gap-3 font-roboto">
//           <div>
//             {faqData.map((faq, index) => (
//               <div key={index} className="mb-4 border border-gray-300 rounded bg-white px-6 py-4 shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer">
//                 <div className="flex items-center justify-between cursor-pointer">
//                   <h3 className="text-lg font-semibold text-gray-800 tracking-wide">{index + 1}. {faq.question}</h3>
//                   <ArrowDownIcon className="w-7 h-7 bg-gray-100 rounded-full p-1 text-gray-400 rotate-0" />
//                 </div>
//                 {/* <p className="text-gray-700 tracking-wide pt-3">{faq.answer}</p> */}
//               </div>
//             ))}
//           </div>
//       </div>
//     </div>
//   );
// };

// export default FAQ;
