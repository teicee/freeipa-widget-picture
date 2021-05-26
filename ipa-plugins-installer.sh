#!/bin/sh
### FreeIPA extensions: Automatic plugins installer.

### Variables
DIR_SRC_PLUGINS="$(dirname $0)"
DIR_IPA_JS="/usr/share/ipa/ui/js"
DIR_IPA_PY="$(ls -1 -d /usr/lib/python*/*-packages/ipaserver/plugins |head -n1)"
ALL_PLUGIN="$(ls -1 "${DIR_SRC_PLUGINS}/"*.js "${DIR_SRC_PLUGINS}/"*.py |sed 's|^.*/||' |sed 's/\.\(js\|py\)$//' |sort |uniq |tr '\n' ' ')"
LST_PLUGIN=
OPT_RELOAD=

### Functions
usage() {
	printf "\nUsage: ${0} <plugin...> [--reload]\n" >&2
	printf "  -a, --all     :  Install all available plugins\n"
	printf "  -r, --reload  :  Restart FreeIPA services\n"
	printf "  -h, --help    :  Display this help message\n"
	printf "\nAvailable plugins: %s\n\n" "${ALL_PLUGIN}"
	exit 1
}
error() {
	printf "\nERROR: ${1}!\n\n" >&2; exit 1
}

### Arguments
while [ $# -gt 0 ]; do
	case "${1}" in
		-h | --help    ) usage ;;
		-a | --all     ) LST_PLUGIN="${ALL_PLUGIN}" ;;
		-r | --reload  ) OPT_RELOAD=todo ;;
		-* ) error "Unknown option '${1}'" ;;
		*  ) LST_PLUGIN="${LST_PLUGIN}${1} " ;;
	esac
	shift
done

### Verifications
[ -n "${DIR_IPA_JS}" -a -d "${DIR_IPA_JS}" ] || error "Unable to detect FreeIPA JS plugins folder"
[ -n "${DIR_IPA_PY}" -a -d "${DIR_IPA_PY}" ] || error "Unable to detect FreeIPA PY plugins folder"
[ -z "${LST_PLUGIN}" ] && error "Plugins list to install is empty"

### Installations
for PLUGIN in ${LST_PLUGIN}; do
	printf "\n=== Installing IPA plugin '${PLUGIN}'...\n"
	PLUGIN_JS="${DIR_SRC_PLUGINS}/${PLUGIN}.js"
	PLUGIN_PY="${DIR_SRC_PLUGINS}/${PLUGIN}.py"
	
	if [ -f "${PLUGIN_JS}" ]; then
		printf "  - installing javascript script\n"
		DIR_PLUGIN="${DIR_IPA_JS}/plugins/${PLUGIN}"
		[ -d "${DIR_PLUGIN}" ] || mkdir -p "${DIR_PLUGIN}"
		cp -v "${PLUGIN_JS}" "${DIR_PLUGIN}/"
	fi
	
	if [ -f "${PLUGIN_PY}" ]; then
		printf "  - installing python script\n"
		cp -v "${PLUGIN_PY}" "${DIR_IPA_PY}/"
	fi
done

### Reloading
if [ -n "${OPT_RELOAD}" ]; then
	printf "\n=== Restarting IPA services...\n"
	systemctl restart ipa
fi
[ -d ~/.cache/ipa ] && rm -rf ~/.cache/ipa

printf "\n=== Done.\n\n"
