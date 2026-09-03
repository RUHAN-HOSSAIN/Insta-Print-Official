interface CoverLetterFieldsProps {
  enabled: boolean;
  name: string;
  roll: string;
  message: string;
  onToggle: (enabled: boolean) => void;
  onNameChange: (name: string) => void;
  onRollChange: (roll: string) => void;
}

export const CoverLetterToggle = ({ enabled, onToggle }: Pick<CoverLetterFieldsProps, "enabled" | "onToggle">) => (
  <div className="flex items-center gap-2 text-gray-700 shrink-0">
    <label htmlFor="cover-letter-toggle" className="text-sm">cover letter (optional)</label>
    <input id="cover-letter-toggle" type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} className="h-5 w-5" />
  </div>
);

export const CoverLetterDetails = ({
  name,
  roll,
  message,
  onNameChange,
  onRollChange,
}: Pick<CoverLetterFieldsProps, "name" | "roll" | "message" | "onNameChange" | "onRollChange">) => (
  <div className="flex flex-row gap-3 mb-5 mr-2">
    <input type="text" value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Receiver name" className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
    <input type="text" value={roll} onChange={(event) => onRollChange(event.target.value)} placeholder="7 digit roll" inputMode="numeric" className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
    {message && <span className="self-center whitespace-nowrap text-xs text-gray-600">{message}</span>}
  </div>
);

const CoverLetterFields = ({
  enabled,
  name,
  roll,
  message,
  onToggle,
  onNameChange,
  onRollChange,
}: CoverLetterFieldsProps) => (
  <>
    <CoverLetterToggle enabled={enabled} onToggle={onToggle} />
    {enabled && <CoverLetterDetails name={name} roll={roll} message={message} onNameChange={onNameChange} onRollChange={onRollChange} />}
  </>
);

export default CoverLetterFields;
