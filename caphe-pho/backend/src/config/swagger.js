// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '☕ Cà Phê Phố API',
      version: '3.0.0',
      description: 'REST API cho web review quán cà phê & trà sữa.\n\n**Demo login:** `minh@demo.com` / `demo1234`',
    },
    servers: [{ url: '/api', description: 'API Server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token từ /auth/login',
        },
      },
      schemas: {
        Cafe: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            name:         { type: 'string',  example: 'The Workshop Coffee' },
            address:      { type: 'string',  example: '27 Ngô Đức Kế, Q.1, TP.HCM' },
            tags:         { type: 'array', items: { type: 'string' }, example: ['cà phê','specialty'] },
            emoji:        { type: 'string',  example: '☕' },
            description:  { type: 'string' },
            avg_rating:   { type: 'string',  example: '4.5' },
            review_count: { type: 'integer', example: 12 },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id:         { type: 'integer', example: 1 },
            cafe_id:    { type: 'integer', example: 1 },
            reviewer:   { type: 'string',  example: 'Minh Trí' },
            stars:      { type: 'integer', example: 5, minimum: 1, maximum: 5 },
            content:    { type: 'string',  example: 'Cà phê ngon, không gian đẹp!' },
            created_at: { type: 'string',  example: '2026-01-15T10:30:00Z' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:    { type: 'integer', example: 1 },
            name:  { type: 'string',  example: 'Minh Trí' },
            email: { type: 'string',  example: 'minh@demo.com' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string', example: 'Thông báo lỗi' } },
        },
      },
    },
  },
  // Swagger đọc JSDoc comments từ các file routes
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
