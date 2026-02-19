export type ToastItem = {
  id: number;
  type: "pending" | "success" | "error";
  message: string;
};
