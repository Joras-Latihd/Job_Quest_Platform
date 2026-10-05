import { useState } from 'react';
import { X } from 'lucide-react';

// Lets users type a skill and press Enter or comma. `value` is an array of strings.
export default function TagInput({ label, value = [], onChange, placeholder = 'Type a skill and press Enter', suggestions = [] }) {
  const [draft, setDraft] = useState('');

  const addTag = (text) => {
    const tag = text.trim();
    if (tag && !value.some((item) => item.toLowerCase() === tag.toLowerCase())) onChange([...value, tag]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag(draft); }
    if (event.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
  };

  return (
    <div>
      {label && <label className="label" htmlFor="tag-input">{label}</label>}
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-sm text-brand-700">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((item) => item !== tag))} aria-label={`Remove ${tag}`}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        <input id="tag-input" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} onBlur={() => addTag(draft)} placeholder={placeholder} className="min-w-[10rem] flex-1 border-0 bg-transparent p-1 text-sm focus:outline-none focus:ring-0" />
      </div>
      {suggestions.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-500">
          Suggestions:
          {suggestions.filter((item) => !value.includes(item)).slice(0, 8).map((item) => (
            <button type="button" key={item} onClick={() => addTag(item)} className="rounded-full border border-slate-200 px-2 py-0.5 hover:bg-slate-50">+ {item}</button>
          ))}
        </p>
      )}
    </div>
  );
}
