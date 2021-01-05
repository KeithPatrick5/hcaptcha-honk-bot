#!/bin/bash
read -p "Please input domain name (without www) : " domain_name
read -p "Please input a valid email : " email
if [ -z "$domain_name" ]
then
      echo "Domain Name is not provided. Script will exit."
      exit 1
fi

if [ -z "$email" ]
then
      email='your-email@mail.com'
fi

echo "Domain: $domain_name , Email: $email"

echo "Updating domain name in config file"

sed -i "s/domain.com/$domain_name/" ./nginx-ssl/conf.d/default.conf
sed -i "s/www.domain.com/www.$domain_name/" ./nginx-ssl/conf.d/default.conf
sed -i "s/domain.com/$domain_name/" ./nginx-ssl/certbot-config/default.conf
sed -i "s/www.domain.com/www.$domain_name/" ./nginx-ssl/certbot-config/default.conf


echo "Updating domain name"
sed -i "s/your-email@domain.com/$email/" ./nginx-ssl/certbot-config/init-ssl.yml
sed -i "s/www.domain.com/www.$domain_name/" ./nginx-ssl/certbot-config/init-ssl.yml
sed -i "s/domain.com/$domain_name/" ./nginx-ssl/certbot-config/init-ssl.yml
echo "Requesting SSL certificate for $domain_name"
cd ./nginx-ssl/certbot-config/
docker-compose up -f init-ssl.yml -d 
sleep 30s
docker-compose ps
sleep 30
docker-compose down
echo "Certificates generated successfully. Now you can run docker-compose"
