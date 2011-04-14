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

function setup {
   echo "Setting up image.."
   setup_file="__squeak_setup.st"
   cat <<EOF> $setup_file
   Utilities setAuthorInitials: 'setup'.
   World color: Preferences defaultWorldColor.
   Preferences swapMouseButtons.
   SystemWindow subclasses collect: [:k | k allInstances] thenDo: [:iary | iary do: [:each | each delete]].
   
	Installer squeaksource
    	project: 'MetacelloRepository';
    	install: 'ConfigurationOfMetacello'. 
	
	(Smalltalk at: #ConfigurationOfMetacello) perform: #load.

	((Installer monticello) 
		http: 'http://www.hpi.uni-potsdam.de/hirschfeld/squeaksource/bp2010h1'
		user: '${USERNAME}'
		password: '${PASSWORD}')	
		installQuietly: 'ConfigurationOfOrca'.
			
	(ConfigurationOfOrca project lastVersion) load.

	SmalltalkImage current snapshot: true andQuit: true.
EOF
   run $1 $setup_file
}

function usage {
	E_OPTERROR=65
	echo "Usage: `basename $0` -u <USERNAME> -p <PASSWORD> -v <BUILD_VM_PATH>"
	exit $E_OPTERROR	
}

if [ $# -le 5 ] # print usage if there are not enough arguments
then
	usage
fi

while getopts ":u:p:v:" OPTION
do
	case $OPTION in
		u) USERNAME="$OPTARG" ;;
		p) PASSWORD="$OPTARG" ;;
		v) VM_PATH="$OPTARG" ;;
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

for i in ../*.image; do mv $i "Squeak.image"; done
for i in ../*.changes; do mv $i "Squeak.changes"; done
mv ../SqueakV41.sources ./

git clone git@github.com:bp2010h1/orca.git
cat <<EOF> INSTALL
Put the orca/ directory into your resources directory.
EOF

cd ..

tar cfz "../orca_${DATE_STRING}.tar.gz" "orca_${DATE_STRING}"

cd ..
rm -rf temp