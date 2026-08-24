import { Link } from "react-router-dom";

import { company, legal, socialMedia } from "../constant/footerData";
import { FacebookIcon, WhatsappIcon } from "../assets/icons/Icons.tsx";

const Footer = () => {
  return (
    <>
      <div className="bg-linear-to-tr from-blue-500 to-white from-30% font-spaceG flex max-sm:flex-col-reverse justify-between items-start px-10 min-[500px]:px-15 min-[800px]:px-25 lg:px-35 xl:px-50 mt-5 py-10 min-[500px]:py-15 sm:py-20 lg:py-30 border-t border-gray-200">
        {/* Company links */}
        <div className="flex-2 w-full flex max-[400px]:flex-col gap-15 justify-between max-sm:mt-20 sm:mr-20 md:mr-30 lg:mr-50">
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
              Company
            </h4>
            {company.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="hover:underline underline-offset-3 text-base text-gray-900  hover:text-gray-950 hover:scale-102  transition-all"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
              Legal
            </h4>
            {legal.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="hover:underline underline-offset-3 text-base text-gray-900  hover:text-gray-950 hover:scale-102  transition-all"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
            Send feedback
          </h4>

          <textarea
            placeholder="Your feedback..."
            className="w-full h-24 p-2 border border-gray-500 max-sm:border-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500  font-spaceG"
          />

          <button className="shadow-xl font-spaceG mt-4 px-4 py-2 bg-blue-600 font-semibold text-white rounded hover:bg-blue-700 hover:scale-102 transition-all">
            Submit
          </button>
        </div>
      </div>

      <div className="font-jura flex max-sm:flex-col gap-4 justify-between items-center px-10 md:px-20 min-[900px]:px-25 lg:px-30 py-5 bg-gray-700 text-white ">
        <div className="flex items-center justify-center gap-5">
          Found Us on:
          {socialMedia.map(
            (item: { title: string; to: string }, index: number) => (
              <a
                key={index}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 p-1 rounded-full border border-slate-200 shadow-lg hover:scale-115 transition-all"
              >
                {item.title === "WhatsApp" ? (
                  <WhatsappIcon className="text-green-500 w-4 sm:w-5 lg:w-6" />
                ) : (
                  <FacebookIcon className="text-blue-600 w-4 sm:w-5 lg:w-6" />
                )}
              </a>
            ),
          )}
        </div>
        <div>
          All rights reserved. © {new Date().getFullYear()} Insta Print
        </div>
      </div>
    </>
  );
};

export default Footer;
