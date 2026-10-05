import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { validateFile } from '@/utils/validators';

// Click-to-choose or drag-and-drop. Validates type and size before calling onFile.
export default function FileDropzone({ rules, onFile, loading = false, label = 'Click to upload or drag a file here' }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    const problem = validateFile(file, rules);
    setError(problem || '');
    if (!problem) onFile(file);
  };

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files[0]); }}
        className={`flex w-full flex-col items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition disabled:opacity-60 ${dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
      >
        <UploadCloud className="h-8 w-8 text-brand-600" aria-hidden="true" />
        <span className="mt-2 text-sm font-medium text-slate-800">{loading ? 'Uploading...' : label}</span>
        <span className="text-xs text-slate-500">{rules.label}</span>
      </button>
      <input ref={inputRef} type="file" className="sr-only" tabIndex={-1} accept={rules.extensions.map((ext) => `.${ext}`).join(',')} onChange={(event) => { handleFile(event.target.files[0]); event.target.value = ''; }} />
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
