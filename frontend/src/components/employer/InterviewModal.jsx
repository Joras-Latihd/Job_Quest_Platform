import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import useActionMutation from '@/hooks/useActionMutation';
import { interviewService } from '@/services/engagementService';
import { interviewSchema } from '@/schemas/miscSchemas';
import { INTERVIEW_TYPES } from '@/constants';

export default function InterviewModal({ open, onClose, application }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(interviewSchema), defaultValues: { date: '', time: '', type: 'ONLINE', locationOrLink: '', notes: '' } });
  const schedule = useActionMutation(({ date, time, ...rest }) => interviewService.schedule({ application: application._id, scheduledAt: new Date(`${date}T${time}`).toISOString(), ...rest }), {
    success: 'Interview scheduled. The candidate has been notified.',
    invalidate: [['applications'], ['interviews'], ['employer-dashboard']],
    onSuccess: () => { reset(); onClose(); },
  });

  return (
    <Modal open={open} onClose={onClose} title={`Schedule interview with ${application.candidate?.name}`} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="interview-form" loading={schedule.isPending}>Schedule interview</Button></>}>
      <form id="interview-form" onSubmit={handleSubmit((values) => schedule.mutate(values))} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Date" type="date" required min={new Date().toISOString().slice(0, 10)} error={errors.date?.message} {...register('date')} />
          <Input label="Time" type="time" required error={errors.time?.message} {...register('time')} />
        </div>
        <Select label="Interview type" options={INTERVIEW_TYPES} {...register('type')} />
        <Input label="Address, meeting link or phone number" required error={errors.locationOrLink?.message} {...register('locationOrLink')} />
        <Textarea label="Notes for the candidate" rows={3} {...register('notes')} />
      </form>
    </Modal>
  );
}
