
const Service = ["Products", "About Us", "Contact", "Your Prints"];
const Legal = ["Terms & Conditions", "Refund & Return Policy", "Cancellation Policy", "Privacy Policy"];

const Footer = () => {
  return (
    <>
      <div className="dark:bg-slate-900 font-spaceG flex justify-between items-start px-50 mt-5 py-15 border-t border-gray-200 dark:border-gray-800">

        {/* Company links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
            Company
          </h4>
          {Service.map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase().replace(" ", "-")}`}
              className="hover:underline underline-offset-2 text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
          
        </div>

        {/* Legal links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
            Legal
          </h4>
          {Legal.map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase().replace(" ", "-")}`}
              className="hover:underline underline-offset-2 text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
          
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
            Send feedback
          </h4>
          <div>
            <textarea
              placeholder="Your feedback..."
              className="w-full h-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            ></textarea>
            <button className="shadow-xl  font-spaceG mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Submit
            </button>
          </div>
        </div>
      </div>
      <div className="font-jura flex justify-between items-center px-30 py-5 bg-slate-100 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          Found Us on:
          <a href="https://www.facebook.com/yourcompany" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
            Whatsapp
          </a>

        </div>
        <div>Copyright © {new Date().getFullYear()}. All rights reserved.</div>
      </div>
    </>
  );
};

export default Footer;
