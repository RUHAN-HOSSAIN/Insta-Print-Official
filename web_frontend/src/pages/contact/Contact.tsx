
import { contactData, type ContactItem } from "../../constant/constactData";

const ContactUs = () => {
  return (
    <div className="bg-radial from-blue-100 px-7 min-[500px]:px-10 md:px-15 py-15 sm:py-20 md:py-25 lg:py-30 font-spaceG">
      <div className="flex flex-col gap-4 items-center justify-center">
        <h4 className="text-sm sm:text-base font-bold text-blue">
          Contact Us
        </h4>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          For Query Get in Touch
        </h1>

        <h3 className="font-roboto text-[13px] sm:text-[15px] tracking-wider text-gray-600 max-w-2xl text-center">
          Have questions or need assistance with your printing? Our team is
          here to help. Reach out to us through any of the following channels.
        </h3>
      </div>

      <div className="font-roboto flex flex-wrap items-center justify-center gap-10 max-sm:gap-20 mt-20">
        {contactData.map((item: ContactItem) => (
          <div
            key={item.id}
            className="flex flex-col gap-7 p-10 sm:px-15 lg:px-20 md:py-15 rounded-xl bg-white max-w-md shadow-xl"
          >
            <div className="flex items-center justify-center">
              <item.icon
                className={`${item.iconClassName} w-15 rounded-lg border border-gray-100 shadow p-2`}
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-5 mt-3">
              <h2 className="text-2xl font-bold">{item.title}</h2>

              <h4 className="text-center text-gray-500 leading-relaxed">
                {item.description}
              </h4>

              {item.phone && (
                <h2 className="text-lg font-semibold text-gray-700">
                  {item.phone}
                </h2>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactUs;





// import { LocationIcon, CallIcon, WhatsappIcon } from "../../assets/icons/Icons"

// const ContactUs = () => {
//   return (
//     <div className="bg-radial from-blue-100 px-7 min-[500px]:px-10 md:px-15 py-15 sm:py-20 md:py-25 lg:py-30 font-spaceG">
//       <div className="flex flex-col gap-4 items-center justify-center">
//         <h4 className="text-sm sm:text-base font-bold text-blue">Contact Us</h4>
//         <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">For Query Get in Touch</h1>
//         <h3 className="text-[13px] sm:text-[15px] tracking-wider text-gray-600 max-w-2xl text-center">
//           Have questions or need assistance with your printing? Our team is here to help. Reach out to us through any of the following channels.
//         </h3>
//       </div>

//       <div className="font-roboto flex flex-wrap items-center justify-center gap-10 max-sm:gap-20 mt-20">
        
//         <div className="flex flex-col gap-7 p-10 sm:px-15 lg:px-20 md:py-15 rounded-xl bg-white max-w-md shadow-xl">
//           <div className="flex items-center justify-center">
//             <LocationIcon className="text-blue-500 w-15 rounded-lg  border border-gray-100 shadow p-2" />
//           </div>
//           <div className="flex flex-col items-center justify-center gap-5 mt-3">
//             <h2 className="text-2xl font-bold">Our Location</h2>
//             <h4 className="text-center text-gray-500 leading-relaxed">
//               Room 204, New Male Hall-2<br />
//               RUET Campus<br />
//               Rajshahi-6204, Bangladesh
//             </h4>
//           </div>
//         </div>

//         <div className="flex flex-col gap-7 p-10 sm:px-15 lg:px-20 md:py-15 rounded-xl bg-white max-w-md shadow-xl">
//           <div className="flex items-center justify-center">
//             <WhatsappIcon className="text-green-500 w-15 rounded-lg  border border-gray-100 shadow p-2" />
//           </div>
//           <div className="flex flex-col items-center justify-center gap-5 mt-3">
//             <h2 className="text-2xl font-bold">Whatsapp Support</h2>
//             <h4 className="text-center text-gray-500 leading-relaxed">
//               Available 24/7 <br />
//               except during class hours
//             </h4>
//             <h2 className="text-xl font-bold text-gray-700">01572902567</h2>
//           </div>
//         </div>
        
//         <div className="flex flex-col gap-7 p-10 sm:px-15 lg:px-20 md:py-15 rounded-xl bg-white max-w-md shadow-xl">
//           <div className="flex items-center justify-center">
//             <CallIcon className="text-blue-500 w-15 rounded-lg  border border-gray-100 shadow p-2" />
//           </div>
//           <div className="flex flex-col items-center justify-center gap-5 mt-3">
//             <h2 className="text-2xl font-bold">Phone Support</h2>
//             <h4 className="text-center text-gray-500 leading-relaxed">
//               Available Sat-Fri, 9 pm - 12 am
//             </h4>
//             <h2 className="text-xl font-bold text-gray-700">01572902567</h2>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ContactUs