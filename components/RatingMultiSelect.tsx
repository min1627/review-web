"use client";

interface RatingMultiSelectProps {
  selected: number[];
  onChange: (ratings: number[]) => void;
}

export default function RatingMultiSelect({ selected, onChange }: RatingMultiSelectProps) {
  const toggle = (rating: number) => {
    if (selected.includes(rating)) {
      onChange(selected.filter((r) => r !== rating));
    } else {
      onChange([...selected, rating].sort());
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isSelected = selected.includes(rating);
        return (
          <button
            key={rating}
            onClick={() => toggle(rating)}
            className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground border hover:bg-muted"
            }`}
          >
            {"★".repeat(rating)}{"☆".repeat(5 - rating)}
          </button>
        );
      })}
    </div>
  );
}
