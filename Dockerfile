FROM alpine

WORKDIR /flighttime
RUN cd /flighttime
RUN apk add bash curl unzip nodejs npm
RUN npm i -g shapefile

COPY parse.sh /flighttime

RUN bash parse.sh
