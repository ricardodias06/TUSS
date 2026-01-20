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
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3001),
      host: '127.0.0.1', // FORÇA IPv4 (Corrige problemas de localhost no Windows)
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
      },
      cors: {
        origin: '*', // Permite qualquer site (Frontend)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: false, // IMPORTANTE: Tem de ser false para usar origin '*' sem erros
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}