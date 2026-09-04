
import { Link } from "react-router-dom";

export const faqData = [
  {
    question: "How do I know my documents are safe?",
    answer: (
      <>
        Your documents are safe with Insta Print. We do not store your
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
    question: "How does Insta Print work?",
    answer: (
      <>
        Insta Print is a remote printing service. You can send your
        documents from anywhere through our website and collect the printed
        documents from a selected RUET hall.
      </>
    ),
  },
  {
    question: "Where can I print documents near me?",
    answer: (
      <>
        Insta Print is available at RUET student halls. Currently, our
        service is available at Male Hall-2.
      </>
    ),
  },
  {
    question: "Can I print from my laptop or PC?",
    answer: (
      <>
        Yes! You can easily print your documents from your laptop or PC
        using the Insta Print website.
      </>
    ),
  },
  {
    question: "Can I print from my mobile phone?",
    answer: (
      <>
        Yes. You can currently use Insta Print through your mobile browser.
        A mobile app will be available in the future.
      </>
    ),
  },
  {
    question: "How do I pay for my order?",
    answer: (
      <>
        You can pay using bKash or Nagad. Upload your document first and
        check the price. Then, send the payment to the given number and
        enter your Transaction ID.{" "}
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
    question: "How do I upload my documents?",
    answer: (
      <>
        Just drag and drop your document into the upload area, or select it
        from your device.{" "}
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
      <>You can choose between Black &amp; White and Color printing.</>
    ),
  },
  {
    question: "What file types can I print?",
    answer: <>You can print PDF, JPG, and PNG files.</>,
  },
  {
    question: "What page format does Insta Print support?",
    answer: <>Currently, Insta Print supports A4 size paper only.</>,
  },
  {
    question: "Can someone print this for me?",
    answer: (
      <>
        Yes! That's exactly what Insta Print does. Upload your document,
        choose your options, and place your order. We will print it for
        you, so you don't need to print it yourself.
      </>
    ),
  },
];
