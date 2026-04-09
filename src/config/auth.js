module.exports = {
    AUTH: {
        JWT_SECRET: process.env.JWT_SECRET_KEY || 'iamsecrettokenkey',
        JWT_EXPIRATION: process.env.JWT_EXPIRATION_TIME || '8h',

        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET_KEY || 'iamsecrettokenkey',
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',

        /* Increased session durations */
        TOKEN_MAX_AGE: Number(process.env.TOKEN_MAX_AGE) || 28800000,  /* 8 hours in milliseconds (8 * 60 * 60 * 1000) */
        REFRESH_TOKEN_MAX_AGE: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 604800000,  /* 7 days in milliseconds (7 * 24 * 60 * 60 * 1000) */
    }
};
