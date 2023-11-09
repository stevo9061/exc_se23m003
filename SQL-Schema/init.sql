-- Gewähre Benutzer Zugriff auf die Datenbank
GRANT ALL PRIVILEGES ON `full-stack-ecommerce`.* TO 'ecommerceapp'@'%';

-- Aktualisiere die Berechtigungen
FLUSH PRIVILEGES;
