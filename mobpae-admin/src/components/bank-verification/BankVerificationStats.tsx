import { Landmark, CheckCircle2, Clock3 } from "lucide-react";

import type { BankAccount } from "../../types/bankAccount";

interface Props {
  accounts: BankAccount[];
}

export default function BankVerificationStats({ accounts }: Props) {
  const verified = accounts.filter((account) => account.verified).length;

  const pending = accounts.filter((account) => !account.verified).length;

  const stats = [
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      title: "Verified",
      value: verified,
      icon: CheckCircle2,
      bg: "bg-[#ECEBFF]",
      color: "text-[#7679FF]",
    },
    {
      title: "Total",
      value: accounts.length,
      icon: Landmark,
      bg: "bg-[#ECEBFF]",
      color: "text-[#7679FF]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white border border-[#E4E4EF] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#62657A]">{stat.title}</p>

                <h3 className="text-xl font-semibold text-[#191A2E] mt-1">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}
              >
                <Icon size={18} className={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
