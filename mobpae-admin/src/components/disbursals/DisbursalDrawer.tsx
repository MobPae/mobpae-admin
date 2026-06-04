import type { Disbursal } from "../../types/disbursal";

interface Props {
  open: boolean;
  disbursal: Disbursal | null;
  onClose: () => void;
}

export default function DisbursalDrawer({ open }: Props) {
  if (!open) return null;

  return null;
}
