require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDb = require('./db/db');
const { validateEnv } = require('./utils/validateEnv');

const userRouter = require('./routes/user.routes');
const workspaceRouter = require('./routes/workspace.routes');
const projectRouter = require('./routes/project.routes');
const taskRouter = require('./routes/task.routes');
const invitationActionRouter = require('./routes/invitationAction.routes');
const notificationRouter = require('./routes/notification.routes');
const sprintRouter = require('./routes/sprint.routes');
const searchRouter = require('./routes/search.routes');
const savedViewRouter = require('./routes/savedView.routes');
const analyticsRouter = require('./routes/analytics.routes');

const app = express();
app.disable('x-powered-by');

// Reverse Proxy Configuration (Render / Cloud deployment)
// Render operates behind 1 proxy hop. Setting trust proxy to 1 ensures req.ip resolves to the real client IP
// rather than the internal Render load balancer, preventing global rate limiting pooling while mitigating IP spoofing.
const trustProxyConfig = process.env.TRUST_PROXY !== undefined
    ? (isNaN(process.env.TRUST_PROXY) ? process.env.TRUST_PROXY : Number(process.env.TRUST_PROXY))
    : (process.env.NODE_ENV === 'production' ? 1 : false);

if (trustProxyConfig) {
    app.set('trust proxy', trustProxyConfig);
}
const PORT = process.env.PORT || 3000;
const isTestEnv = process.env.NODE_ENV === 'test';

// 1. HTTP Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS Configuration with Production Whitelist
const getAllowedOrigins = () => {
    const configuredOrigins = [];

    if (process.env.ALLOWED_ORIGINS) {
        process.env.ALLOWED_ORIGINS.split(',').forEach((o) => {
            const trimmed = o.trim();
            if (trimmed && !configuredOrigins.includes(trimmed)) {
                configuredOrigins.push(trimmed);
            }
        });
    }

    if (process.env.CLIENT_URL) {
        const trimmedClient = process.env.CLIENT_URL.trim();
        if (trimmedClient && !configuredOrigins.includes(trimmedClient)) {
            configuredOrigins.push(trimmedClient);
        }
    }

    const defaultDevOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    return process.env.NODE_ENV === 'production'
        ? configuredOrigins
        : Array.from(new Set([...defaultDevOrigins, ...configuredOrigins]));
};

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile clients, server-to-server, curl, health probes)
        if (!origin) {
            return callback(null, true);
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const allowedOrigins = getAllowedOrigins();

        // Strictly verify against configured allowed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // In non-production environments, allow local development origins dynamically
        if (!isProduction && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
            return callback(null, true);
        }

        return callback(new Error('CORS policy: Not allowed by CORS for this origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Request Body Size Limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. NoSQL Injection & Prototype Pollution Sanitizer
const sanitizeInput = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeInput(obj[key]);
        }
    }
    return obj;
};

app.use((req, res, next) => {
    if (req.body) sanitizeInput(req.body);
    if (req.query) sanitizeInput(req.query);
    if (req.params) sanitizeInput(req.params);
    next();
});

// 5. Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isTestEnv ? 1000 : 60, // 60 requests per 15 minutes in production
    message: { message: "Too many authentication attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTestEnv
});

const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTestEnv ? 5000 : 1500, // 1500 requests per 15 minutes
    message: { message: "Too many requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTestEnv
});

const invitationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTestEnv ? 1000 : 60,
    message: { message: "Too many invitation attempts. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTestEnv
});

app.use('/api', generalApiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/change-password', authLimiter);
app.use('/api/workspaces/:workspaceId/invitations', invitationLimiter);

// 6. Health & Status Endpoints
app.get('/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "ok" : "degraded",
        database: isDbConnected ? "connected" : "disconnected"
    });
});

app.get('/api/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "ok" : "degraded",
        database: isDbConnected ? "connected" : "disconnected",
        message: isDbConnected ? "DevSpace backend is healthy and running" : "Database connection degraded"
    });
});

// 7. Route Handlers
app.use('/api/auth', userRouter);
app.use('/api/workspaces', workspaceRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/invitations', invitationActionRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/sprints', sprintRouter);
app.use('/api/search', searchRouter);
app.use('/api/views', savedViewRouter);
app.use('/api/analytics', analyticsRouter);

// 8. 404 Route Fallback
app.use('/api', (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// 9. Global Error Handler (Sanitizes internal server errors from production exposure)
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ message: err.message });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request payload too large' });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid resource identifier format' });
    }
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Malformed JSON payload' });
    }
    if (err.code === 11000) {
        return res.status(400).json({ message: 'A resource with this key already exists' });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    if (!isTestEnv) {
        console.error('Unhandled server error:', isProduction ? err.message : err);
    }

    res.status(err.status || 500).json({
        message: isProduction
            ? (err.status ? err.message : "Internal server error")
            : (err.message || "Internal server error")
    });
});

if (require.main === module) {
    try {
        validateEnv();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }

    connectDb();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
