import express from 'express';
import bodyParser from 'body-parser';
import handler from '../api/index.js';

const app = express();
app.use(bodyParser.json());

// All API routes forwarded to the same handler used on Vercel
app.use('/api', (req, res) => {
  // normalize url so the handler sees the full path
  req.url = '/api' + req.path;
  // call the handler
  return handler(req, res);
});

const port = process.env.LOCAL_API_PORT || 3001;
app.listen(port, () => console.log(`Local API server listening on http://localhost:${port}`));
