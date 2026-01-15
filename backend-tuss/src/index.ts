import {ApplicationConfig, BackendTussApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new BackendTussApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Configuração
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The graceful shutdown period in milliseconds
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      // --- AQUI ESTÁ A CORREÇÃO CORS ---
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true,
        // ESTA É A LINHA QUE O ERRO PEDIA:
        exposedHeaders: ['Content-Range', 'X-Total-Count'],
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
