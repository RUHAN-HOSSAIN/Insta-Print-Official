import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { company, legal, socialMedia } from "../constant/footerData";
import { FacebookIcon, WhatsappIcon } from "../assets/icons/Icons.tsx";
import { handleHeaderNavClick } from "./utils/headerScroll";

const Footer = () => {
  const location = useLocation();

  return (
    <>
      <div className=" bg-linear-to-tr from-blue-700 to-blue-300  font-spaceG flex max-sm:flex-col-reverse justify-between items-start px-10 min-[500px]:px-15 min-[800px]:px-25 lg:px-35 xl:px-50 mt-5 py-10 min-[500px]:py-15 sm:py-20 lg:py-30 border-t border-gray-200">
        <div className="flex-6/10 w-full flex max-[400px]:flex-col gap-15 justify-between max-sm:pt-20 max-sm:pb-10 sm:pr-20 md:pr-30 lg:pr-50">
          {/* Company links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
              Company
            </h4>
            {company.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                onClick={(event) =>
                  handleHeaderNavClick({
                    event,
                    to: item.to,
                    pathname: location.pathname,
                  })
                }
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

        <div className="flex-3/10 flex flex-col gap-3">
          <h4 className="text-base font-semibold tracking-wider uppercase mb-5">
            Send feedback
          </h4>

          <textarea
            placeholder="Your feedback..."
            className="w-full h-24 p-2 border border-gray-500 max-sm:border-2 tracking-wider text-gray-900 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500  font-spaceG"
          />

          <button className="shadow-xl font-spaceG mt-4 px-4 py-2 bg-blue-600 font-semibold text-white rounded hover:bg-blue-700 hover:scale-102 transition-all">
            Submit
          </button>
        </div>
      </div>

      <div className="bg-dark-blue-1 text-white rounded-t-2xl mx-5 mt-2 backdrop-blur-2xl shadow-[0_-3px_15px_rgba(0,0,0,0.5)] font-jura max-[420px]:text-sm flex max-sm:flex-col gap-4 justify-between items-center px-10 md:px-20 min-[900px]:px-25 lg:px-30 py-5">
        <div className="flex items-center justify-center gap-5">
          Found Us on:
          {socialMedia.map(
            (item: { title: string; to: string }, index: number) => (
              <a
                key={index}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 p-1 rounded-full border border-slate-300 shadow-2xl hover:scale-115 transition-all"
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
        <div className="text-center">
          Insta Print © {new Date().getFullYear()}. Created with ❤️ by Ruhan.
        </div>
      </div>
    </>
  );
};

export default Footer;
