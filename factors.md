# **The Twelve Factors**

## **I. Codebase**

*One codebase tracked in revision control, many deploys. There is only one codebase per app, but there will be many deploys of the app. A deploy is a running instance of the app*.

docker-compose --env-file .env.dev up -d   # Starts the development environment

docker-compose --env-file .env.test up -d  # Starts the test environment

docker-compose --env-file .env.prod up -d  # Starts the production environment

The different configurations are available in the respective .env* files.

## **II. Dependencies**

*Explicitly declare and isolate dependencies*.

*A twelve-factor app never relies on implicit existence of system-wide packages. It declares all dependencies, completely and exactly, via a dependency declaration manifest. Furthermore, it uses a dependency isolation tool during execution to ensure that no implicit dependencies “leak in” from the surrounding system. The full and explicit dependency specification is applied uniformly to both production and development*.

Docker is an excellent tool for implementing the principles of explicit declaration and isolation of dependencies.
A Docker image acts as a kind of "snapshot" of your application and its environment, which has several advantages:

- **Explicit declaration of dependencies** - By using a Dockerfile, you can explicitly define all dependencies of your application. The Dockerfile specifies which base images to use (e.g. node:14 for a Node.js application) and defines all the commands needed to install the required dependencies.

- **Isolation** - Docker containers are isolated by nature. This means that they bring their own dependencies and do not rely on the presence or availability of these dependencies on the host system. This prevents conflicts between projects and ensures that the application runs in the same environment no matter where the container is started.

I have written a separate Dockerfile for the frontend, backend and the database which can be started together with a 'compose.yaml' file.

## **III. Config**

*Store config in the environment*.

Apps sometimes store config as constants in the code. This is a violation of twelve-factor, which requires strict separation of config from code. Config varies substantially across deploys, code does not. The twelve-factor app stores config in environment variables (often shortened to env vars or env). Env vars are easy to change between deploys without changing any code; unlike config files, there is little chance of them being checked into the code repo accidentally; and unlike custom config files, or other config mechanisms such as Java System Properties, they are a language- and OS-agnostic standard.

In the compose.yaml file already mentioned, environment variables are set for the environment (dev, prod, test) and for the ports. For the sake of simplicity, however, all three deployments have the same port specification in the ENV files.
To completely fulfill the factor 12, I think you would have to change the ports in the .env file so that you can really start all 3 builds at the same time. Of course, it would have been more elegant to have my own build server, but this would have been too time-consuming for me, and I would have needed more time for that.

## **IV. Backing services**

Treat backing services as attached resources

The code for a twelve-factor app makes no distinction between local and third party services. Resources can be attached to and detached from deploys at will. For example, if the app’s database is misbehaving due to a hardware issue, the app’s administrator might spin up a new database server restored from a recent backup. The current production database could be detached, and the new database attached – all without any code changes.

### Example compose.yaml

```yaml
version: '3'

services:
  backend:
    build:
      context: ./02-backend/spring-boot-ecommerce
      dockerfile: Dockerfile
    ports:
      - "${BACKEND_PORT}:8080"
    networks:
      - dev_network
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/${MYSQL_DATABASE}
      SPRING_DATASOURCE_USERNAME: ${MYSQL_USER}
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD}

  frontend:
    build:
      context: ./03-frontend/angular-ecommerce
      dockerfile: Dockerfile
    ports:
      - "${FRONTEND_PORT}:80"
    networks:
      - dev_network
    environment:
      ANGULAR_PROFILES_ACTIVE: ${ANGULAR_PROFILES_ACTIVE} 

  db:
    build:
      context: ./SQL-Schema/
      dockerfile: Dockerfile
    ports:
      - "${DB_PORT}:3306"
    networks:
      - dev_network
    environment:
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}

networks:
  dev_network:
    driver: bridge
```

### Example .env.dev

```yaml
BACKEND_PORT=5000
SPRING_PROFILES_ACTIVE=dev

FRONTEND_PORT=4200
ANGULAR_PROFILES_ACTIVE=dev

DB_PORT=3306
MYSQL_DATABASE=meineDatenbank
MYSQL_USER=meinBenutzer
MYSQL_PASSWORD=meinPasswort
MYSQL_ROOT_PASSWORD=meinRootPasswort

ENV_NETWORK=dev_network
```

