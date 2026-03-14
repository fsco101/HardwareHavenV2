function errorHandler(err, req, res, next) {
    // JWT authentication error
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ success: false, message: "The user is not authorized" });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors || {}).map(e => e.message);
        return res.status(422).json({ success: false, message: messages.join(', ') || err.message });
    }

    // Mongoose cast error (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {}).join(', ');
        return res.status(409).json({ success: false, message: `Duplicate value for: ${field}` });
    }

    // JSON syntax error (malformed body)
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: "Invalid JSON in request body" });
    }

    // Log unexpected errors
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);

    // Default to 500 server error — don't leak internals
    return res.status(500).json({ success: false, message: "Internal server error" });
}

module.exports = errorHandler;