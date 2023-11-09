#!/bin/bash

CONFIG_FILE="/etc/nginx/conf.d/default.conf"



if [ ! -f "$CONFIG_FILE" ]; then
    echo "Die Konfigurationsdatei $CONFIG_FILE wurde nicht gefunden."
    exit 1
fi

# Changing the root path
sed -i 's|root   /usr/share/nginx/html;|root   /usr/share/nginx/html/angular-ecommerce;|' "$CONFIG_FILE"
echo "Das Skript wird ausgeführt..."

# Adding the try_files directive
sed -i '/location \/ {/a \        try_files $uri $uri/ /index.html;' "$CONFIG_FILE"
