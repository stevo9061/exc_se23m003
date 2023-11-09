FROM mysql:8.0.33

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=full-stack-ecommerce
ENV MYSQL_USER=ecommerceapp
ENV MYSQL_PASSWORD=ecommerceapp

COPY ./Dump20231101.sql /docker-entrypoint-initdb.d/Dump20231101.sql
# Login database and fill it with data
COPY ./import.sh /docker-entrypoint-initdb.d/import.sh

# Initialize database
# Set Permissions for user 'ecommerceapp'
COPY ./init.sql /docker-entrypoint-initdb.d/

# Grant permissions
#RUN echo "GRANT ALL PRIVILEGES ON full-stack-ecommerce.* TO 'ecommerceapp'@'%' IDENTIFIED BY 'ecommerceapp';" >> /docker-entrypoint-initdb.d/init.sql


EXPOSE 3306