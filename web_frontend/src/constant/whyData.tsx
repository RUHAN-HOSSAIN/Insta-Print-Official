import { Link } from "react-router-dom";
import {
  ClockIcon,
  ShieldIcon,
  AdjustIcon,
  FlexibleTimeIcon,
} from "../assets/icons/Icons";

export const whyData = [
  {
    title: "Print from anywhere",
    highlight: "Anytime",
    highlightSub: "remote printing",
    description:
      "Send your documents from anywhere and get them printed at your selected RUET hall.",
    icon: <ClockIcon className="w-5 h-5" />,
  },
  {
    title: "Private by default",
    highlight: "Your files",
    highlightSub: "deleted after printing",
    description:
      "Your documents are not kept after printing. We remove your files once your print job is completed.",
    icon: <ShieldIcon className="w-5 h-5" />,
    link: (
      <Link
        to="/privacy-policy"
        className="text-sm text-blue-500 hover:text-[15px] group transition-all"
      >
        Privacy Policy <span className="group-hover:pl-1 transition-all">→</span>
      </Link>
    ),
  },
  {
    title: "Every file, your way",
    highlight: "Color or B&W",
    highlightSub: "copies & pages",
    description:
      "Choose how you want each file printed. Select color, copies, page range, and other available options.",
    icon: <AdjustIcon className="w-5 h-5" />,
  },
  {
    title: "Flexible collection",
    highlight: "Print first",
    highlightSub: "collect when you want",
    description:
      "Send your documents online and collect the printed copies from your selected RUET hall when they are ready.",
    icon: <FlexibleTimeIcon className="w-5 h-5" />,
  },
];
