import { STATUS_STYLES, statusLabel } from "@/lib/lookups";

export default function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.NEW;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}
