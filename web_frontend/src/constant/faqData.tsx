import { Link } from "react-router-dom";

export const faqData = [
  {
    question: "How do I know my documents are safe?",
    answer: (
      <div className="leading-relaxed text-justify">
        Your documents are safe with Insta Print. We <b>do not store</b> your
        documents. They are removed after printing.{" "}
        <Link
          to="/privacy-policy"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </div>
    ),
  },
  {
    question: "How do I pay for my order?",
    answer: (
      <div className="leading-relaxed text-justify">
        You can pay using <b>bKash</b> or <b>Nagad</b>. Upload your document
        first and check the price. <br />
        Then, send the{" "}
        <span className="text-red-500 font-semibold">exact price</span> to the
        given number and enter your <i>Transaction ID</i>.{" "}
        <Link
          to="/payment"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </div>
    ),
  },
  {
    question: "What if I send less than the required amount?",
    answer: (
      <div className="leading-relaxed text-justify">
        Your print request <b>will not be processed</b> if the payment is less
        than the calculated amount.
        <br />
        <ul className="list-disc list-outside ml-5 italic text-gray-700">
          <li>
            For guest users, please try again after excluding some files and
            ensuring the calculated amount is within the payemnt you made.{" "}
            <br />
            For logged-in
          </li>
          <li>
            users, the amount will be <b>automatically added to your wallet</b>{" "}
            — you can top up the rest and try again.{" "}
            <Link
              to="/refund-return"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-blue-500"
            >
              For More
            </Link>
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "What if I send more than the required amount?",
    answer: (
      <div className="leading-relaxed text-justify">
        Don't worry — your extra payment won't be lost.{" "}
        <ul className="list-disc list-outside ml-5 italic text-gray-700">
          <li>
            For guest users, please contact our team for a refund or adjustment
            for what you pay extra.
          </li>
          <li>
            For logged-in users, the extra amount will be{" "}
            <b>automatically added to your wallet balance</b>.{" "}
            <Link
              to="/refund-return"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-blue-500"
            >
              For More
            </Link>
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "How does Insta Print work?",
    answer: (
      <div className="leading-relaxed text-justify">
        Insta Print is a <b>remote printing service</b>. You can send your
        documents from anywhere through our website and collect the printed
        documents from a selected RUET hall.
      </div>
    ),
  },
  {
    question: "Where can I print documents near me?",
    answer: (
      <div className="leading-relaxed text-justify">
        Insta Print is available at <b>RUET student halls</b>. Currently, our
        service is available at <i>Male Hall-2</i>.
      </div>
    ),
  },
  {
    question: "Can I print from my laptop or PC?",
    answer: (
      <div className="leading-relaxed text-justify">
        Yes! You can easily print your documents from your laptop or PC using
        the Insta Print website{" "}
        <span className="text-blue-500 underline">
          https://instaprint-live.me
        </span>
        .
      </div>
    ),
  },
  {
    question: "Can I print from my mobile phone?",
    answer: (
      <div className="leading-relaxed text-justify">
        Yes. You can currently use Insta Print through your{" "}
        <b>mobile browser</b>. A mobile app will be available in the future.
      </div>
    ),
  },
  {
    question: "How do I upload my documents?",
    answer: (
      <div className="leading-relaxed text-justify">
        Just <b>drag and drop</b> your document into the upload area, or{" "}
        <b>select</b>
        it from your device.{" "}
        <Link
          to="/upload"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </div>
    ),
  },
  {
    question: "What printing options can I choose?",
    answer: (
      <div className="leading-relaxed text-justify">
        You can choose between <b>Black &amp; White</b> and <b>Color</b>{" "}
        printing. You can also set the <b>number of copies</b> and a custom{" "}
        <b>page range</b> to print.
      </div>
    ),
  },
  {
    question: "What file types can I print?",
    answer: (
      <div className="leading-relaxed text-justify">
        You can print <b>PDF</b>, <b>JPG</b>, and <b>PNG</b> files.
      </div>
    ),
  },
  {
    question: "What page format does Insta Print support?",
    answer: (
      <div className="leading-relaxed text-justify">
        Currently, Insta Print supports <b>A4</b> size paper only.
      </div>
    ),
  },
];
