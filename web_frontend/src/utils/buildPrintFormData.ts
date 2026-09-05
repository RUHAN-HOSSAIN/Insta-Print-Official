import type { PrintFormValues } from "../types/PrintRequest";

export function buildPrintFormData(
  formValues: PrintFormValues,
  files: File[],
): FormData {
  const formData = new FormData();

  formData.append("hall_id", formValues.hall_id);
  formData.append("txn_id", formValues.txn_id);
  formData.append("total_files", String(formValues.total_files));
  formData.append("total_page", String(formValues.total_page));
  formData.append("amount_calculated", String(formValues.amount_calculated));
  formData.append("logged_user", String(formValues.logged_user));
  formData.append("files_metadata", JSON.stringify(formValues.files));
  // Keep aliases for the current Worker controller while it migrates to snake_case.
  formData.append("hallId", formValues.hall_id);
  formData.append("txnId", formValues.txn_id);
  formData.append("payment_method", formValues.payment_method);
  formData.append("amount", String(formValues.amount_calculated));
  formData.append("settings", JSON.stringify(formValues.files.map(({ copies, color }) => ({ copies, color }))));
  files.forEach((file) => formData.append("files", file, file.name));

  return formData;
}
