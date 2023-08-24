#!/bin/bash

# Log Location on Server.
#LOG_LOCATION=/home/user/scripts/logs
# LOG_LOCATION=.
# exec > >(tee -i ${LOG_LOCATION}/logfile_$(date +%d%m%Y_%H%M).log)
# exec 2>&1

# echo "Log Location should be: [ $LOG_LOCATION ]"

# Create git patch
# git diff > Default.patch


audiosprite --output sounds -f howler --export mp3,wav *.wav --gap 0.1
ffmpeg -i sounds.wav -dash 1 sounds.webm

exit 0
