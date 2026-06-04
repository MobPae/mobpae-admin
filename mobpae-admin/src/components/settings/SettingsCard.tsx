type SettingsCardProps = {
  children: React.ReactNode;
};

export default function SettingsCard({ children }: SettingsCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
      {children}
    </div>
  );
}
