import { Link } from "react-router-dom";

export const faqData = [
  {
    question: "How do I know my documents are safe?",
    answer: (
      <>
        Your documents are safe with Insta Print. We <b>do not store</b> your
        documents. They are removed after printing.{" "}
        <Link
          to="/privacy-policy"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </>
    ),
  },
  {
    question: "How do I pay for my order?",
    answer: (
      <>
        You can pay using <b>bKash</b> or <b>Nagad</b>. Upload your document
        first and check the price. Then, send the <span className="text-red-500 font-semibold">exact price</span> to the given number
        and enter your <i>Transaction ID</i>.{" "}
        <Link
          to="/payment"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </>
    ),
  },
  {
    question: "What if I send less than the required amount?",
    answer: (
      <>
        Your print request <b>will not be processed</b> if the payment is less
        than the calculated amount.{" "}
        <i>
          For guest users, please contact our team to resolve the issue. For logged-in
          users, the amount will be <b>automatically added to your wallet</b> —
          you can top up the rest and try again.
        </i>{" "}
        <Link
          to="/refund-return"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </>
    ),
  },
  {
    question: "What if I send more than the required amount?",
    answer: (
      <>
        Don't worry — your extra payment won't be lost.{" "}
        <i>
          For guest users, please contact our team for a refund or adjustment. For
          logged-in users, the extra amount will be{" "}
          <b>automatically added to your wallet balance</b>.
        </i>{" "}
        <Link
          to="/refund-return"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </>
    ),
  },
  {
    question: "How does Insta Print work?",
    answer: (
      <>
        Insta Print is a <b>remote printing service</b>. You can send your
        documents from anywhere through our website and collect the printed
        documents from a selected RUET hall.
      </>
    ),
  },
  {
    question: "Where can I print documents near me?",
    answer: (
      <>
        Insta Print is available at <b>RUET student halls</b>. Currently, our
        service is available at <i>Male Hall-2</i>.
      </>
    ),
  },
  {
    question: "Can I print from my laptop or PC?",
    answer: (
      <>
        Yes! You can easily print your documents from your laptop or PC using
        the Insta Print website{" "}
        <span className="text-blue-500 underline">
          https://instaprint-live.me
        </span>
        .
      </>
    ),
  },
  {
    question: "Can I print from my mobile phone?",
    answer: (
      <>
        Yes. You can currently use Insta Print through your{" "}
        <b>mobile browser</b>. A mobile app will be available in the future.
      </>
    ),
  },
  {
    question: "How do I upload my documents?",
    answer: (
      <>
        Just <b>drag and drop</b> your document into the upload area, or <b>select</b>
        it from your device.{" "}
        <Link
          to="/upload"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500"
        >
          For More
        </Link>
      </>
    ),
  },
  {
    question: "What printing options can I choose?",
    answer: (
      <>
        You can choose between <b>Black &amp; White</b> and <b>Color</b>{" "}
        printing. You can also set the <b>number of copies</b> and a custom{" "}
        <b>page range</b> to print.
      </>
    ),
  },
  {
    question: "What file types can I print?",
    answer: (
      <>
        You can print <b>PDF</b>, <b>JPG</b>, and <b>PNG</b> files.
      </>
    ),
  },
  {
    question: "What page format does Insta Print support?",
    answer: (
      <>
        Currently, Insta Print supports <b>A4</b> size paper only.
      </>
    ),
  },
  {
    question: "Can someone print this for me?",
    answer: (
      <>
        Yes! That's exactly what Insta Print does. Upload your document, choose
        your options, and place your order. We will{" "}
        <b>print it for you</b>. <i>And then collect it at your convenience.</i>
      </>
    ),
  },
];