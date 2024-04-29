#! /usr/bin/bash

export NODE_ENV=test

npx sequelize-cli db:seed:all

