export default function StepProgress({ step, total }) {
  const progress = Math.round((step / total) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Step {step} of {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
