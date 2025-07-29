#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables by environment
const requiredEnvVars = {
    development: [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'JWT_SECRET',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'RAPIDAPI_KEY',
        'XAI_API_KEY'
    ],
    production: [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'REDIS_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'RAPIDAPI_KEY',
        'XAI_API_KEY',
        'HEDERA_OPERATOR_ID',
        'HEDERA_OPERATOR_KEY',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'CORS_ORIGIN',
        'SENTRY_DSN'
    ],
    test: [
        'NODE_ENV',
        'DATABASE_URL',
        'JWT_SECRET',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY'
    ]
};

// Define optional environment variables with validation
const optionalEnvVars = {
    'RATE_LIMIT_AUTH': { type: 'number', min: 1, max: 100 },
    'RATE_LIMIT_AUTH_WINDOW': { type: 'number', min: 1, max: 60 },
    'RATE_LIMIT_API': { type: 'number', min: 1, max: 1000 },
    'RATE_LIMIT_API_WINDOW': { type: 'number', min: 1, max: 60 },
    'RATE_LIMIT_DIAGNOSTIC': { type: 'number', min: 1, max: 50 },
    'RATE_LIMIT_DIAGNOSTIC_WINDOW': { type: 'number', min: 1, max: 60 },
    'UPLOAD_MAX_SIZE': { type: 'number', min: 1024, max: 52428800 }, // 1KB to 50MB
    'CACHE_TTL': { type: 'number', min: 60, max: 86400 }, // 1 minute to 24 hours
    'LOG_LEVEL': { type: 'enum', values: ['error', 'warn', 'info', 'debug'] }
};

// Validation functions
const validators = {
    number: (value, config) => {
        const num = parseInt(value);
        if (isNaN(num)) return `Must be a valid number`;
        if (config.min && num < config.min) return `Must be at least ${config.min}`;
        if (config.max && num > config.max) return `Must be at most ${config.max}`;
        return null;
    },
    enum: (value, config) => {
        if (!config.values.includes(value)) {
            return `Must be one of: ${config.values.join(', ')}`;
        }
        return null;
    },
    url: (value) => {
        try {
            new URL(value);
            return null;
        } catch {
            return 'Must be a valid URL';
        }
    },
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Must be a valid email address';
        return null;
    },
    jwt: (value) => {
        if (value.length < 32) return 'JWT secret must be at least 32 characters long';
        return null;
    }
};

function validateEnvironment() {
    const env = process.env.NODE_ENV || 'development';
    const required = requiredEnvVars[env] || requiredEnvVars.development;
    
    console.log(`🔍 Validating environment variables for ${env} environment...\n`);
    
    const missing = [];
    const invalid = [];
    const warnings = [];
    
    // Check required variables
    for (const varName of required) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }
    
    // Check optional variables with validation
    for (const [varName, config] of Object.entries(optionalEnvVars)) {
        if (process.env[varName]) {
            const validator = validators[config.type];
            if (validator) {
                const error = validator(process.env[varName], config);
                if (error) {
                    invalid.push({ varName, error });
                }
            }
        }
    }
    
    // Additional validations for specific variables
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
        warnings.push('DATABASE_URL should use postgresql:// protocol');
    }
    
    if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis://')) {
        warnings.push('REDIS_URL should use redis:// protocol');
    }
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        invalid.push({ varName: 'JWT_SECRET', error: 'Must be at least 32 characters long' });
    }
    
    if (process.env.CORS_ORIGIN && !validators.url(process.env.CORS_ORIGIN)) {
        invalid.push({ varName: 'CORS_ORIGIN', error: 'Must be a valid URL' });
    }
    
    // Security warnings
    if (process.env.JWT_SECRET === 'super_secret_jwt_string_here') {
        warnings.push('JWT_SECRET should be changed from default value');
    }
    
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('localhost')) {
        warnings.push('DATABASE_URL should not use localhost in production');
    }
    
    // Report results
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('');
    }
    
    if (invalid.length > 0) {
        console.error('❌ Invalid environment variables:');
        invalid.forEach(({ varName, error }) => {
            console.error(`   - ${varName}: ${error}`);
        });
        console.error('');
    }
    
    if (warnings.length > 0) {
        console.warn('⚠️  Warnings:');
        warnings.forEach(warning => {
            console.warn(`   - ${warning}`);
        });
        console.warn('');
    }
    
    if (missing.length === 0 && invalid.length === 0) {
        console.log('✅ All required environment variables are properly configured!');
        
        if (warnings.length === 0) {
            console.log('✅ No warnings detected.');
        }
        
        return true;
    }
    
    return false;
}

// Run validation if this script is executed directly
if (require.main === module) {
    const isValid = validateEnvironment();
    process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment, requiredEnvVars, optionalEnvVars };