import type { SalaryRequest } from "../../types/salary-request";

interface SalaryRequestDrawerProps {
  open: boolean;
  request: SalaryRequest | null;
  onClose: () => void;
}

export default function SalaryRequestDrawer({
  open,
}: SalaryRequestDrawerProps) {
  if (!open) return null;

  return null;
}
