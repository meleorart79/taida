FROM php:8.2-apache

# Enable mod_rewrite for .htaccess
RUN a2enmod rewrite

# Point Apache at public/ as the web root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf

# Allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Copy project
COPY . /var/www/html/

# Make runtime dirs writable
RUN mkdir -p /var/www/html/home /var/www/html/logfiles \
    && chown -R www-data:www-data /var/www/html/home /var/www/html/logfiles

EXPOSE 80