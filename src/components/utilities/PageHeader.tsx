interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  right?: React.ReactNode; // search bar
}

export default function PageHeader({ title, actions, right }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-md border border-gray-200/60 transition-all">
      {/* Left: title */}
      <div className="flex-shrink-0 text-2xl font-bold text-gray-900">{title}</div>

      {/* Center: search bar */}
      {right && (
        <div className="flex-grow flex justify-center w-full md:w-auto">
          <div className="w-full max-w-md">{right}</div>
        </div>
      )}

      {/* Right: buttons */}
      {actions && <div className="flex gap-3 flex-shrink-0 flex-wrap justify-center">{actions}</div>}
    </div>
  );
}
