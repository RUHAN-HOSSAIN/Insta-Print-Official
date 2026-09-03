
import { useEffect, useState } from "react";

const collectionPoints = [
  { id: "male_hall_02", name: "Shaheed Hadi Hall", active: true },
  { id: "haque_hall", name: "Sher-e-Bangla Fazlul Haque Hall", active: false },
  { id: "shahidul_hall", name: "Shaheed Shahidul Islam Hall", active: false },
  { id: "male_hall_01", name: "Male Hall 01", active: false },
  { id: "ziaur_hall", name: "Shaheed President Ziaur Rahman Hall", active: false },
  { id: "selim_hall", name: "Shaheed LT. Selim Hall", active: false },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
type PrinterStatusResponse = { connected?: boolean; error?: string };

interface PrinterStatusProps {
  onSelectionChange?: (hallId: string, online: boolean) => void;
  hasError?: boolean;
}

const PrinterStatus = ({ onSelectionChange, hasError = false }: PrinterStatusProps) => {
  const [selectedPoint, setSelectedPoint] = useState("");
  const [printerStatus, setPrinterStatus] = useState<{
    point: string;
    connected: boolean;
    error?: string;
  } | null>(null);
  const selectedCollectionPoint = collectionPoints.find(
    (point) => point.id === selectedPoint,
  );

  useEffect(() => {
    if (!selectedPoint) return;

    const controller = new AbortController();
    fetch(`${API_BASE_URL}/status?hallId=${encodeURIComponent(selectedPoint)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as PrinterStatusResponse;
        if (!response.ok) throw new Error(data.error ?? "Unable to read printer status");
        return data;
      })
      .then((data) => setPrinterStatus({ point: selectedPoint, connected: data.connected === true }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPrinterStatus({
          point: selectedPoint,
          connected: false,
          error: error instanceof Error ? error.message : "Unable to read printer status",
        });
      });

    return () => controller.abort();
  }, [selectedPoint]);

  const isLoading = Boolean(selectedPoint && printerStatus?.point !== selectedPoint);
  const displayedConnection = printerStatus?.point === selectedPoint ? printerStatus.connected : null;
  const displayedError = printerStatus?.point === selectedPoint ? printerStatus.error ?? "" : "";
  const statusLabel = isLoading ? "Checking" : displayedConnection ? "Online" : selectedPoint ? "Offline" : "Select a hall";
  const statusClasses = isLoading
    ? "bg-amber-50 text-amber-700"
    : displayedConnection
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";
  const statusDotClasses = isLoading
    ? "bg-amber-500"
    : displayedConnection
      ? "bg-emerald-500"
      : "bg-red-500";

  useEffect(() => {
    onSelectionChange?.(selectedPoint, displayedConnection === true);
  }, [displayedConnection, onSelectionChange, selectedPoint]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-5 md:p-6 max-md:mb-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-spaceG text-lg sm:text-xl font-bold text-blue-600">
            Collection point
          </h2>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:text-sm font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.1)] ${statusClasses}`}>
          <span className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${statusDotClasses} animate-pulse`} />
          <span className="font-jura">{statusLabel}</span>
        </span>
      </div>

      <label className="flex flex-col gap-3 font-roboto font-semibold text-slate-700">
        <h2 className="text-sm sm:text-base">Select a hall</h2>
        <select
          value={selectedPoint}
          onChange={(event) => {
            setSelectedPoint(event.target.value);
            onSelectionChange?.(event.target.value, false);
          }}
          className={`w-full text-sm sm:text-base  appearance-none rounded-lg border bg-slate-50 px-4 py-2 font-normal text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 ${hasError ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`}
          aria-label="Select collection hall"
        >
          <option value="">Choose a collection point</option>
          {collectionPoints.map((point) => (
            <option key={point.id} value={point.id} disabled={!point.active}>
              {point.name}{point.active ? "" : " (Coming soon)"}
            </option>
          ))}
        </select>
      </label>

      <p className="font-roboto text-[13px] md:text-sm leading-5 text-red-700">
        <span className="font-bold">Queue: </span>
        {displayedError
          ? displayedError
          : selectedCollectionPoint
            ? `${selectedCollectionPoint.name}  5 jobs ahead you`
            : "Choose a hall to see its live printer queue."}
      </p>
    </div>
  );
};

export default PrinterStatus;