In this example, the URL can be changed very easily using an environment variable ${SPRING_DATASOURCE_URL}.
In my opinion, we have a nice example of a loose coupling. In practice, this `compose.yaml` is not yet in use, two additional databases would also be required, but unfortunately this could not be implemented due to time constraints.

## **V. Build, release, run**

Twelve-Factor's "build, release, run" approach means that the steps for creating the codebase, creating a release and running the application should be strictly separated, creating a release and running the application should be strictly separated.

### Build

The "Build" step should create a Docker image from the code that contains all dependencies,
but no configurations for the runtime or environments yet. The image should remain the same wherever Docker
is running, it should remain the same.

In my `compose.yaml` it looks like this for the backend, for example:

```yaml
services:
  backend:
    build:
      context: ./02-backend/spring-boot-ecommerce
      dockerfile: Dockerfile
    ...  
```

### Release

The "Release" step takes the build, combines it with the current configuration for the environment (development, test or production environment) and creates an executable release.

With `compose.yaml`, this step is performed implicitly when the image is started with the specific configurations such as environment variables:

```yaml
services:
  backend:
  ...
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
  ...
```

In practice, it would be wiser to use CI/CD pipelines to manage, tag and archive the releases so that they can be replicated at any time.

### Run

Der "Run" Schritt ist das Ausführen des Releases in der Ausführungsumgebung. Mit Docker Dompose geschieht das mit
dem Start des Containers `docker-compose up`. In diesem Beispiel muss aber wie bereits anfangs erwähnt auch die gewünschte Umgebung angegeben werden `docker-compose --env-file .env.dev up -d`.

The "Run" step is the execution of the release in the execution environment. With Docker Compose, this is done by
starting the container `docker-compose up`. In this example, however, as already mentioned at the beginning, the desired environment must also be specified `docker-compose --env-file .env.dev up -d`.

## **VI. Processes**

This principle of the Twelve-Factor method emphasizes the execution of the app as one or more 'stateless' processes.
processes.

1. **Statelesness:** Every service in `compose.yaml` should be designed to be stateless. This means that the state is not stored in the container. Instead, services such as databases, caches or file systems file systems should be used to store possible states. In the executable example, data is obtained exclusively from a database.

2. **Statelesness:** Each process should have its own execution environment and should not access local or session memories that hold states across requests. Instead, services such as databases, caches or file systems should be used for persistent storage.

Here is an example of how to store temporary states outside the container, if necessary at all:

```yaml
# 'depends on' is used to ensure that there is an order as to which service is started first. The frontend service depends on the backend service, so the backend service is started first.

version: '3'

services:
  backend:
    ...
    volumes:
      - "stateless-volume:/path/to/temp"
  frontend:
    build: ./frontend
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - backend
  db:
    image: postgres
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
volumes:
  stateless-volume:
```

This example uses the 'volumes' attribute in the service backend to define where data should be saved. This volume is persistent on the host and is managed by Docker. It is not directly linked to a specific path on the host.

## **VII. Port binding**

The Port Binding principle recommends that applications should independently bind ports for network access, without having to rely on an external web server such as Apache or Nginx. This means that the application runs as an independent server that listens to a port and accepts requests directly.

The following examples are already taken into account in the executable `compose.yaml`. Here the port of the environment variable is bound to the internal container port.

```yaml
ports:
  - "${BACKEND_PORT}:8080"
```

```yaml
ports:
  - "${FRONTEND_PORT}:80"
```

```yaml
ports:
  - "${DB_PORT}:3306"
```

This enables each service to receive its own network address by binding its own port.
This makes each service independent of other services and fulfills the `Port Binding` of Twelve-Factor.
It increases the portability and scalability of the application, as it can be moved more easily to different environments such as development, test and production environments or container orchestration systems such as Kubernetes.

## **VIII. Concurrency**

Concurrency can be improved by running the application as several small processes. In a cloud environment, scaling is achieved by starting multiple such processes. Twelve Factor recommends scaling by starting multiple processes (i.e. horizontally) rather than by increasing the resources of a single process (i.e. vertically). In Docker Compose, scaling can be controlled by starting multiple instances of a service. This is in line with the twelve-factor approach for executing multiple processes:`docker-compose up --scale backend=3`.

With Docker Swarm you could also define it in `compose.yaml`:

```yaml
version: '3'

services:
  backend:
    build:
      context: ./02-backend/spring-boot-ecommerce
      dockerfile: Dockerfile
    ports:
      - "${BACKEND_PORT}:8080"
    networks:
      - ${ENV_NETWORK}
    deploy:
      replicas: 3  
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}  

# ... other services ...

networks:
  backend-network:
    driver: bridge
```

