import { whyData } from "../../constant/whyData";
import WhyCard from "../../components/home/WhyCard";

const WhyInstraPrint = () => {
  return (
    <div className="relative px-7 min-[500px]:px-10 md:px-15 py-15 sm:py-20 md:py-25 lg:py-30 bg-linear-to-t from-[#26065D] to-[#4B00FE] overflow-hidden">
      {/* ── Dot pattern background ── */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 15px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Heading ── */}
      <div className="font-spaceG flex flex-col gap-4 items-center justify-center text-center mb-16 sm:mb-20">
        <h4 className="text-sm sm:text-base font-bold text-blue-300">
          Why Insta Print
        </h4>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Built like a print shop. Runs like an app.
        </h1>
        <h3 className="text-sm tracking-wider text-gray-300 max-w-2xl">
          Professional printing without the queue, the drive, or the awkward
          office printer.
        </h3>
      </div>

      {/* ── Timeline (desktop) / Stack (mobile) ── */}
      <div className="relative max-w-4xl mx-auto">
        {/* Vertical center line — only on md+ */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-blue-200 z-0" />

        <div className="flex flex-col gap-12 md:gap-0">
          {whyData.map((item, index) => {
            const isLeft = index % 2 === 0; // 01, 03 → left | 02, 04 → right

            return (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center justify-center md:items-start gap-6 md:gap-0 md:mb-12
                  ${isLeft ? "md:justify-start" : "md:justify-end"}
                `}
              >
                {/* ── Dot on the center line ── */}
                <div className="animate-pulse hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md z-10 top-8" />

                {/* ── Connector line from dot to card ── */}
                <div
                  className={`hidden md:block absolute top-[38px] h-px w-[calc(25%-1rem)] bg-blue-200 z-0
                    ${
                      isLeft
                        ? "left-[calc(50%+1rem)]" // dot → right card: line goes RIGHT but card is LEFT, so flip
                        : "right-[calc(50%+1rem)]"
                    }
                  `}
                />

                {/* ── Card ── sm:w-[calc(50%-1.5rem)]  min-[300px]:w-[calc(90%-1.5rem)] sm:w-[calc(50%-1.5rem)] */}
                <div
                  className={`z-10 md:w-[46%]
                            ${isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}
                  `}
                >
                  <WhyCard
                    title={item.title}
                    highlight={item.highlight}
                    highlightSub={item.highlightSub}
                    description={item.description}
                    icon={item.icon}
                    link={item.link}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhyInstraPrint;
