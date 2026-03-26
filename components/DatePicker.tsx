"use client";

export default function DatePicker({
  label,
  value,
  onChange,
  availableDates,
}: {
  label: string;
  value: string;
  onChange: (date: string) => void;
  availableDates?: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </label>
      {availableDates && availableDates.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {availableDates.map((d) => (
            <option key={d} value={typeof d === 'string' ? d : new Date(d).toISOString().split('T')[0]}>
              {typeof d === 'string' ? d : new Date(d).toISOString().split('T')[0]}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}
