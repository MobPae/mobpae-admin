import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import type { BankAccount } from "../types/bankAccount";

import { getBankAccounts } from "../services/bankVerificationService";

import BankVerificationStats from "../components/bank-verification/BankVerificationStats";
import BankVerificationTable from "../components/bank-verification/BankVerificationTable";
import BankVerificationDrawer from "../components/bank-verification/BankVerificationDrawer";

export default function BankVerificationPage() {
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await getBankAccounts();

        setAccounts(data || []);
      } catch (error) {
        console.error("Failed to load bank accounts", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    const employeeName = account.employee?.name || "";

    const employeeCode = account.employee?.employeeCode || "";

    const bankName = account.bankName || "";

    return (
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading bank accounts...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bank Verification</h1>

        <p className="text-slate-500 mt-2">
          Review and verify employee bank accounts.
        </p>
      </div>

      <BankVerificationStats accounts={accounts} />

      <div className="relative w-full max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search bank accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            h-10
            pl-10
            pr-4
            text-sm
            bg-white
            border
            border-slate-200
            rounded-xl
            outline-none
            focus:border-blue-500
          "
        />
      </div>

      {filteredAccounts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Bank Accounts Found
          </h3>

          <p className="text-slate-500 mt-2">
            Bank account submissions will appear here once employees add their
            accounts.
          </p>
        </div>
      ) : (
        <BankVerificationTable
          accounts={filteredAccounts}
          onReview={(account) => {
            setSelectedAccount(account);
            setDrawerOpen(true);
          }}
        />
      )}

      <BankVerificationDrawer
        open={drawerOpen}
        account={selectedAccount}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
}
