# base node image
FROM node:20-bookworm-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && apt-get install -y python3 && apt-get install -y build-essential    

WORKDIR /myapp

ADD package.json ./

ADD . .

RUN npm install 

RUN npm prune 

RUN npx prisma generate

RUN npm run build

ENV NODE_ENV="production"

ENV PORT="8080"

USER root 

EXPOSE 8080

CMD ["npm", "run", "start"]