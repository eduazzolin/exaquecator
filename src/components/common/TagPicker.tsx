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
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {selected.length > 0 && (
          <span className="text-xs text-brand-400 font-medium">
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
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-xl border transition-all duration-150 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-600/25 border-brand-500/60 text-brand-200 font-medium shadow-sm shadow-brand-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 hover:border-slate-700'
              }`}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
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
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-slate-800 border border-brand-500 text-slate-100 placeholder-slate-500 outline-none w-36 sm:w-44"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustom()}
                  className="p-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setCustomInput(''); }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-brand-300 hover:border-brand-500/50 hover:bg-brand-950/20 transition-all flex items-center gap-1"
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
