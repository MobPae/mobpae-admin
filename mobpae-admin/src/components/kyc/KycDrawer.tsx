import type { KycDocument } from "../../types/kyc";

interface Props {
  open: boolean;
  document: KycDocument | null;
  onClose: () => void;
}

export default function KycDrawer({ open }: Props) {
  if (!open) return null;

  return null;
}
