#!/usr/bin/env bash


WD=$(CWD="`dirname \"$0\"`"; cd $CWD/..; pwd)

export DIR_UPLOAD_TMP=$WD/fs/tmp
export DIR_PROCESS_TMP=$WD/fs/tmp
export DIR_STORAGE=$WD/fs/storage

NODE_PATH=`which node`
NODE_ARGS=""

APP_PATH=$WD/index.js

if [ -z "$DEBUG" ]
then
    NODE_ENV="production"
else
    NODE_ENV="development"
    NODE_ARGS="--debug"
fi

echo $NODE_ARGS
NODE_ENV=$NODE_ENV $NODE_PATH $NODE_ARGS $APP_PATH
