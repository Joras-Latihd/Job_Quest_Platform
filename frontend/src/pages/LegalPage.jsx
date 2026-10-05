import useDocumentTitle from '@/hooks/useDocumentTitle';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Information we collect', 'Job Quest stores the details you provide: your account information, profile, uploaded resumes and the applications you submit.'],
      ['How information is used', 'Your profile and resume are shared with an employer only when you apply to that employer\'s job. We use your data to run the platform, show relevant jobs and send notifications.'],
      ['Your choices', 'You can edit your profile, delete resumes and change your password at any time from your dashboard.'],
      ['Security', 'Passwords are stored hashed, and access to sensitive areas is restricted by role.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Using Job Quest', 'You agree to provide accurate information and to use the platform only for genuine job searching and recruitment.'],
      ['Employers', 'Employers must only post real vacancies. Listings may be reviewed, rejected or removed by administrators.'],
      ['Job seekers', 'Applications are sent to the employer you apply to. Job Quest does not guarantee interviews or employment.'],
      ['Reporting', 'If you see a suspicious listing, use the Report button on the job page so the team can review it.'],
    ],
  },
};

export default function LegalPage({ kind }) {
  const { title, sections } = CONTENT[kind];
  useDocumentTitle(title);
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Placeholder text for a classroom project. This page has not been reviewed by a lawyer and must be replaced before any real-world launch.</p>
      {sections.map(([heading, text]) => (
        <section key={heading} className="mt-8"><h2 className="text-xl font-semibold">{heading}</h2><p className="mt-2 text-slate-600">{text}</p></section>
      ))}
    </div>
  );
}
