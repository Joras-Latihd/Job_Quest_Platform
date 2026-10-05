import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import sanitize from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { UPLOAD_ROOT } from './services/uploadService.js';

const app = express();

app.disable('x-powered-by');
// cross-origin resource policy is relaxed so the React app (another origin) can show uploaded images.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl.split(',').map((url) => url.trim()), credentials: true }));
if (!env.isProduction) app.use(morgan('dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitize);
app.use('/api', apiLimiter);

// Files saved on local disk when Cloudinary is not configured.
app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d', index: false }));

app.use('/api/v1', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
