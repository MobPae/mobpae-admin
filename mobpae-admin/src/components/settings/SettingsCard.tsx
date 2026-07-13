type SettingsCardProps = {
  children: React.ReactNode;
};

export default function SettingsCard({ children }: SettingsCardProps) {
  return (
    <div className="bg-white border border-edge rounded-3xl shadow-sm">
      {children}
    </div>
  );
}
