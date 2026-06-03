interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  children,
}: SidebarSectionProps) {
  return (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-2 font-medium">
        {title}
      </p>

      <div className="space-y-1">{children}</div>
    </div>
  );
}
