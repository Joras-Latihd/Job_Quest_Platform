import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Job Quest` : 'Job Quest - Find the right opportunity';
  }, [title]);
}
