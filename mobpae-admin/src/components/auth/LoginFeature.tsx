interface LoginFeatureProps {
  title: string;
  description: string;
}

export default function LoginFeature({
  title,
  description,
}: LoginFeatureProps) {
  return (
    <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-brand" />
      </div>

      <div>
        <h3 className="text-white font-medium text-sm">{title}</h3>

        <p className="text-ink-3 text-xs mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
