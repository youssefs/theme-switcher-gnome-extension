#!/bin/bash

metadata='./metadata.json'
if [[ -e $metadata ]]
then
    filename=$(cat metadata.json | grep uuid | cut -f 4 -d '"')
else
    echo Metada file was not found
    exit 1
fi

target_dir=$HOME'/.local/share/gnome-shell/extensions/'$filename
echo Creating $target_dir
mkdir -p $target_dir

icons='./icons/'
schemas='./schemas/'
ext='./extension.js'
prefkeys='./pref_keys.js'
config='./config.js'
conv='./convenience.js'

if [[ -d $icons && -d $schemas && -e $ext && ]]
then
    cp -r $icons $schemas $metadata $ext -t $target_dir
    cp -r $convenience $config $prefkeys -t $target_dir
    echo Copying files to $target_dir
else
    echo Files not found
    exit 1
fi

echo Installation Successful
exit 0