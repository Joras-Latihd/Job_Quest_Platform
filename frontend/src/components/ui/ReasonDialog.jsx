import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Textarea from './Textarea';

// Asks for a written reason (e.g. when rejecting a job or an employer) before running the action.
export default function ReasonDialog({ open, title, description, confirmLabel = 'Confirm', loading = false, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const close = () => { setReason(''); setError(''); onCancel(); };
  const submit = () => {
    if (reason.trim().length < 5) return setError('Please enter a reason (at least 5 characters).');
    onConfirm(reason.trim());
    setReason('');
    setError('');
    return undefined;
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      size="sm"
      footer={(
        <>
          <Button variant="outline" onClick={close} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={submit} loading={loading}>{confirmLabel}</Button>
        </>
      )}
    >
      {description && <p className="mb-3 text-sm text-slate-600">{description}</p>}
      <Textarea label="Reason" required value={reason} onChange={(event) => setReason(event.target.value)} error={error} rows={3} />
    </Modal>
  );
}
