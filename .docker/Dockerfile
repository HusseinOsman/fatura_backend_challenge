FROM node:14.16.1-alpine
# Update alpine packages
# RUN apk update 

RUN  mkdir /api

COPY . /api

# Enter api dir
WORKDIR /api

# Create empty .env file
RUN npm install

CMD npm run prod

#CMD pm2-runtime start ecosystem.config.js
