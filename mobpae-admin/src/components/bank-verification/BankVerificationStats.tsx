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
      color: "text-warning",
    },
    {
      title: "Verified",
      value: verified,
      icon: CheckCircle2,
      bg: "bg-brand-soft",
      color: "text-brand",
    },
    {
      title: "Total",
      value: accounts.length,
      icon: Landmark,
      bg: "bg-brand-soft",
      color: "text-brand",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white border border-edge rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-3">{stat.title}</p>

                <h3 className="text-xl font-semibold text-ink mt-1">
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
