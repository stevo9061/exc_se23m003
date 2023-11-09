# Start the microservice app

Please make sure that you are in the root directory and make sure that Docker Runtime is started.
The project folder path contains the `compose.yaml` file, which starts the containers.

In the `factors.md` is described how to start different the builds with the specific .env files.

But I like to show it here anyway:

`docker-compose --env-file .env.dev up -d   # Starts the development environment`

`docker-compose --env-file .env.test up -d  # Starts the test environment`

`docker-compose --env-file .env.prod up -d  # Starts the production environment`

## Information

The same ports are set in each of the three .env files, which means that every time you want to start one of the different builds, the current one is replaced by the new one. Due to time constraints, I have not changed the ports, so it is not possible to start all 3 builds at the same time.
