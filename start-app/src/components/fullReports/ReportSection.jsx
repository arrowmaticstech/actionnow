export default function ReportSection({ id, title, subtitle, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-start gap-3 mb-6">
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-wa-green/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-wa-green" />
          </div>
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 mt-1 text-sm sm:text-base max-w-2xl">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
