import { X } from 'lucide-react';

interface TagChipProps {
  tag: string;
  onRemove?: () => void;
}

export function TagChip({ tag, onRemove }: TagChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-cb-primary">
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover tag ${tag}`}
          className="text-cb-primary/60 hover:text-cb-primary transition-colors duration-150"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
