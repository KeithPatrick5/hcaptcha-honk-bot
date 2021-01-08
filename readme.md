# hCaptcha Honk Bot

The bot we [forked](https://github.com/KeithPatrick5/telegram-bot) will block users from messaging in chat until they fill out a captcha. Each claim is met with a new restriction requiring users to fill out captcha, thus eliminating bots from claiming tokens.

How it works: Watch this short [video](https://youtu.be/GDSLRQaHfic)

## Production mode
### Run it in production with docker-compose

- Update list of available packages

`apt-get update`

- Install Docker & docker-compose

`apt  install docker.io docker-compose`

- Modify `docker-compose.yml` by adding bot token and other details.
- Run docker-compose

```docker-compose -f docker-compose.yml up -d```

Enjoy 🚀

### Run it in production with docker-compose and SSL

- Update list of available packages

`apt-get update`

- Install Docker & docker-compose

`apt  install docker.io docker-compose`

- Modify `docker-compose-ssl.yml` by adding bot token and other details.
- Replace `domain.com` with your domain and `your-email@domain.com` with an active email (recommended) in certbot service secion of `docker-compose-ssl.yml` 
- run `./init-certificate.sh` and input the domain name. It will update the ssl configurations in nginx.
- Run docker-compose

```docker-compose -f docker-compose-ssl.yml up -d```


# Development mode
## Setting up Development Environment

1. Install NodeJS 12.x

```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PM2

`npm install -g pm2`

3. Clone repo

`git clone git@github.com:pytour/hcaptcha-project.git`

Add environment variables

For nextjs app

`touch ./app/.env.local`

4. Install Docker to run MongoDB RabbitMQ containers

- Install Docker & docker-compose

`apt  install docker.io docker-compose`

- Create `stack.yml` (see stack.yml.example)

- Run docker-compose

```docker-compose -f stack.yml up -d```

To check that it work properly run: 

```docker-compose ps```

5. Create `ecosystem.config.js` file (see ecosystem.config.js.example) 

6. Build and Run project (Telegram Bot and NextJS app): 

`bash deploy_script.sh`


7. Setup Nginx 

`sudo apt install nginx`

Edit our default nginx site file

`sudo vim /etc/nginx/sites-available/default`


```
server {
    listen 80;

    server_name _;

    location / {
        # reverse proxy for next server
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # we need to remove this 404 handling
        # because next's _next folder and own handling
        # try_files $uri $uri/ =404;
    }
}
```

Test the configuration of Nginx:

`sudo nginx -t`

Reload Nginx:

`sudo /etc/init.d/nginx reload`

Thats it 🚀