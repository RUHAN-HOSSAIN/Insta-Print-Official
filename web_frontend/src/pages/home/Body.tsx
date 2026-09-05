import { useState } from "react";
import { submitPrintJob } from "../../api/printApi";

import FileUploadBox from "../../components/print/FileUploadBox";
import SelectedFileCard from "../../components/print/SelectedFileCard";
import PaymentMethodsPanel from "../../components/print/PaymentMethodsPanel";
import { CoverLetterDetails, CoverLetterToggle, } from "../../components/print/CoverLetterFields";
import PrintSummary from "../../components/print/PrintSummary";
import PrinterStatus from "./PrinterStatus";
import { createCoverLetterPdf } from "../../utils/createCoverLetterPdf";
import type { PaymentMethod, PrintFile } from "../../types/PrintRequest";
import { usePrintFiles } from "../../hooks/usePrintFiles";
import { useAuth } from "../../context/useAuth";

import mainLogo from "../../assets/logo_main.webp";

const Body = () => {
  const printFiles = usePrintFiles();
  const { user } = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("direct");
  const [formError, setFormError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [printerKey, setPrinterKey] = useState(0);
  const activePaymentMethod = loggedUser ? paymentMethod : "direct";

  const clearGeneratedCoverLetter = () => {
    setGeneratedCoverLetter(null);
  };

  const handleCoverLetterNameChange = (name: string) => {
    clearGeneratedCoverLetter();
    setCoverLetterName(name);
  };

  const handleCoverLetterRollChange = (roll: string) => {
    clearGeneratedCoverLetter();
    setCoverLetterRoll(roll.replace(/\D/g, "").slice(0, 7));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    printFiles.addFiles(
      Array.from(event.dataTransfer.files).filter(
        (file) => file.type === "application/pdf",
      ),
    );
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
    setSubmitMessage("");
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
    setSubmitMessage("");
    if (!printFiles.files.length)
      return setFormError("Please upload at least one PDF file.");
    if (printFiles.files.some((file) => file.size > 15 * 1024 * 1024))
      return setFormError("Each PDF file must be 15 MB or smaller.");
    if (!hallId) return setFormError("Please select a collection hall.");
    if (!printerOnline)
      return setFormError("The selected hall printer must be online.");
    if (activePaymentMethod === "direct" && !transactionId.trim())
      return setFormError("Please enter your transaction ID.");
    if (
      coverLetterEnabled &&
      !loggedUser &&
      (!coverLetterName.trim() || !/^\d{7}$/.test(coverLetterRoll))
    )
      return setFormError(
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
      if (coverLetterEnabled && !loggedUser) {
        const cover = await createCoverLetterPdf(
          coverLetterName.trim(),
          coverLetterRoll,
        );
        files = [...files, cover];
        metadata = [
          ...metadata,
          { name: cover.name, pages: 1, copies: 1, color: "mono", subtotal: 1 },
        ];
        setGeneratedCoverLetter(cover);
      }
      if (metadata.some((item) => !item))
        return setFormError("Please wait until every PDF page count is ready.");
      const details = metadata as PrintFile[];
      const amount = Math.floor(
        details.reduce((sum, item) => sum + item.subtotal, 0) +
          (coverLetterEnabled && loggedUser ? 1 : 0),
      );
      const totalPage = details.reduce(
        (sum, item) => sum + item.pages * item.copies,
        0,
      );
      if (amount <= 0) return setFormError("Calculated amount must be greater than zero.");

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
      );
      setSubmitMessage(
        `Print request sent. ${result.totalFiles ?? files.length} file(s) queued.`,
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not send print request.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const errorMentions = (field: string) =>
    formError.toLowerCase().includes(field);
  const totalPrice =
    printFiles.totals.reduce((sum, total) => sum + total, 0) +
    (coverLetterEnabled ? 1 : 0);
  const walletBalance = user?.wallet_balance ?? 0;
  const walletInsufficient =
    loggedUser && activePaymentMethod === "wallet" && walletBalance < Math.floor(totalPrice);

  return (
    <>
      <div style={{ height: "var(--header-height, 72px)" }} />
      <div className="relative px-7 pt-15 pb-20 min-[500px]:px-10 sm:px-13 md:px-16 lg:px-20 xl:px-25 2xl:px-30">
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
            <FileUploadBox
              onFilesSelected={printFiles.addFiles}
              isDragging={isDragging}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            />
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
              roundedTotalPrice={Math.floor(totalPrice)}
              transactionId={transactionId}
              transactionError={errorMentions("transaction")}
              showTransactionInput={activePaymentMethod === "direct"}
              formError={formError}
              submitMessage={submitMessage}
              isBusy={isBusy}
              walletInsufficient={walletInsufficient}
              onTransactionChange={setTransactionId}
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
                }}
                hasError={errorMentions("hall")}
              />
              <PaymentMethodsPanel
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
