export default function MetricCard({ label, value, helper, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500/10 to-blue-50 border-blue-100",
    emerald: "from-emerald-500/10 to-emerald-50 border-emerald-100",
    slate: "from-slate-500/10 to-slate-50 border-slate-200",
    amber: "from-amber-500/10 to-amber-50 border-amber-100",
  };

  return (
    <div className={`card border bg-gradient-to-br p-5 ${tones[tone] || tones.blue}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
