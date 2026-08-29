import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';

interface TagPickerProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholderCustom?: string;
  allowCustom?: boolean;
}

export const TagPicker: React.FC<TagPickerProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholderCustom = 'Adicionar outro...',
  allowCustom = true
}) => {
  const [customInput, setCustomInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Combine standard options with any selected custom options
  const allOptions = Array.from(new Set([...options, ...selected]));

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomInput('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </label>
        {selected.length > 0 && (
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {selected.length} selecionado{selected.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {allOptions.map(option => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-md border transition-all duration-150 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] font-medium shadow-sm'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              ) : null}
              <span>{option}</span>
            </button>
          );
        })}

        {allowCustom && (
          <>
            {isAdding ? (
              <form onSubmit={handleAddCustom} className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder={placeholderCustom}
                  autoFocus
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border-hover)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-36 sm:w-44"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustom()}
                  className="p-1.5 rounded-md bg-[var(--color-primary)] hover:opacity-90 text-[var(--bg-primary)] transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setCustomInput(''); }}
                  className="p-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-md border border-dashed border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-border-hover)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Personalizado</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
