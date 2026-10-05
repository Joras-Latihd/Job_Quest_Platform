import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

const port = Number(process.env.PORT) || 5000;

export const env = {
  nodeEnv,
  isProduction,
  port,
  mongoUri: isProduction ? required('MONGO_URI') : process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobquest',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || `http://localhost:${port}`,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export const isCloudinaryConfigured = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
