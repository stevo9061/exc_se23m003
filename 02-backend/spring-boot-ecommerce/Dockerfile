# Use the official Maven image as a basis
FROM maven:3.8.5-openjdk-17-slim AS build

# Set working directory in container
WORKDIR /app

# Copy and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code to the working directory
COPY src src

# Build application
RUN mvn package

# New image for the application
FROM openjdk:17-alpine

# Set working directory in container
WORKDIR /app

# Copy JAR file from the build image
COPY --from=build /app/target/*.jar app.jar

# Release the port on which the application is running
EXPOSE 8080

# Command to execute the application
CMD ["java", "-jar", "app.jar"]