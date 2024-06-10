FROM alpine

WORKDIR /flighttime
RUN cd /flighttime
RUN apk add bash curl unzip nodejs npm
RUN npm i -g shapefile

COPY ./ /flighttime

CMD [ "bash", "parse.sh" ]
