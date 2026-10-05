import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold">This trail ends here</h1>
      <p className="mt-2 max-w-md text-slate-600">The page you are looking for does not exist or has moved.</p>
      <div className="mt-6 flex gap-3"><Button as={Link} to="/">Go home</Button><Button as={Link} to="/find-jobs" variant="outline">Find jobs</Button></div>
    </div>
  );
}
