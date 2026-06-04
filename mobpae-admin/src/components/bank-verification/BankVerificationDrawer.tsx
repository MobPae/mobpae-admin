import type { BankAccount } from "../../types/bankAccount";

interface Props {
  open: boolean;
  account: BankAccount | null;
  onClose: () => void;
}

export default function BankVerificationDrawer({ open }: Props) {
  if (!open) return null;

  return null;
}
