import type { Repayment } from "../../types/repayment";

interface Props {
  open: boolean;
  repayment: Repayment | null;
  onClose: () => void;
}

export default function RepaymentDrawer({ open }: Props) {
  if (!open) return null;

  return null;
}
