// const expressjwt = require('express-jwt');
const { expressjwt: jwt } = require("express-jwt");
const jsonwebtoken = require('jsonwebtoken');

function resolveAuth(req) {
    if (req.auth && req.auth.userId) {
        return req.auth;
    }

    const header = req.headers?.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    try {
        return jsonwebtoken.verify(token, process.env.SECRET);
    } catch {
        return null;
    }
}

function adminOnly(req, res, next) {
    const auth = resolveAuth(req) || {};
    req.auth = auth;
    if (!auth.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}

function authJwt() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms: ['HS256'],
        // isRevoked: isRevoked
    })
        .unless({
            path: [
                {
                    url: /\/api\/v1\/products(.*)/,
                    methods: ['GET',  'PUT', 'OPTIONS', 'DELETE']
                },
                {
                    url: /\/api\/v1\/categories(.*)/,
                    methods: ['GET', 'POST', 'PUT', 'OPTIONS', ]
                },
                {
                    url: /\/api\/v1\/orders(.*)/,
                    methods: ['GET', 'POST', 'PUT', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/reviews(.*)/,
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/notifications(.*)/,
                    methods: ['GET', 'PUT', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/promotions$/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/promotions\/product(.*)/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/public\/uploads(.*)/,
                    methods: ['GET', 'OPTIONS', 'POST']
                },
                `${api}/users`,
                `${api}/users/login`,
                `${api}/users/register`,
                `${api}/users/firebase-login`,
                `${api}/users/forgot-password`,
                `${api}/users/reset-password`,
            ]
        })
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true)
    }
    done();
}



module.exports = authJwt
module.exports.adminOnly = adminOnly