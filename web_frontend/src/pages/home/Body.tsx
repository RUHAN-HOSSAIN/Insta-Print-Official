import { useState } from "react";
import { PrintApiError, submitPrintJob } from "../../api/printApi";

import FileUploadBox from "../../components/print/FileUploadBox";
import SelectedFileCard from "../../components/print/SelectedFileCard";
import PaymentMethodsPanel from "../../components/print/PaymentMethodsPanel";
import {
  CoverLetterDetails,
  CoverLetterToggle,
} from "../../components/print/CoverLetterFields";
import PrintSummary from "../../components/print/PrintSummary";
import PrinterStatus from "../../components/print/PrinterStatus";
import { createCoverLetterPdf } from "../../utils/createCoverLetterPdf";
import { convertImageToPdf } from "../../utils/imageToPdf";
import { reversePdfPages } from "../../utils/reversePdfPages";
import type { PaymentMethod, PrintFile } from "../../types/PrintRequest";
import { usePrintFiles } from "../../hooks/usePrintFiles";
import { useAuth } from "../../context/useAuth";
import { roundPrintAmount } from "../../utils/roundPrintAmount";
import FeedbackPopup from "../../components/feedback/FeedbackPopup";

import mainLogo from "../../assets/logo_main.webp";

const Body = () => {
  const printFiles = usePrintFiles();
  const { user, token, updateUser } = useAuth();
  const loggedUser = Boolean(user);
  const [isDragging, setIsDragging] = useState(false);
  const [coverLetterEnabled, setCoverLetterEnabled] = useState(false);
  const [coverLetterName, setCoverLetterName] = useState("");
  const [coverLetterRoll, setCoverLetterRoll] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<File | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [hallId, setHallId] = useState("");
  const [printerOnline, setPrinterOnline] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [formError, setFormError] = useState("");
  const [validationField, setValidationField] = useState<
    "files" | "hall" | "transaction" | "cover-letter" | null
  >(null);
  const [popup, setPopup] = useState<{
    tone: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [printerKey, setPrinterKey] = useState(0);
  const activePaymentMethod = loggedUser ? paymentMethod : "direct";

  const clearGeneratedCoverLetter = () => {
    setGeneratedCoverLetter(null);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setValidationField(null);
    const availableSlots = 10 - printFiles.files.length;
    const acceptedFiles = selectedFiles
      .filter((file) => {
        const isPdf =
          file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        const isImage =
          ["image/jpeg", "image/png"].includes(file.type) ||
          /\.(jpe?g|png)$/i.test(file.name);
        if (!isPdf && !isImage) {
          return false;
        }
        const maxSize = isImage ? 5 * 1024 * 1024 : 15 * 1024 * 1024;
        if (file.size > maxSize) {
          return false;
        }
        return true;
      })
      .slice(0, Math.max(availableSlots, 0));

    if (acceptedFiles.length !== selectedFiles.length) {
      setValidationField("files");
      setFormError(
        "PDF files can be up to 15 MB; JPG/PNG images can be up to 5 MB, with a maximum of 10 files.",
      );
    }
    if (acceptedFiles.length) printFiles.addFiles(acceptedFiles);
  };

  const handleCoverLetterNameChange = (name: string) => {
    clearGeneratedCoverLetter();
    setCoverLetterName(name);
    setValidationField(null);
    setFormError("");
  };

  const handleCoverLetterRollChange = (roll: string) => {
    clearGeneratedCoverLetter();
    setCoverLetterRoll(roll.replace(/\D/g, "").slice(0, 7));
    setValidationField(null);
    setFormError("");
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    handleFilesSelected(Array.from(event.dataTransfer.files));
  };

  const handleClear = () => {
    printFiles.clearFiles();
    setCoverLetterEnabled(false);
    setCoverLetterName("");
    setCoverLetterRoll("");
    setGeneratedCoverLetter(null);
    setHallId("");
    setPrinterOnline(false);
    setTransactionId("");
    setPaymentMethod("direct");
    setFormError("");
    setValidationField(null);
    setPrinterKey((key) => key + 1);
  };

  const handleCoverToggle = (enabled: boolean) => {
    setCoverLetterEnabled(enabled);
    if (!enabled) {
      setGeneratedCoverLetter(null);
    }
  };

  const handlePrint = async () => {
    setFormError("");
    setValidationField(null);
    if (!printFiles.files.length)
      return showValidation("files", "Please upload at least one file.");
    if (
      printFiles.files.some((file) => {
        const isImage =
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          /\.(jpe?g|png)$/i.test(file.name);
        return file.size > (isImage ? 5 : 15) * 1024 * 1024;
      })
    )
      return showValidation(
        "files",
        "PDF files can be up to 15 MB; JPG/PNG images can be up to 5 MB.",
      );
    if (!hallId)
      return showValidation("hall", "Please select a collection hall.");
    if (!printerOnline)
      return showValidation(
        "hall",
        "The selected hall printer must be online.",
      );
    if (activePaymentMethod === "direct" && !transactionId.trim())
      return showValidation("transaction", "Please enter your transaction ID.");
    if (
      coverLetterEnabled &&
      !loggedUser &&
      (!coverLetterName.trim() || !/^\d{7}$/.test(coverLetterRoll))
    )
      return showValidation(
        "cover-letter",
        "Enter a cover-letter name and a valid 7 digit roll.",
      );

    setIsBusy(true);
    try {
      let files = printFiles.files.filter(
        (file) => file !== generatedCoverLetter,
      );
      let metadata = printFiles.details.filter(
        (_, index) => printFiles.files[index] !== generatedCoverLetter,
      );
      const convertedFiles = await Promise.all(
        files.map((file) => {
          const isImage =
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            /\.(jpe?g|png)$/i.test(file.name);
          return isImage ? convertImageToPdf(file) : file;
        }),
      );
      files = convertedFiles;
      if (files.some((file) => file.size > 15 * 1024 * 1024)) {
        return showValidation(
          "files",
          "Each final PDF must be 15 MB or smaller.",
        );
      }
      if (coverLetterEnabled) {
        const cover = await createCoverLetterPdf(
          loggedUser && user ? user.name : coverLetterName.trim(),
          loggedUser && user ? String(user.roll) : coverLetterRoll,
        );
        files = [...files, cover];
        metadata = [
          ...metadata,
          { name: cover.name, pages: 1, copies: 1, color: "mono", subtotal: 1 },
        ];
        setGeneratedCoverLetter(cover);
      }
      files = await Promise.all(files.map(reversePdfPages));
      if (files.some((file) => file.size > 15 * 1024 * 1024)) {
        return showValidation(
          "files",
          "Each final PDF must be 15 MB or smaller.",
        );
      }
      if (metadata.some((item) => !item))
        return showValidation(
          "files",
          "Please wait until every PDF page count is ready.",
        );
      const details = metadata as PrintFile[];
      const amount = roundPrintAmount(
        details.reduce((sum, item) => sum + item.subtotal, 0),
      );
      const totalPage = details.reduce(
        (sum, item) => sum + item.pages * item.copies,
        0,
      );
      if (amount <= 0)
        return showValidation(
          "files",
          "Calculated amount must be greater than zero.",
        );

      const result = await submitPrintJob(
        {
          hall_id: hallId,
          txn_id: activePaymentMethod === "wallet" ? "" : transactionId.trim(),
          payment_method: activePaymentMethod,
          amount_calculated: amount,
          files: details,
          total_files: files.length,
          total_page: totalPage,
          logged_user: loggedUser,
        },
        files,
        token, // ← যোগ করো
      );
      if (typeof result.wallet_balance === "number")
        updateUser({ wallet_balance: result.wallet_balance });
      if (result.status === "insufficient_payment") {
        setPopup({
          tone: "warning",
          title: "Payment received, printing stopped",
          message:
            result.message ??
            "Your payment was added to your wallet. Please top up the difference and try again.",
        });
      } else if (result.overpaid && result.wallet_credited) {
        setPopup({
          tone: "success",
          title: "Printing submitted",
          message: `Your print request was submitted successfully. ৳${result.wallet_credited.toFixed(2)} extra payment was added to your wallet.`,
        });
      } else if (result.overpaid) {
        setPopup({
          tone: "warning",
          title: "Printing submitted with extra payment",
          message: `Your calculated amount was ৳${amount.toFixed(2)}, but you paid ৳${result.amount_paid?.toFixed(2) ?? "more"}. Please contact our team to resolve the extra payment.`,
        });
      } else {
        setPopup({
          tone: "success",
          title: "Printing submitted successfully",
          message: `${result.totalFiles ?? files.length} file(s) were uploaded and sent for printing.`,
        });
      }
    } catch (error) {
      if (error instanceof PrintApiError) {
        const paid =
          typeof error.details.amount_paid === "number"
            ? ` You paid ৳${error.details.amount_paid.toFixed(2)}`
            : "";
        const required =
          typeof error.details.amount_required === "number"
            ? `, but ৳${error.details.amount_required.toFixed(2)} was required.`
            : ".";
        const code = error.details.code;
        if (code === "PAYMENT_NOT_FOUND") {
          setPopup({
            tone: "warning",
            title: "Payment not received yet",
            message:
              "Your payment information has not reached us yet. Please try again after some time.",
          });
        } else if (code === "PAYMENT_ALREADY_USED") {
          setPopup({
            tone: "warning",
            title: "Payment already used",
            message: "Printing has already been completed using this payment.",
          });
        } else if (code === "INSUFFICIENT_PAYMENT") {
          setPopup({
            tone: "warning",
            title: "Printing rejected",
            message: `${paid}${required} Printing was rejected. Please reduce your files so the calculated amount fits your payment and try again.`,
          });
        } else if (code === "PAYMENT_PROCESSING") {
          setPopup({
            tone: "warning",
            title: "Payment is being processed",
            message:
              "This payment is already being processed. Please try again later.",
          });
        } else {
          setPopup({
            tone: "error",
            title: "Server error",
            message:
              "Something went wrong while processing your print request. Please try again after some time.",
          });
        }
      } else {
        setPopup({
          tone: "error",
          title: "Printing could not be submitted",
          message:
            error instanceof Error ? error.message : "Please try again later.",
        });
      }
    } finally {
      setIsBusy(false);
    }
  };

  const showValidation = (
    field: "files" | "hall" | "transaction" | "cover-letter",
    message: string,
  ) => {
    setFormError(message);
    setValidationField(field);
    window.setTimeout(
      () =>
        document
          .getElementById(`print-${field}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      0,
    );
  };

  const errorMentions = (field: string) =>
    formError.toLowerCase().includes(field);
  const totalPrice =
    printFiles.totals.reduce((sum, total) => sum + total, 0) +
    (coverLetterEnabled ? 1 : 0);
  const roundedTotalPrice = roundPrintAmount(totalPrice);
  const walletBalance = user?.wallet_balance ?? 0;
  const walletInsufficient =
    loggedUser &&
    activePaymentMethod === "wallet" &&
    walletBalance < roundedTotalPrice;

  return (
    <>
      <div style={{ height: "var(--header-height, 72px)" }} />
      <div className="relative px-7 pt-15 pb-20 min-[500px]:px-10 sm:px-13 md:px-16 lg:px-20 xl:px-25 2xl:px-30">
        <FeedbackPopup
          open={Boolean(popup)}
          tone={popup?.tone ?? "info"}
          title={popup?.title ?? ""}
          message={popup?.message ?? ""}
          onClose={() => setPopup(null)}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-5 opacity-100"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="flex flex-col items-center justify-center gap-5 mb-10">
          <div className="flex items-center gap-1 sm:gap-3 mb-2 md:mb-5">
            <img
              src={mainLogo}
              alt="Main Logo"
              className="w-15 h-15 md:h-24 md:w-24"
            />
            <div className=" font-rubikWP">
              <span className="text-2xl lg:text-3xl text-gray-700">In⚡ta</span>
              <br />
              <span className=" text-[#294389] text-3xl lg:text-4xl">rint</span>
            </div>
          </div>
          <h1 className="font-fingerPaint text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">
            Quick and Easy Document Printing Near Me
          </h1>
          <h4 className="font-spaceG text-center text-xs sm:text-sm md:text-base lg:text-md xl:text-lg text-gray-700">
            On-demand A4 printing with remote printing and seamless
            click-and-collect
          </h4>
        </div>

        <div
          className={`relative grid grid-cols-1 gap-10 md:gap-7 lg:gap-15 xl:gap-20 ${printFiles.files.length > 0 ? "md:grid-cols-2 pt-10" : "pt-5"}`}
        >
          <div
            className={`flex h-fit flex-col gap-6 rounded-lg  px-7 pt-15 pb-9 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] lg:p-10 bg-white ${printFiles.files.length === 0 ? "w-full md:mx-auto max-w-xl" : ""}`}
          >
            <div id="print-files" className="relative">
              <FileUploadBox
                onFilesSelected={handleFilesSelected}
                isDragging={isDragging}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                hasError={validationField === "files"}
                errorMessage={formError}
              />
            </div>
            {printFiles.files.length > 0 && (
              <div className="mt-5 flex flex-col gap-7 font-roboto">
                {printFiles.files.map((file, index) => (
                  <SelectedFileCard
                    key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
                    file={file}
                    index={index}
                    onRemove={printFiles.removeFile}
                    onTotalChange={printFiles.updateTotal}
                    onDetailsChange={printFiles.updateDetails}
                    isCoverLetter={generatedCoverLetter?.name === file.name}
                  />
                ))}
              </div>
            )}
          </div>

          {printFiles.files.length > 0 && (
            <PrintSummary
              totalPrice={totalPrice}
              roundedTotalPrice={roundedTotalPrice}
              transactionId={transactionId}
              transactionError={errorMentions("transaction")}
              showTransactionInput
              transactionInputDisabled={activePaymentMethod === "wallet"}
              isBusy={isBusy}
              walletInsufficient={walletInsufficient}
              onTransactionChange={(value) => {
                setTransactionId(value);
                setValidationField(null);
                setFormError("");
              }}
              onClear={handleClear}
              onPrint={() => void handlePrint()}
              coverLetterToggle={
                <CoverLetterToggle
                  enabled={coverLetterEnabled}
                  onToggle={handleCoverToggle}
                />
              }
              coverLetterFields={
                coverLetterEnabled && !loggedUser ? (
                  <CoverLetterDetails
                    name={coverLetterName}
                    roll={coverLetterRoll}
                    onNameChange={handleCoverLetterNameChange}
                    onRollChange={handleCoverLetterRollChange}
                  />
                ) : null
              }
            >
              <PrinterStatus
                key={printerKey}
                onSelectionChange={(id, online) => {
                  setHallId(id);
                  setPrinterOnline(online);
                  setValidationField(null);
                  setFormError("");
                }}
                hasError={errorMentions("hall")}
                errorMessage={
                  validationField === "hall" ? formError : undefined
                }
              />
              <PaymentMethodsPanel
                totalPrice={totalPrice}
                loggedUser={loggedUser}
                paymentMethod={activePaymentMethod}
                walletBalance={walletBalance}
                onPaymentMethodChange={setPaymentMethod}
              />
            </PrintSummary>
          )}
        </div>
      </div>
    </>
  );
};

export default Body;
