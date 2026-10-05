import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import useActionMutation from '@/hooks/useActionMutation';
import { reportService } from '@/services/engagementService';
import { reportSchema } from '@/schemas/miscSchemas';
import { REPORT_REASONS } from '@/constants';

export default function ReportJobModal({ open, onClose, job }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(reportSchema), defaultValues: { reason: '', details: '' } });
  const mutation = useActionMutation((values) => reportService.create({ job: job._id, ...values }), {
    success: 'Thanks. Our team will review this listing.',
    onSuccess: () => { reset(); onClose(); },
  });

  return (
    <Modal open={open} onClose={onClose} title="Report this job" size="sm" footer={(
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="report-form" loading={mutation.isPending}>Send report</Button>
      </>
    )}>
      <form id="report-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
        <Select label="Reason" required placeholder="Select a reason" options={REPORT_REASONS} error={errors.reason?.message} {...register('reason')} />
        <Textarea label="Details (optional)" rows={3} error={errors.details?.message} {...register('details')} />
      </form>
    </Modal>
  );
}
