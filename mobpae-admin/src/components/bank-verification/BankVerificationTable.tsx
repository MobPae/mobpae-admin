import type { BankAccount } from "../../types/bankAccount";

interface Props {
  accounts: BankAccount[];
  onReview: (account: BankAccount) => void;
}

export default function BankVerificationTable({ accounts, onReview }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/80">
              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Employee
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Employer
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Bank Details
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Verification
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Added On
              </th>

              <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account, index) => (
              <tr
                key={account.id}
                className={`
                  border-b border-slate-100
                  hover:bg-blue-50
                  transition-colors
                  ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                `}
              >
                {/* Employee */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {account.employee?.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {account.employee?.employeeCode}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          account.employee?.employmentStatus === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {account.employee?.employmentStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1">
                      {account.employee?.email}
                    </p>
                  </div>
                </td>

                {/* Employer */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {account.employee?.employer?.companyName}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {account.employee?.employer?.companyCode}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          account.employee?.employer?.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {account.employee?.employer?.status}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Bank Details */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {account.bankName || "-"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Account • ****{account.accountNumber?.slice(-4)}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-[11px] font-medium">
                        IFSC: {account.ifscCode}
                      </span>

                      {account.upiId && (
                        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px]">
                          UPI: {account.upiId}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Verification */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        account.verified
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {account.verified ? "COMPLETED" : "PENDING"}
                    </span>
                  </div>
                </td>

                {/* Added On */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-slate-900">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onReview(account)}
                    className="
                      px-3
                      py-1.5
                      rounded-xl
                      bg-blue-50
                      text-blue-700
                      text-xs
                      font-medium
                      hover:bg-blue-100
                      transition-all
                    "
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {accounts.length === 0 && (
          <div className="py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No Bank Accounts Found
            </h3>

            <p className="text-slate-500 mt-2">
              Bank account submissions will appear here once employees add their
              accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
