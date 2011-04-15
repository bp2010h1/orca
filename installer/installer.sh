#!/bin/bash

function run {
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
      eval "${VM_PATH}" "$args"
   else
      eval "${VM_PATH}" "$(pwd)/$(ls Squeak*image | head -1)" "$args"
   fi

}

function download {
   if [[ -z $(ls | grep "Squeak[^\.]*\.sources") ]]; then
      echo "Downloading current trunk image"
      TRUNK="ftp://ftp.squeak.org/trunk/"
      SOURCES="ftp://ftp.squeak.org/sources_files/"
      SQUEAK_IMAGE_FILES=$(curl ${TRUNK} | grep "Squeak.*zip" | tail -1 | awk '{print $NF}')
      SQUEAK_SOURCES_FILE=$(curl ${SOURCES} | grep "sources.gz" | tail -1 | awk '{print $NF}')
      curl -O "${SOURCES}${SQUEAK_SOURCES_FILE}"
      curl -O "${TRUNK}${SQUEAK_IMAGE_FILES}"
      unzip Squeak*zip
      gunzip Squeak*sources.gz
   fi
}

function setup {
   echo "Setting up image.."
   setup_file="__squeak_setup.st"
   cat <<EOF> $setup_file
   Utilities setAuthorInitials: 'OrcaSetup'.
   
	Installer squeaksource
    	project: 'MetacelloRepository';
    	install: 'ConfigurationOfMetacello'. 
	
	(Smalltalk at: #ConfigurationOfMetacello) load.

	((Installer monticello) 
		http: 'http://www.hpi.uni-potsdam.de/hirschfeld/squeaksource/bp2010h1'
		user: '${USERNAME}'
		password: '${PASSWORD}')	
		installQuietly: '${CONFIG}'.
			
	(Smalltalk at: #${CONFIG}) load.

	MCMcmUpdater updateFromDefaultRepository.
	
	SystemWindow subclasses collect: [:k | k allInstances] thenDo: [:iary | iary do: [:each | each delete]].
	
	SmalltalkImage current snapshot: true andQuit: true.
EOF
   run $1 $setup_file
}

function usage {
	E_OPTERROR=65
	echo "Usage: `basename $0` -u <USERNAME> -p <PASSWORD> -v <BUILD_VM_PATH> -c <METACELLO_CONFIGURATION>"
	exit $E_OPTERROR	
}

if [ $# -le 5 ] # print usage if there are not enough arguments
then
	usage
fi

while getopts ":u:p:v:c:" OPTION
do
	case $OPTION in
		u) USERNAME="$OPTARG" ;;
		p) PASSWORD="$OPTARG" ;;
		v) VM_PATH="$OPTARG" ;;
		c) CONFIG="$OPTARG" ;;
		*) usage ;;
	esac
done

mkdir temp
cd temp
download
setup

DATE_STRING=`date +%Y%m%d`

mkdir "orca_${DATE_STRING}"
cd "orca_${DATE_STRING}"


eval "mv $(ls ../*.image | head -1)" "Squeak.image"
eval "mv $(ls ../*.changes | head -1)" "Squeak.changes"
mv ../SqueakV41.sources ./

git clone git@github.com:bp2010h1/orca.git
cat <<EOF> INSTALL
Move this content into your Resources directory.
EOF

cd ..

tar cfz "../orca_${DATE_STRING}.tar.gz" "orca_${DATE_STRING}"

cd ..
rm -rf temp
