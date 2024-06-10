#!/bin/bash

docker build --no-cache -t flighttime-data .
docker run --rm -it -v $PWD:/flighttime flighttime-data sh

#node 