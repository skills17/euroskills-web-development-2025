import dotenv from 'dotenv';
dotenv.config({quiet: true});
import app from './app.js';

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`[windfarm] listening on http://localhost:${port}`);
});
