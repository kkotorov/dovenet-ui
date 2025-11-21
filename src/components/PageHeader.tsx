interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  right?: React.ReactNode; // search bar
}

export default function PageHeader({ title, actions, right }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center gap-4">
      {/* Left: title */}
      <div className="flex-shrink-0 text-2xl font-bold text-gray-900">{title}</div>

      {/* Center: search bar */}
      {right && (
        <div className="flex-grow flex justify-center">
          <div className="w-full max-w-xs">{right}</div>
        </div>
      )}

      {/* Right: buttons */}
      {actions && <div className="flex gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
