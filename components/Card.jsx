export default function Card({ title, description, children, footer }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-1">{children}</div>
      {footer && (
        <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}
