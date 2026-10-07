import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/*
 * Catches rendering crashes so a bug in one page shows a readable message
 * instead of a blank white screen. Pass a changing `resetKey` (for example the job id)
 * so the boundary clears itself when the user navigates to another item.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  componentDidUpdate(previous) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container-page py-16">
        <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
          <h1 className="mt-3 text-xl font-bold">This page could not be displayed</h1>
          <p className="mt-2 text-sm text-slate-600">Something unexpected went wrong. You can reload the page or go back to the job list.</p>
          {import.meta.env.DEV && <pre className="mt-4 overflow-x-auto rounded-lg bg-white p-3 text-left text-xs text-red-700">{String(this.state.error?.message || this.state.error)}</pre>}
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Reload page</button>
            <Link to="/find-jobs" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Find jobs</Link>
          </div>
        </div>
      </div>
    );
  }
}
