import { Link } from "react-router-dom";

import dragDropImg from "../assets/images/1_dragDrop.webp"
import propertiesImg from "../assets/images/2_properties.webp"
import payImg from "../assets/images/3_pay.webp"
import printImg from "../assets/images/4_print.webp"


export type LearnItem = {
  id: number;
  title: string;
  description: string | React.ReactNode;
  imgPath: string;
}

export const learnData: LearnItem[] = [
  {
    id: 1,
    title: "Upload your file",
    description: (
      <>
        <p> <i><b>Drag and drop</b></i> your file into the browser, or <i><b>browse</b></i> and <i><b>select</b></i> it from your phone, tablet, or computer.</p>
      </>
    ),
    imgPath: dragDropImg
  },
  {
    id: 2,
    title: "Choose options",
    description: (
      <>
        <p>Choose your printing options, such as <i><b>color, copies, page range</b></i> and more. <br /><br /> <span className="text-green-600 italic">The price will update based on your choices.</span></p>
      </>
    ),
    imgPath: propertiesImg
  },
  {
    id: 3,
    title: "Pay (Send Money)",
    description: (
      <div>
        <p>Pay <i><b>exact amount</b></i> using bKash or Nagad with <b><i>Send Money</i></b>, then enter your Transaction ID.</p>
        <br />
        <Link to="/payment" className="text-sm text-blue-500 hover:text-[15px] group transition-all">
          How to Pay <span className="group-hover:pl-1 transition-all">→</span>
        </Link>
      </div>
    ),
    imgPath: payImg
  },
  {
    id: 4,
    title: "Start the Print",
    description: (
      <div>
        <p>Make sure the Transaction ID is correct and you  pay the exact amount, then click <b><i>'Print Now'</i></b> to start the printing.</p>
      </div>
    ),
    imgPath: printImg
  }
];