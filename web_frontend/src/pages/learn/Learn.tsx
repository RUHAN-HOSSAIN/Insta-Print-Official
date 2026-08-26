import { learnData, type LearnItem } from "../../constant/learnData";

const Learn = () => {
  return (
    <div className="relative px-7 min-[500px]:px-15 md:px-20 xl:px-40 py-20 md:py-25 lg:py-30  bg-linear-to-t from-[#26065E] to-[#4801ED]">
      {/* ── Dot pattern background ── */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" // ← pointer-events-none add করো
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="font-spaceG flex flex-col gap-4 items-center justify-center text-center">
        <h4 className="text-sm sm:text-base font-bold text-blue-200">
          How it works
        </h4>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Upload and print by following these steps
        </h1>
      </div>

      {/* ── Cards ── */}
      <div className="font-roboto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
        {learnData.map((item: LearnItem) => (
          <div
            key={item.id}
            className="flex flex-col border border-gray-600 bg-white shadow-[4px_4px_15px_rgba(255,255,255,0.1)] rounded-xl overflow-hidden"
          >
            <div className="w-full h-50 max-sm:h-60 overflow-hidden">
              <img
                src={item.imgPath}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-5 pt-4 flex items-center gap-3">
              <div className="shrink-0 bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                {item.id}
              </div>
              <h2 className="text-base font-bold">{item.title}</h2>
            </div>

            <div className="px-5 py-4 text-sm text-gray-600 tracking-wider leading-6 flex-1 ">
              {item.description}
            </div>
          </div>
        ))}
      </div>

      <div className="font-spaceG mt-20 text-center backdrop-blur-3xl">
        <p className="text-red-500 md:text-lg p-2 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          <b>
            <u>Note:</u>
          </b>{" "}
          Make sure your{" "}
          <i>
            <b>'Transaction ID' is correct</b>
          </i>{" "}
          and you{" "}
          <b>
            <i>pay the 'exact amount'</i>
          </b>{" "}
          before submitting.
        </p>
      </div>
    </div>
  );
};

export default Learn;
