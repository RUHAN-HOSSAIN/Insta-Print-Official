import { pricingData } from "../../constant/pricing";

const PrintRates = () => {
  return (
    <div className="relative px-7 min-[500px]:px-10 md:px-15 py-15 sm:py-20 md:py-25 lg:py-30 font-spaceG">
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

      <div className="flex flex-col gap-4 items-center justify-center">
        <h4 className="text-sm sm:text-base font-bold text-blue">
          Printing Cost
        </h4>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Pay Only for what you print
        </h1>
      </div>

      <div className="font-roboto flex max-sm:flex-col items-center justify-center sm:gap-10 md:gap-15 max-sm:gap-20 mt-20">
        <div className="bg-white min-w-70 relative flex flex-col gap-7 border border-gray-300 rounded-xl shadow-lg p-5 w-1/3 hover:scale-105 transition-transform duration-300">
          <div className="float-page absolute -top-5 right-5 w-16 h-20 bg-white rounded-lg shadow-md p-3 flex flex-col gap-2 border border-gray-300">
            <div className="w-1/2 h-1.5 rounded bg-gray-800" />
            <div className="w-full h-1 rounded bg-gray-300" />
            <div className="w-4/5 h-1 rounded bg-gray-300" />
            <div className="w-full h-1 rounded bg-gray-300" />
          </div>

          <h2 className="font-bold text-[20px] sm:text-[22px] md:text-[24px]">
            {pricingData[0].mode}
          </h2>
          <p className="text-md text-gray-700">
            From{" "}
            <span className="font-bold text-[34px] sm:text-[36px] md:text-[40px] px-2 sm:px-3 lg:px-4 text-blue-500">
              {pricingData[0].price} Tk
            </span>{" "}
            per page
          </p>
          <p className="text-sm text-gray-500">
            Report, Assignment, Notes and everyday Printing
          </p>
          <p className="text-green-700">Discounts grow the more you print</p>
        </div>

        <div className="min-w-70 relative bg-linear-to-tr from-blue-700 from-30% to-light-blue flex flex-col gap-7 border border-gray-300 rounded-xl shadow-lg p-5 w-1/3 hover:scale-105 transition-transform duration-300">
          <div className="float-page absolute -top-5 right-5 w-16 h-20 bg-white rounded-lg shadow-md p-3 flex flex-col gap-2 border border-gray-300">
            <div className="w-1/2 h-1.5 rounded bg-purple-500" />
            <div className="w-full h-1 rounded bg-blue-300" />
            <div className="w-4/5 h-1 rounded bg-yellow-300" />
            <div className="w-full h-1 rounded bg-pink-300" />
          </div>

          <h2 className="font-bold text-[20px] sm:text-[22px] md:text-[24px] text-white">
            {pricingData[1].mode}
          </h2>
          <p className="text-md text-gray-200">
            From{" "}
            <span className="font-bold text-[34px] sm:text-[36px] md:text-[40px] px-2 sm:px-3 lg:px-4 text-white">
              {pricingData[1].price} Tk
            </span>{" "}
            per page
          </p>
          <p className="text-sm text-gray-300">
            Colorful Documents and anything that needs to pop.
          </p>
          <p className="text-green-300">Discounts grow the more you print</p>
        </div>
      </div>

      <div className="text-gray-500 mt-20 text-center font-roboto tracking-wide">
        No minimum order • Volume discounts applied automatically • NB: Dynamic
        charge may apply for heavy color documents.
      </div>
    </div>
  );
};

export default PrintRates;
