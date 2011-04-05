#!/bin/bash

function run {
   vm_path="/Users/robert/Desktop/Projekte/bp2010h1/Squeak.app/Contents/MacOS/Croquet"
   image_arg="$1"
   args=$@

   BIN=`/usr/bin/dirname "$0"`/lib/squeak/$version
   if [[ -e "$image_arg" ]]; then
      if [[ -n $(echo "$image_arg" | grep "\.image$") ]]; then
         IMAGE="$image_arg" # If the file exists and ends with image, use it
      fi
   fi
   if [[ -e "${image_arg}.image" ]]; then
      IMAGE="${image_arg}.image" # If an image file with that prefix exists, use it
   fi

   if [[ -n $IMAGE ]]; then
      exec "${vm_path}" "$args"
   else
      exec "${vm_path}" "$(pwd)/$(ls Squeak*image | head -1)" "$args"
   fi
}

function download {
   if [[ -z $(ls | grep "Squeak[^\.]*\.sources") ]]; then
      echo "Downloading current trunk image"
      TRUNK="ftp://ftp.squeak.org/trunk/"
      SOURCES="ftp://ftp.squeak.org/sources_files/"
      SQUEAK_IMAGE_FILES=$(curl ${TRUNK} | grep "Squeak.*zip" | tail -1 | awk '{print $NF}')
      SQUEAK_SOURCES_FILE=$(curl ${SOURCES} | grep "sources.gz" | tail -1 | awk '{print $NF}')
      wget "${SOURCES}${SQUEAK_SOURCES_FILE}"
      wget "${TRUNK}${SQUEAK_IMAGE_FILES}"
      unzip Squeak*zip
      gunzip Squeak*sources.gz
      rm Squeak*zip
      if [[ -z $(ls | grep Squeak.*image) ]]; then
         possible_squeak_dir="$(ls | grep -m1 Squeak)"
         if [[ -d $possible_squeak_dir ]]; then
            mv "$possible_squeak_dir"/* .
            rmdir "$possible_squeak_dir"
         fi
      fi
   fi
}

function update {
   echo "Updating to Trunk..."
   update_file="__squeak_update.st"
   cat <<EOF> $update_file
   MCMcmUpdater updateFromDefaultRepository.
   World color: Preferences defaultWorldColor.
   Preferences swapMouseButtons.
   SystemWindow subclasses collect: [:k | k allInstances] thenDo: [:iary | iary do: [:each | each delete]].
   
	((Installer monticello) 
		http: 'http://www.hpi.uni-potsdam.de/hirschfeld/squeaksource/bp2010h1'
		user: 'lw'
		password: 'qW[e!sMb/Ö')	
		installQuietly: 'Squeak2JS'.
	
	(Smalltalk at: #S2JSilentInstaller) install.

   SmalltalkImage current snapshot: true andQuit: true.
EOF
   run $1 $update_file
   rm $update_file
}

if [ "$1" == "download" ]; then
   download
   update
else if [ "$2" == "download" ]; then
   download
   update $@
else
   run $@
fi fi

