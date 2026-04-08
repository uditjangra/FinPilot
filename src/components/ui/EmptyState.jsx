import { Sparkles } from "lucide-react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="card flex min-h-56 flex-col items-center justify-center border-dashed px-6 py-10 text-center">
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 p-3 text-blue-700">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
