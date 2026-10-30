module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  // CORS : origines du front Angular (dev server et SSR)
  {
    name: 'strapi::cors',
    config: { origin: ['http://localhost:4200', 'http://localhost:4000'], methods: ['GET', 'HEAD', 'OPTIONS'] },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
