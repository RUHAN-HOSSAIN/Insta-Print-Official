import type { ReactNode } from "react";

type WhyCardProps = {
  title: string;
  highlight: string;
  highlightSub: string;
  description: string;
  icon: ReactNode;
  link?: ReactNode;
};

const WhyCard = ({
  title,
  highlight,
  highlightSub,
  description,
  icon,
  link,
}: WhyCardProps) => {
  return (
    <div className="font-roboto tracking-wider bg-white rounded-2xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.5)] border border-gray-100 flex flex-col gap-3 w-full max-w-sm">
      {/* Icon box */}
      <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center">
        {icon}
      </div>

      {/* Step number + title */}
      <div>
        <h3 className="text-[17px] font-bold text-gray-900 mt-0.5">{title}</h3>
      </div>

      {/* Highlight stat */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-extrabold text-blue-500">{highlight}</span>
        <span className="text-sm text-gray-500">{highlightSub}</span>
      </div>

      {/* Description */}
      <p className="text-[13px] lg:text-sm text-gray-600 leading-relaxed">{description}</p>

      {/* Optional link */}
      {link && <div className="mt-1">{link}</div>}
    </div>
  );
};

export default WhyCard;