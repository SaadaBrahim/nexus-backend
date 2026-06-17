const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { basicRateLimit } = require('./middleware/basicRateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');
const linksRoutes = require('./routes/links.routes');
const tagsRoutes = require('./routes/tags.routes');
const workspacesRoutes = require('./routes/workspaces.routes');
const legacyPostsRoutes = require('./routes/legacyPosts.routes');

const app = express();

const corsOptions = env.corsOrigin === '*'
  ? {}
  : {
      origin: env.corsOrigin.split(',').map((origin) => origin.trim()),
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
    };

app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use('/api', basicRateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/health', healthRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/tags', tagsRoutes);

// Temporary compatibility layer for the current static frontend.
app.use('/api/posts', legacyPostsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
