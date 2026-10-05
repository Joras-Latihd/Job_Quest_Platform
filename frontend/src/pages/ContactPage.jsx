import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { contactService } from '@/services/engagementService';
import { contactSchema } from '@/schemas/miscSchemas';

export default function ContactPage() {
  useDocumentTitle('Contact');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(contactSchema), defaultValues: { name: '', email: '', subject: '', message: '' } });
  const mutation = useActionMutation(contactService.send, { success: 'Message sent. We will get back to you soon.', onSuccess: () => reset() });

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="mt-1 text-slate-500">Questions about your account, a listing or partnerships? Send us a message.</p>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="card mt-6 space-y-4 p-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Your name" required error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
          </div>
          <Input label="Subject" required error={errors.subject?.message} {...register('subject')} />
          <Textarea label="Message" rows={6} required error={errors.message?.message} {...register('message')} />
          <Button type="submit" loading={mutation.isPending}>Send message</Button>
        </form>
      </div>
      <aside className="card h-fit space-y-4 p-6 text-sm">
        <h2 className="font-sans text-base font-semibold">Other ways to reach us</h2>
        <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-brand-600" aria-hidden="true" /> support@jobquest.example</p>
        <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-brand-600" aria-hidden="true" /> +977 1 000 0000 (demo)</p>
        <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" /> Kathmandu, Nepal (demo address)</p>
      </aside>
    </div>
  );
}
