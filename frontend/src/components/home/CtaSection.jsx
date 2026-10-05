import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';

export default function CtaSection() {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return null;
  return (
    <section className="container-page py-14">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-brand-600 p-8 text-white">
          <h2 className="text-2xl font-bold !text-white">Looking for your next role?</h2>
          <p className="mt-2 text-brand-100">Build a profile once, upload your resume and apply to jobs in a few clicks.</p>
          <Button as={Link} to="/register" variant="accent" className="mt-6">Create a free account</Button>
        </div>
        <div className="rounded-2xl bg-slate-900 p-8 text-white">
          <h2 className="text-2xl font-bold !text-white">Hiring for your team?</h2>
          <p className="mt-2 text-slate-300">Post jobs, review applicants and move candidates through your hiring process.</p>
          <Button as={Link} to="/register?role=EMPLOYER" variant="outline" className="mt-6 !border-white/30 !bg-transparent !text-white hover:!bg-white/10">Post a job</Button>
        </div>
      </div>
    </section>
  );
}
