import Swal from "sweetalert2";

export const showFeedbackError = (message: string) => {
  return Swal.fire({
    icon: "error",
    title: "Something went wrong",
    text: message,
    confirmButtonColor: "#2563eb",
  });
};

export const showFeedbackSuccess = (title: string, message?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#218b49",
  });
};
