# Using the official node image as a basis
FROM node:14 AS build

# Set working directory in container
WORKDIR /app

# Copy and install dependencies
COPY package.json .
RUN npm install

# Copy source code to the working directory
COPY . .

# Build application
RUN npm run build

# Using the official Nginx image as the basis for the production build
FROM nginx:1.19

# Copy the build folder from the build image
# This instruction copies the built Angular files to the directory
# from which Nginx delivers static files so that they are accessible via the web server.
# These directories only exist within the Docker container.
COPY --from=build /app/dist/ /usr/share/nginx/html

# Automatically customize the `default.conf` file of NGINX to refer to Angular App in Container.
COPY ./update-config.sh /usr/local/bin/update-config.sh
RUN chmod +x /usr/local/bin/update-config.sh
RUN /usr/local/bin/update-config.sh

# Release the port on which the application is running
EXPOSE 80
