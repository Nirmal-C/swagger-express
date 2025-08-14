require('dotenv').config();

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


/**
 * Middleware: Basic Auth for Swagger Try it Out only
 */
const swaggerTryItAuth = (req, res, next) => {
  const isFromSwagger = req.headers.referer && req.headers.referer.includes('/api-docs');

  if (isFromSwagger) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Basic ')) {
      return res.status(401).json({ message: 'Swagger Try it out requires Basic Auth' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const SWAGGER_USER = process.env.SWAGGER_USER;
    const SWAGGER_PASS = process.env.SWAGGER_PASS;

    if (username !== SWAGGER_USER || password !== SWAGGER_PASS) {
      return res.status(401).json({ message: 'Invalid Swagger Basic Auth credentials' });
    }
  }

  next();
};

// Apply only to API routes (Swagger Try it Out requests)
app.use('/api', swaggerTryItAuth);

/**
 * Swagger setup
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Device Management API',
      version: '1.0.0',
      description: 'API for managing device locks, unlocks, sync, uploads, and status checks.',
    },
    servers: [{ url: `http://server-ip:${PORT}` }],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
    },
    security: [{ basicAuth: [] }],
  },
  apis: [__filename], // Use JSDoc comments for endpoints
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

