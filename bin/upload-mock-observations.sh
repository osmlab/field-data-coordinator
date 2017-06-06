#!/bin/bash
for file in observations/*
do
  curl -X PUT -T $file http://localhost:3210/observations/create \
    --header "Content-Type: application/json"
done;
