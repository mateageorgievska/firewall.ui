FROM node:18 AS build_image

ENV NODE_ENV=production
ARG NODE_OPTIONS="--max-old-space-size=8192"
ENV NODE_OPTIONS=$NODE_OPTIONS

#Create app directory
WORKDIR /app

#Install app dependencies
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

#Bundle app source
COPY . .

#If you are building your code for production
RUN npm run build

FROM node:18-alpine

# copy from build image
COPY --from=build_image /app/.env .env
COPY --from=build_image /app/.next/standalone ./
COPY --from=build_image /app/.next/static ./.next/static
COPY --from=build_image /app/public ./public

EXPOSE 3000

CMD [ "node", "server.js" ]


# docker run -d -e NODE_ENV=production -e PORT=3000 -p 3000:3000 bsh:1.0.0

# docker run -d -e NODE_ENV=production -e PORT=3000 -p 3000:3000 firewallapp:1.0.0

# docker image -> docker build -t firewallapp:1.0.0 .


