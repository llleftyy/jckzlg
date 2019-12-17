#!/bin/bash

sleep 1
while true; do
  clear
  ps aux | grep "serve public" | grep -v grep || exit
  make build
  sleep 2
done
