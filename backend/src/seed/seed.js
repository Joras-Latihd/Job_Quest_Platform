/*
 * Fills the database with DEMO data for local development and class demos.
 *   npm run seed
 * WARNING: it deletes existing data in the collections below first.
 * All companies, people and jobs are fictional and say so; none of them are real vacancies.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { UPLOAD_ROOT } from '../services/uploadService.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Category from '../models/Category.js';
import Location from '../models/Location.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import JobAlert from '../models/JobAlert.js';
import Notification from '../models/Notification.js';
import Interview from '../models/Interview.js';
import JobReport from '../models/JobReport.js';
import ContactMessage from '../models/ContactMessage.js';
import Article from '../models/Article.js';
import Setting from '../models/Setting.js';
import Broadcast from '../models/Broadcast.js';
import AuditLog from '../models/AuditLog.js';
import { slugify } from '../utils/helpers.js';

if (env.isProduction && process.env.ALLOW_SEED !== 'true') {
  console.error('Refusing to seed in production. Set ALLOW_SEED=true only if you really mean it.');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@jobquest.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Password123';
const inDays = (days) => new Date(Date.now() + days * 86400000);

const CATEGORIES = [
  ['Information Technology', 'Laptop'], ['Accounting & Finance', 'Scale'], ['Sales & Marketing', 'Megaphone'], ['Human Resources', 'Users'],
  ['Engineering', 'Wrench'], ['Healthcare', 'Stethoscope'], ['Education', 'GraduationCap'], ['Hospitality', 'Hotel'],
  ['Administration', 'FolderCog'], ['Design & Creative', 'Palette'], ['Customer Service', 'Headset'], ['Construction', 'HardHat'],
  ['Manufacturing', 'Factory'], ['NGO/INGO', 'HeartHandshake'], ['Banking', 'Banknote'], ['Media & Communication', 'Newspaper'],
];

const LOCATIONS = [
  ['Kathmandu', 'Kathmandu', 'Bagmati'], ['Lalitpur', 'Lalitpur', 'Bagmati'], ['Bhaktapur', 'Bhaktapur', 'Bagmati'], ['Pokhara', 'Kaski', 'Gandaki'],
  ['Chitwan', 'Chitwan', 'Bagmati'], ['Biratnagar', 'Morang', 'Koshi'], ['Butwal', 'Rupandehi', 'Lumbini'], ['Dhangadhi', 'Kailali', 'Sudurpashchim'],
];

// name, industry, city, size, verification
const COMPANIES = [
  ['Himal Tech Labs', 'Information Technology', 'Kathmandu', '51-200', 'VERIFIED', 'hr@himaltech.example'],
  ['Kathmandu Cloud Works', 'Information Technology', 'Lalitpur', '11-50', 'VERIFIED', 'jobs@cloudworks.example'],
  ['Gandaki Micro Finance', 'Banking & Finance', 'Pokhara', '201-500', 'VERIFIED', 'careers@gandakimf.example'],
  ['Lakeside Hospitality Group', 'Hospitality & Tourism', 'Pokhara', '51-200', 'VERIFIED', 'hr@lakeside.example'],
  ['Terai Agro Industries', 'Manufacturing', 'Biratnagar', '201-500', 'VERIFIED', 'hr@teraiagro.example'],
  ['Lumbini Learning Academy', 'Education', 'Butwal', '51-200', 'VERIFIED', 'principal@lumbinilearning.example'],
  ['Annapurna Care Network', 'Healthcare', 'Kathmandu', '201-500', 'VERIFIED', 'hr@annapurnacare.example'],
  ['Koshi Builders', 'Construction & Real Estate', 'Biratnagar', '51-200', 'VERIFIED', 'hr@koshibuilders.example'],
  ['Bagmati Media House', 'Media & Communication', 'Kathmandu', '11-50', 'VERIFIED', 'team@bagmatimedia.example'],
  ['Mithila Retail Hub', 'Retail & Trade', 'Chitwan', '51-200', 'VERIFIED', 'hr@mithilaretail.example'],
  ['Everlake Design Studio', 'Information Technology', 'Bhaktapur', '1-10', 'PENDING', 'hello@everlake.example'], // waiting for admin verification
  ['Chitwan Community Foundation', 'NGO/INGO', 'Chitwan', '11-50', 'VERIFIED', 'info@chitwanfoundation.example'],
];

// title, category, company #, city, type, workplace, exp min, exp max, education, salary min, salary max, skills, flags
const JOBS = [
  ['Senior React Developer', 'Information Technology', 0, 'Kathmandu', 'FULL_TIME', 'HYBRID', 3, 5, 'BACHELOR', 90000, 140000, ['React', 'JavaScript', 'TypeScript', 'REST APIs'], { featured: true }],
  ['Junior Node.js Developer', 'Information Technology', 0, 'Kathmandu', 'FULL_TIME', 'ON_SITE', 0, 2, 'BACHELOR', 40000, 60000, ['Node.js', 'Express', 'MongoDB', 'JavaScript'], { urgent: true }],
  ['MERN Stack Intern', 'Information Technology', 1, 'Lalitpur', 'INTERNSHIP', 'ON_SITE', 0, 0, 'BACHELOR', 10000, 15000, ['React', 'Node.js', 'MongoDB', 'Git']],
  ['DevOps Engineer', 'Information Technology', 1, 'Lalitpur', 'FULL_TIME', 'REMOTE', 3, 6, 'BACHELOR', 100000, 160000, ['AWS', 'Docker', 'CI/CD', 'Linux'], { featured: true }],
  ['QA Engineer', 'Information Technology', 0, 'Kathmandu', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 45000, 70000, ['Testing', 'Selenium', 'Jira'], { status: 'PENDING_APPROVAL' }],
  ['UI/UX Designer', 'Design & Creative', 10, 'Bhaktapur', 'FULL_TIME', 'HYBRID', 2, 4, 'BACHELOR', 55000, 85000, ['Figma', 'Prototyping', 'User research'], { status: 'PENDING_APPROVAL' }],
  ['Graphic Designer', 'Design & Creative', 8, 'Kathmandu', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 35000, 55000, ['Photoshop', 'Illustrator', 'Branding']],
  ['Freelance Illustrator', 'Design & Creative', 8, 'Kathmandu', 'FREELANCE', 'REMOTE', 1, null, 'OTHER', null, null, ['Illustration', 'Procreate', 'Storyboarding'], { negotiable: true }],
  ['Accountant', 'Accounting & Finance', 4, 'Biratnagar', 'FULL_TIME', 'ON_SITE', 2, 4, 'BACHELOR', 40000, 60000, ['Tally', 'Taxation', 'Excel'], { urgent: true }],
  ['Finance Officer', 'Accounting & Finance', 11, 'Chitwan', 'FULL_TIME', 'ON_SITE', 3, 5, 'MASTER', 60000, 90000, ['Budgeting', 'Reporting', 'Excel']],
  ['Credit Analyst', 'Banking', 2, 'Pokhara', 'FULL_TIME', 'ON_SITE', 2, 5, 'BACHELOR', 55000, 80000, ['Credit analysis', 'Excel', 'Risk assessment'], { featured: true }],
  ['Branch Teller', 'Banking', 2, 'Pokhara', 'FULL_TIME', 'ON_SITE', 0, 1, 'BACHELOR', 30000, 38000, ['Customer service', 'Cash handling']],
  ['Loan Recovery Officer', 'Banking', 2, 'Butwal', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 35000, 50000, ['Negotiation', 'Reporting', 'Customer service']],
  ['Marketing Officer', 'Sales & Marketing', 8, 'Kathmandu', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 40000, 65000, ['Digital marketing', 'SEO', 'Content'], { featured: true }],
  ['Sales Executive', 'Sales & Marketing', 9, 'Chitwan', 'FULL_TIME', 'ON_SITE', 0, 2, 'PLUS_TWO', 25000, 40000, ['Sales', 'Negotiation', 'Communication']],
  ['Social Media Manager', 'Sales & Marketing', 8, 'Kathmandu', 'CONTRACT', 'HYBRID', 2, 4, 'BACHELOR', 45000, 70000, ['Social media', 'Content', 'Analytics']],
  ['HR Officer', 'Human Resources', 6, 'Kathmandu', 'FULL_TIME', 'ON_SITE', 2, 4, 'BACHELOR', 45000, 70000, ['Recruitment', 'Payroll', 'Labour law']],
  ['Recruitment Intern', 'Human Resources', 0, 'Kathmandu', 'INTERNSHIP', 'ON_SITE', 0, 0, 'BACHELOR', 8000, 12000, ['Communication', 'Screening', 'Excel']],
  ['Civil Engineer', 'Engineering', 7, 'Biratnagar', 'FULL_TIME', 'ON_SITE', 3, 6, 'BACHELOR', 70000, 110000, ['AutoCAD', 'Site supervision', 'Estimating'], { featured: true }],
  ['Site Supervisor', 'Construction', 7, 'Biratnagar', 'FULL_TIME', 'ON_SITE', 2, 5, 'PLUS_TWO', 45000, 65000, ['Site management', 'Safety', 'Reporting'], { urgent: true }],
  ['Electrical Engineer', 'Engineering', 4, 'Biratnagar', 'FULL_TIME', 'ON_SITE', 2, 4, 'BACHELOR', 60000, 90000, ['Electrical systems', 'PLC', 'Maintenance']],
  ['Quantity Surveyor', 'Construction', 7, 'Butwal', 'FULL_TIME', 'ON_SITE', 2, 4, 'BACHELOR', 50000, 75000, ['Estimating', 'AutoCAD', 'Excel']],
  ['Staff Nurse', 'Healthcare', 6, 'Kathmandu', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 40000, 55000, ['Patient care', 'First aid', 'Documentation'], { urgent: true }],
  ['Lab Technician', 'Healthcare', 6, 'Lalitpur', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 38000, 52000, ['Laboratory testing', 'Sample handling', 'Safety'], { status: 'PENDING_APPROVAL' }],
  ['Mathematics Teacher', 'Education', 5, 'Butwal', 'FULL_TIME', 'ON_SITE', 2, 5, 'MASTER', 40000, 60000, ['Teaching', 'Mathematics', 'Lesson planning']],
  ['Part-time English Instructor', 'Education', 5, 'Butwal', 'PART_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 20000, 30000, ['Teaching', 'English', 'IELTS preparation']],
  ['Front Desk Executive', 'Hospitality', 3, 'Pokhara', 'FULL_TIME', 'ON_SITE', 0, 2, 'PLUS_TWO', 28000, 38000, ['Guest service', 'English', 'Booking systems']],
  ['Sous Chef', 'Hospitality', 3, 'Pokhara', 'FULL_TIME', 'ON_SITE', 3, 6, 'OTHER', 55000, 80000, ['Kitchen management', 'Menu planning', 'Food safety'], { featured: true }],
  ['Seasonal Tour Guide', 'Hospitality', 3, 'Pokhara', 'TEMPORARY', 'ON_SITE', 0, 2, 'PLUS_TWO', 25000, 35000, ['Trekking', 'English', 'First aid']],
  ['Office Administrator', 'Administration', 9, 'Chitwan', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 30000, 42000, ['MS Office', 'Filing', 'Scheduling']],
  ['Customer Support Representative', 'Customer Service', 1, 'Lalitpur', 'FULL_TIME', 'HYBRID', 0, 2, 'PLUS_TWO', 28000, 40000, ['Communication', 'Ticketing tools', 'English']],
  ['Night Shift Support Agent', 'Customer Service', 0, 'Kathmandu', 'PART_TIME', 'REMOTE', 0, 1, 'PLUS_TWO', 22000, 30000, ['Communication', 'Typing', 'English']],
  ['Production Supervisor', 'Manufacturing', 4, 'Biratnagar', 'FULL_TIME', 'ON_SITE', 3, 6, 'BACHELOR', 55000, 80000, ['Production planning', 'Team leadership', 'Quality']],
  ['Quality Control Officer', 'Manufacturing', 4, 'Biratnagar', 'FULL_TIME', 'ON_SITE', 1, 3, 'BACHELOR', 38000, 55000, ['Quality control', 'Inspection', 'Documentation']],
  ['Program Officer', 'NGO/INGO', 11, 'Chitwan', 'FULL_TIME', 'ON_SITE', 3, 5, 'MASTER', 65000, 95000, ['Project management', 'Reporting', 'Community outreach']],
  ['Community Mobilizer', 'NGO/INGO', 11, 'Chitwan', 'CONTRACT', 'ON_SITE', 1, 3, 'PLUS_TWO', 28000, 40000, ['Community outreach', 'Nepali', 'Data collection']],
  ['Content Writer', 'Media & Communication', 8, 'Kathmandu', 'PART_TIME', 'REMOTE', 1, 3, 'BACHELOR', 20000, 35000, ['Writing', 'Editing', 'SEO']],
];

const ARTICLES = [
  ['Resume tips that get you noticed', 'Keep your resume to one or two pages and lead with your strongest results.\n\nUse the same keywords that appear in the job description, and describe what you achieved rather than only what you were responsible for.\n\nSave it as a PDF so the layout stays the same on every device.'],
  ['How to prepare for an interview', 'Research the company and read the job description twice.\n\nPrepare two or three short stories that show how you solved a problem, and write down questions to ask the interviewer.\n\nPractice answering out loud, and arrive or log in ten minutes early.'],
  ['Job search tips for fresh graduates', 'Set up job alerts so new openings reach you quickly.\n\nApply early, tailor each application, and follow up politely after a week if you have not heard back.\n\nInternships and short projects are a good way to build experience before your first full-time role.'],
  ['Growing your career step by step', 'Pick skills that will still matter in five years, and ask for feedback regularly.\n\nKeep a list of your achievements so promotion and salary conversations are easy to prepare.'],
];

const DEMO_PDF = '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 100]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 52>>stream\nBT /F1 14 Tf 20 50 Td (Demo resume - Job Quest) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF';

function jobBody([title, category, , , jobType, workplace, expMin, expMax, education, salMin, salMax, skills, flags = {}], company, ids, index) {
  const years = expMin ? `${expMin}+ years of experience` : 'little or no experience';
  return {
    title,
    company: company._id,
    postedBy: company.owner,
    category: ids.categories[category],
    location: ids.locations[JOBS[index][3]],
    workplaceType: workplace,
    jobType,
    description: `${company.name} is a fictional demo company created for the Job Quest class project, and this ${title} listing is sample data, not a real vacancy. In this role you would work with the team, deliver quality work and grow your skills. Candidates with ${years} and the skills below are a good match.`,
    responsibilities: [`Carry out the daily duties of a ${title.toLowerCase()} and deliver on time`, 'Work with teammates to plan, review and improve the work', 'Keep clear records and share progress with your manager', 'Follow company policies and quality standards'],
    requirements: [`${expMin ? `${expMin}+ years in a similar role` : 'Freshers are welcome to apply'}`, ...skills.slice(0, 3).map((skill) => `Working knowledge of ${skill}`), 'Good communication in Nepali and English'],
    qualifications: [`Minimum education: ${education.replace('_', ' ').toLowerCase()}`],
    skills,
    benefits: ['Competitive salary', 'Dashain bonus', 'Paid leave', 'Learning and growth opportunities'],
    salary: { min: salMin ?? undefined, max: salMax ?? undefined, currency: 'NPR', period: 'MONTHLY', negotiable: Boolean(flags.negotiable) },
    experience: { min: expMin, max: expMax ?? undefined },
    education,
    vacancyCount: 1 + (index % 3),
    deadline: inDays(12 + ((index * 5) % 35)),
    status: flags.status || 'PUBLISHED',
    isFeatured: Boolean(flags.featured) && !flags.status,
    isUrgent: Boolean(flags.urgent),
    featureRequested: index === 6,
    views: 20 + ((index * 37) % 400),
    publishedAt: flags.status ? undefined : new Date(Date.now() - (index % 20) * 86400000 - 3600000),
    screeningQuestions: index === 0 ? [{ question: 'How many years have you used React professionally?', required: true }] : [],
  };
}

async function seed() {
  await connectDB();
  console.log('Clearing old demo data...');
  await Promise.all([User, Company, Category, Location, Job, Application, SavedJob, JobAlert, Notification, Interview, JobReport, ContactMessage, Article, Setting, Broadcast, AuditLog].map((model) => model.deleteMany({})));
  await Setting.create({ key: 'platform' });

  const categories = await Category.create(CATEGORIES.map(([name, icon]) => ({ name, icon, description: `Jobs in ${name}.` })));
  const locations = await Location.create(LOCATIONS.map(([city, district, province]) => ({ city, district, province, country: 'Nepal' })));
  const ids = {
    categories: Object.fromEntries(categories.map((item) => [item.name, item._id])),
    locations: Object.fromEntries(locations.map((item) => [item.city, item._id])),
  };

  const admin = await User.create({ name: 'Job Quest Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'ADMIN', isVerified: true });

  const companies = [];
  for (const [index, [name, industry, city, size, verificationStatus, email]] of COMPANIES.entries()) {
    const owner = await User.create({ name: `${name} Recruiter`, email, password: DEFAULT_PASSWORD, role: 'EMPLOYER', phone: `98000000${String(index).padStart(2, '0')}`, isVerified: verificationStatus === 'VERIFIED' });
    const company = await Company.create({
      owner: owner._id, name, industry, size, email, verificationStatus, location: ids.locations[city], phone: owner.phone, website: `https://${slugify(name)}.example`,
      address: `${city}, Nepal`, foundedYear: 2008 + index,
      description: `${name} is a fictional company used for Job Quest demo data. It operates in ${industry.toLowerCase()} and is based in ${city}. Nothing on this page describes a real organisation.`,
      socialLinks: { linkedin: 'https://linkedin.com/company/demo', facebook: 'https://facebook.com/demo' },
    });
    await User.updateOne({ _id: owner._id }, { company: company._id });
    companies.push(company);
  }

  const seekerData = [
    ['Saroj Shrestha', 'saroj@example.com', 'Junior MERN Stack Developer', ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Git'], 1, 'Kathmandu', 'FULL_TIME', 'Bachelor in Computer Science'],
    ['Anita Gurung', 'anita@example.com', 'Accountant', ['Tally', 'Taxation', 'Excel'], 3, 'Pokhara', 'FULL_TIME', 'Bachelor of Business Studies'],
    ['Bikash Rai', 'bikash@example.com', 'Civil Engineer', ['AutoCAD', 'Estimating', 'Site supervision'], 4, 'Biratnagar', 'FULL_TIME', 'Bachelor in Civil Engineering'],
    ['Sunita Tamang', 'sunita@example.com', 'Marketing Graduate', ['SEO', 'Content', 'Social media'], 0, 'Kathmandu', 'INTERNSHIP', 'Master of Business Administration'],
    ['Prakash Thapa', 'prakash@example.com', 'QA Engineer', ['Testing', 'Selenium', 'Jira'], 2, 'Lalitpur', 'FULL_TIME', 'Bachelor in Computer Engineering'],
  ];
  await fs.mkdir(path.join(UPLOAD_ROOT, 'resumes'), { recursive: true });
  await fs.writeFile(path.join(UPLOAD_ROOT, 'resumes', 'demo-resume.pdf'), DEMO_PDF);

  const seekers = [];
  for (const [name, email, headline, skills, years, location, jobType, degree] of seekerData) {
    seekers.push(await User.create({
      name, email, password: DEFAULT_PASSWORD, role: 'JOB_SEEKER', headline, skills, yearsOfExperience: years, location: `${location}, Nepal`, preferredLocation: location,
      jobTypePreference: jobType, bio: `Demo profile for ${name}.`, education: [{ degree, institution: 'Demo University', fieldOfStudy: headline }],
      experience: years ? [{ company: 'Demo Employer Pvt. Ltd.', position: headline, startDate: inDays(-365 * years), description: 'Sample experience entry.' }] : [],
      resumes: [{ name: `${name.split(' ')[0]}-resume.pdf`, url: `${env.serverUrl}/uploads/resumes/demo-resume.pdf`, publicId: 'local:resumes/demo-resume.pdf', size: DEMO_PDF.length, mimeType: 'application/pdf', isDefault: true }],
    }));
  }

  const jobs = await Job.create(JOBS.map((row, index) => jobBody(row, companies[row[2]], ids, index)));
  const published = jobs.filter((job) => job.status === 'PUBLISHED');

  // Applications: Saroj (the main demo job seeker) plus a few others so employers have applicants to review.
  const makeApplication = (candidate, job, status, extra = {}) => Application.create({
    job: job._id, candidate: candidate._id, resume: { name: candidate.resumes[0].name, url: candidate.resumes[0].url, mimeType: 'application/pdf' },
    coverLetter: `Hello, I would like to apply for the ${job.title} position. (Demo cover letter.)`,
    answers: job.screeningQuestions.map((item) => ({ question: item.question, answer: '1 year on personal and academic projects.' })),
    status, statusHistory: [{ status: 'APPLIED' }, ...(status !== 'APPLIED' ? [{ status }] : [])], appliedAt: inDays(-3), ...extra,
  });
  const [saroj, anita, bikash, sunita, prakash] = seekers;
  const byTitle = (title) => jobs.find((job) => job.title === title);
  const sarojApps = [
    await makeApplication(saroj, byTitle('Senior React Developer'), 'SHORTLISTED'),
    await makeApplication(saroj, byTitle('Junior Node.js Developer'), 'INTERVIEW'),
    await makeApplication(saroj, byTitle('MERN Stack Intern'), 'APPLIED'),
  ];
  await makeApplication(anita, byTitle('Accountant'), 'UNDER_REVIEW');
  await makeApplication(bikash, byTitle('Civil Engineer'), 'SELECTED');
  await makeApplication(sunita, byTitle('Marketing Officer'), 'APPLIED');
  await makeApplication(prakash, byTitle('Junior Node.js Developer'), 'APPLIED');
  await makeApplication(sunita, byTitle('Junior Node.js Developer'), 'REJECTED');

  const nodeJob = byTitle('Junior Node.js Developer');
  const interview = await Interview.create({
    application: sarojApps[1]._id, job: nodeJob._id, candidate: saroj._id, employer: nodeJob.postedBy,
    scheduledAt: inDays(3), type: 'ONLINE', locationOrLink: 'https://meet.example/demo-interview', notes: 'Please keep your resume handy. (Demo interview)',
  });
  await Application.updateOne({ _id: sarojApps[1]._id }, { interview: interview._id });

  // Counters, saved jobs, alerts, notifications, report, contact messages, articles.
  const counts = await Application.aggregate([{ $group: { _id: '$job', count: { $sum: { $cond: [{ $ne: ['$status', 'WITHDRAWN'] }, 1, 0] } } } }]);
  await Promise.all(counts.map((item) => Job.updateOne({ _id: item._id }, { applicationsCount: item.count })));

  await SavedJob.create([byTitle('DevOps Engineer'), byTitle('Credit Analyst')].map((job) => ({ user: saroj._id, job: job._id })));
  await JobAlert.create({ user: saroj._id, name: 'React Developer Jobs', keywords: 'React Developer', location: 'Kathmandu', jobType: 'FULL_TIME', minSalary: 40000, frequency: 'DAILY' });
  await Notification.create([
    { user: saroj._id, type: 'APPLICATION_STATUS', title: 'Application status updated', message: 'Your application for Junior Node.js Developer is now: interview.', link: `/dashboard/applications/${sarojApps[1]._id}` },
    { user: saroj._id, type: 'APPLICATION_SUBMITTED', title: 'Application submitted', message: 'Your application for MERN Stack Intern was sent.', link: `/dashboard/applications/${sarojApps[2]._id}` },
    { user: companies[0].owner, type: 'NEW_APPLICATION', title: 'New application', message: 'Prakash Thapa applied for Junior Node.js Developer.', link: '/employer/applicants' },
    { user: admin._id, type: 'EMPLOYER_PENDING', title: 'New employer to verify', message: 'Everlake Design Studio is waiting for verification.', link: '/admin/employers' },
  ]);
  await JobReport.create({ job: byTitle('Sales Executive')._id, reporter: saroj._id, reason: 'INCORRECT_INFO', details: 'Demo report: the salary looks different from the description.' });
  await ContactMessage.create([
    { name: 'Demo Visitor', email: 'visitor@example.com', subject: 'Question about employer verification', message: 'How long does it take to verify a new employer account? (demo message)' },
    { name: 'Another Visitor', email: 'visitor2@example.com', subject: 'Partnership idea', message: 'We would like to discuss listing our internships. (demo message)', isRead: true },
  ]);
  await Article.create(ARTICLES.map(([title, content], index) => ({ title, content, author: admin._id, status: 'PUBLISHED', publishedAt: inDays(-index * 4) })));

  console.log('\nSeed complete.');
  console.log(`  ${categories.length} categories, ${locations.length} locations, ${companies.length} companies, ${jobs.length} jobs (${published.length} published)`);
  console.log('\nDemo logins (local development only):');
  console.log(`  Admin       ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Job seeker  saroj@example.com / ${DEFAULT_PASSWORD}`);
  console.log(`  Employer    hr@himaltech.example / ${DEFAULT_PASSWORD}   (verified)`);
  console.log(`  Employer    hello@everlake.example / ${DEFAULT_PASSWORD}   (pending verification)\n`);
}

seed()
  .catch((error) => { console.error('Seed failed:', error); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
