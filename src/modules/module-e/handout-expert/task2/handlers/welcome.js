const url = require('url');

function welcome(req, res) {
    const parsed = url.parse(req.url, true);
    const query = parsed.query;
    const name = query.name || "guest";

    // !!!VULN-12 [A03 Injection] Directly interpolating user input into HTML without sanitization
    const html = `
    <html lang="en">
      <body>
        <h1>Hello ${name}</h1>
      </body>
    </html>`;

    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    res.end(html);
}

module.exports = { welcome };
