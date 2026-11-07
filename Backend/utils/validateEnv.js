/**
 * Environment Variable Validation Module
 * Validates required environment variables prior to server startup.
 * In production: strictly enforces valid values for core variables.
 * Never logs or exposes secret values in error messages.
 */

function validateEnv(env = process.env) {
    const isProduction = env.NODE_ENV === 'production';
    const missing = [];
    const invalid = [];

    if (isProduction) {
        // 1. Validate MONGO_URI
        if (!env.MONGO_URI || !env.MONGO_URI.trim()) {
            missing.push('MONGO_URI');
        } else if (!env.MONGO_URI.startsWith('mongodb://') && !env.MONGO_URI.startsWith('mongodb+srv://')) {
            invalid.push('MONGO_URI (must begin with mongodb:// or mongodb+srv://)');
        }

        // 2. Validate JWT_SECRET
        if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) {
            missing.push('JWT_SECRET');
        } else if (env.JWT_SECRET.length < 32) {
            invalid.push('JWT_SECRET (must be at least 32 characters in production)');
        } else if (env.JWT_SECRET.includes('replace_with_a_secure')) {
            invalid.push('JWT_SECRET (cannot use default placeholder template)');
        }

        // 3. Validate CORS origins
        if (!env.CLIENT_URL && !env.ALLOWED_ORIGINS) {
            missing.push('CLIENT_URL or ALLOWED_ORIGINS (required for CORS whitelist in production)');
        }
    }

    if (missing.length > 0 || invalid.length > 0) {
        const errorDetails = [];
        if (missing.length > 0) {
            errorDetails.push(`Missing required variable(s): ${missing.join(', ')}`);
        }
        if (invalid.length > 0) {
            errorDetails.push(`Invalid variable configuration: ${invalid.join(', ')}`);
        }

        const message = `[FATAL] Environment validation failed:\n - ${errorDetails.join('\n - ')}\nServer startup aborted. Please define valid configuration in your deployment environment.`;
        const err = new Error(message);
        err.isEnvError = true;
        throw err;
    }

    return true;
}

module.exports = { validateEnv };

