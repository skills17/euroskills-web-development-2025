// RFC 7807 helpers
export function problem(res, status, typeSuffix, title, detail, extra = {}) {
    const type = `https://example.com/problems${typeSuffix}`; // stable URI per type
    res.status(status);
    res.setHeader('Content-Type', 'application/problem+json');
    res.json({ type, title, status, detail, ...extra });
}

export function unauthorized(res, detail = 'Unauthorized') {
    return problem(res, 401, '/unauthorized', 'Unauthorized', detail);
}

export function forbidden(res, detail = 'Forbidden') {
    return problem(res, 403, '/forbidden', 'Forbidden', detail);
}

export function notFound(res, detail = 'Not Found') {
    return problem(res, 404, '/not-found', 'Not Found', detail);
}

export function badRequest(res, detail = 'Bad Request', errors) {
    return problem(res, 400, '/validation-error', 'Validation Error', detail, errors ? { errors } : {});
}

export function conflict(res, detail = 'Conflict') {
    return problem(res, 409, '/conflict', 'Conflict', detail);
}

export function internal(res, detail = 'Internal Server Error') {
    return problem(res, 500, '/internal-error', 'Internal Server Error', detail);
}

export function problemHandler(err, _req, res, _next) {
    console.error(err);
    if (res.headersSent) return;
    internal(res, 'Unhandled server error');
}