The `deploy` key defines that three instances (replicas) of the service are to be created.
However, this service is only used in conjunction with Docker Swarm and cannot be taken into account by `docker-compose up`. Docker Compose is mainly intended for local development and single-host deployments. For multi-container and multi-host orchestration that requires horizontal scaling with multiple instances, a tool such as Docker Swarm or Kubernetes is required.

## **IX. Disposability**

Disposability from Twelve-Factor is all about starting and stopping services quickly and cleanly. The application should be able to be started quickly so that it integrates smoothly into the cloud environment and enables scalability and fast deployments. It is just as important that the application can be shut down cleanly and handles signals correctly during a shutdown so that no transactions or sessions are abruptly terminated.

Here is an example of how you could implement disposability:

```yaml
version: '3'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    stop_grace_period: 30s
```

The `healthcheck` instruction is used to check the health of the `backend` service.

`stop_grace_period` defines how long Docker will wait after a `SIGTERM` signal is sent and before a `SIGKILL` signal is sent to give the container time for a clean shutdown.

This configuration helps to ensure fast responsiveness and reliability of services and supports a robust and resilient system design.

## **X. Dev/prod parity**

Twelve-Factor's Dev/Prod Parity principle refers to the fact that development, testing and production should be as similar as possible. This reduces problems that can arise due to differences in the environments. Docker and Docker Compose are great for supporting this principle, as they allow you to create very similar environments across different stages of the development process.

The following considerations take dev/prod parity into account:

1. using the same images: it should be ensured that the same Docker images are used in development, testing, and production.

```yaml
# compose.yaml
services:
  app:
    image: my-app:latest
```

oder

```yaml
# compose.yaml

services:
  backend:
    build:
      context: ./02-backend/spring-boot-ecommerce
      dockerfile: Dockerfile
```

2. external configuration: The use of environment variables for configurations ensures that no configuration-dependent values are hardcoded in the image. This makes it possible to use the same image across different environments. The environment variables used have already been shown, so no example follows here.

3. declarative services: Services, networks and volumes should be used declaratively in the compose.yaml file so that the configurations can be shared by all environments.

4. similar databases: The same database engines and versions should be used in the environments to minimize behavioral differences.

By following these practices, you can ensure that applications work consistently across development, testing and production environments.

## **XI. Logs**

Twelve-Factor's Logs principle treats logs as event streams and recommends that applications should write their logs as an uninterrupted stream of events to standard output (stdout).

In Docker and Docker Compose, this means that containers should output their logs to `stdout` and `stderr`. Docker automatically captures everything that is written to these streams, and you can access these logs with the `docker logs` command.

No specific setting needs to be made for this command in `compose.yaml` as it is the default behavior of Docker.

If we want to see the logs for our backend, the following command `docker-compose logs backend` is sufficient. However, you can also access them with `docker logs <container_id`, for example.

You could also forward or aggregate the logs from the productive environment if you wish. To do this, use a logging driver option in Docker that allows logs to be sent to a central logging system such as Elasticsearch, Splunk or another logging system.

This could look like this, for example:

```yaml
services:
  backend:
    build:
      context: ./02-backend/spring-boot-ecommerce
      dockerfile: Dockerfile
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://192.168.0.2:123"
```

Here the `syslog` driver is used to send logs to a `syslog` server instance.

## **XII. Admin processes**

Twelve-Factor's Admin Processes talk about running administrative or management tasks as one-off processes that run in an environment that is as similar as possible to the current production environment.

One-off processes can include things like database migrations, console/shell interactions or one-off scripts for data manipulation.

Administrative tasks or admin processes, as described in the context of Twelve-Factor, are one-time operations that are typically performed after the application has been deployed. Some examples of such tasks are:

1. database migrations: Applying schema changes to a database. Many web frameworks have special commands for this.
2. data import/export: loading data records into a database or exporting for analyses, backups or transfers between different systems.
3. console access: launching an interactive shell within the running application context, often for debugging purposes or live data manipulation.
4. one-time scripts: Running scripts that perform specialized tasks such as data cleanup, data migration between systems, or batch updates.
5. administrative maintenance tasks: Performing system checks, cleanup tasks (for example, deleting temporary files) or application-specific maintenance tasks.

This was my work, I hope it was satisfactory.

Yours sincerely
SB
