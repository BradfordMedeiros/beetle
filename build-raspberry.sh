#/usr/bin/env bash

touch ~/build_log.txt
./install.sh
echo "Build completed $(date)" >> ~/build_log.txt
