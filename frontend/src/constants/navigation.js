import {
  LayoutDashboard, Briefcase, FileText, Bookmark, BellRing, CalendarClock, UserRound, FolderOpen, Settings, Bell,
  PlusCircle, Users, Building2, ClipboardList, Tags, MapPin, Flag, Star, Mail, ScrollText, UserCheck, ShieldCheck,
} from 'lucide-react';

export const PUBLIC_NAV = [
  { label: 'Home', to: '/' },
  { label: 'Find Jobs', to: '/find-jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Career Resources', to: '/career-resources' },
  { label: 'About', to: '/about' },
];

export const ROLE_HOME = { JOB_SEEKER: '/dashboard', EMPLOYER: '/employer/dashboard', ADMIN: '/admin' };

export const SEEKER_NAV = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Applications', to: '/dashboard/applications', icon: FileText },
  { label: 'Saved Jobs', to: '/dashboard/saved-jobs', icon: Bookmark },
  { label: 'Job Alerts', to: '/dashboard/alerts', icon: BellRing },
  { label: 'Interviews', to: '/dashboard/interviews', icon: CalendarClock },
  { label: 'Profile', to: '/dashboard/profile', icon: UserRound },
  { label: 'Resumes', to: '/dashboard/resumes', icon: FolderOpen },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

export const EMPLOYER_NAV = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Jobs', to: '/employer/jobs', icon: Briefcase, end: true },
  { label: 'Post a Job', to: '/employer/jobs/new', icon: PlusCircle },
  { label: 'Applicants', to: '/employer/applicants', icon: Users },
  { label: 'Interviews', to: '/employer/interviews', icon: CalendarClock },
  { label: 'Company Profile', to: '/employer/company', icon: Building2 },
  { label: 'Notifications', to: '/employer/notifications', icon: Bell },
  { label: 'Settings', to: '/employer/settings', icon: Settings },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Job Seekers', to: '/admin/job-seekers', icon: UserCheck },
  { label: 'Employers', to: '/admin/employers', icon: ShieldCheck },
  { label: 'Companies', to: '/admin/companies', icon: Building2 },
  { label: 'Jobs', to: '/admin/jobs', icon: Briefcase },
  { label: 'Applications', to: '/admin/applications', icon: ClipboardList },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Locations', to: '/admin/locations', icon: MapPin },
  { label: 'Reports', to: '/admin/reports', icon: Flag },
  { label: 'Featured Jobs', to: '/admin/featured-jobs', icon: Star },
  { label: 'Messages', to: '/admin/messages', icon: Mail },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
];

// Shortcuts shown in the profile dropdown / mobile menu once logged in.
export const ROLE_MENU = {
  JOB_SEEKER: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Saved Jobs', to: '/dashboard/saved-jobs' },
    { label: 'Applications', to: '/dashboard/applications' },
    { label: 'Profile', to: '/dashboard/profile' },
  ],
  EMPLOYER: [
    { label: 'Employer Dashboard', to: '/employer/dashboard' },
    { label: 'My Jobs', to: '/employer/jobs' },
    { label: 'Applicants', to: '/employer/applicants' },
    { label: 'Company Profile', to: '/employer/company' },
  ],
  ADMIN: [{ label: 'Admin Panel', to: '/admin' }],
};
