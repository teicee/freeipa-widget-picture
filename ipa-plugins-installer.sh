#!/bin/sh
### FreeIPA extensions: Automatic plugins installer (with ldif).
###
### Copyright 2021 téïcée SARL <https://www.teicee.com>
### Written by Grégory MARIGOT <gmarigot at teicee.com>
###
### This program is free software: you can redistribute it and/or modify
### it under the terms of the GNU Affero General Public License as
### published by the Free Software Foundation, either version 3 of the
### License, or (at your option) any later version.
###
### This program is distributed in the hope that it will be useful,
### but WITHOUT ANY WARRANTY; without even the implied warranty of
### MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
### GNU Affero General Public License for more details.
###
### You should have received a copy of the GNU Affero General Public License
### along with this program.  If not, see <https://www.gnu.org/licenses/>.

cd "$(dirname "${0}")"

### Variables
DIR_SRC_PLUGINS="${PWD}"
DIR_IPA_LD="/usr/share/ipa/schema.d"
DIR_IPA_JS="/usr/share/ipa/ui/js"
DIR_IPA_PY="$(ls -1 -d /usr/lib/python*/*-packages/ipaserver/plugins 2>/dev/null |head -n1)"
ALL_PLUGIN="$(ls -1 "${DIR_SRC_PLUGINS}/"*.js "${DIR_SRC_PLUGINS}/"*.py 2>/dev/null |sed 's|^.*/||' |sed 's/\.\(js\|py\)$//' |sort |uniq |tr '\n' ' ')"

### ANSI Colors
COL_NORM='' COL_HEAD='' COL_INFO='' COL_WARN='' COL_CRIT='' COL_DONE=''
if [ "x${TERM}" != "xdumb" ]; then
	COL_NORM='\033[0;00m'   # default
	COL_HEAD='\033[1;36m'   # cyan
	COL_INFO='\033[1;34m'   # blue
	COL_WARN='\033[1;33m'   # yellow
	COL_CRIT='\033[1;31m'   # red
	COL_DONE='\033[1;32m'   # green
fi

### Functions
usage() {
	printf "\nUsage: %s <plugin...|--all> [--reload|--no-reload]\n" "${0}" >&2
	printf "  -a, --all         :  Install all available plugins\n"
	printf "  -r, --reload      :  Force the FreeIPA services reload\n"
	printf "  -R, --no-reload   :  Disable the FreeIPA services reload\n"
	printf "  -h, --help        :  Display this help message\n"
	printf "\nAvailable plugins: %s\n\n" "${ALL_PLUGIN}"
	exit 1
}
p_title() {
	printf "\n${COL_HEAD}###\n### %s\n###${COL_NORM}\n" "${1}"
}
p_tellme() {
	printf "\n${COL_INFO}=== %s${COL_NORM}\n" "${1}"
}
p_warnme() {
	printf "\n${COL_WARN}  * %s !${COL_NORM}\n" "${1}" >&2
}
p_error() {
	printf "\n${COL_CRIT}*** ERROR: %s!${COL_NORM}\n\n" "${1}" >&2; exit 1
}
p_success() {
	printf "\n${COL_DONE}  > %s.${COL_NORM}\n" "${1:-Success}"
}

### Arguments
LST_PLUGIN=
OPT_RELOAD='auto'
[ $# -eq 0 ] && usage
while [ $# -gt 0 ]; do
	case "${1}" in
		-h | --help      ) usage ;;
		-a | --all       ) LST_PLUGIN="${ALL_PLUGIN}" ;;
		-r | --reload    ) OPT_RELOAD='todo' ;;
		-R | --no-reload ) OPT_RELOAD=''     ;;
		-* ) p_error "Unknown option '${1}'" ;;
		*  ) LST_PLUGIN="${LST_PLUGIN}${1} " ;;
	esac
	shift
done

### Verifications
[ -n "${DIR_IPA_LD}" -a -d "${DIR_IPA_LD}" ] || p_error "Unable to detect FreeIPA LD plugins folder"
[ -n "${DIR_IPA_PY}" -a -d "${DIR_IPA_PY}" ] || p_error "Unable to detect FreeIPA PY plugins folder"
[ -n "${DIR_IPA_JS}" -a -d "${DIR_IPA_JS}" ] || p_error "Unable to detect FreeIPA JS plugins folder"
[ -z "${LST_PLUGIN}" ] && p_error "Plugins list to install is empty"

### Installations
NEW_LD='' NEW_PY='' NEW_JS=''
for PLUGIN in ${LST_PLUGIN}; do
	p_title "Installing IPA plugin '${PLUGIN}'..."
	
	PLUGIN_LD="${DIR_SRC_PLUGINS}/${PLUGIN}.ldif"
	if [ -f "${PLUGIN_LD}" ]; then
		p_tellme "Installing schema modifications:"
		diff -q -N "${PLUGIN_LD}" "${DIR_IPA_LD}/75-${PLUGIN}.ldif" || NEW_LD=X
		cp -v "${PLUGIN_LD}" "${DIR_IPA_LD}/75-${PLUGIN}.ldif"
	fi
	
	PLUGIN_PY="${DIR_SRC_PLUGINS}/${PLUGIN}.py"
	if [ -f "${PLUGIN_PY}" ]; then
		p_tellme "Installing python script:"
		diff -q -N "${PLUGIN_PY}" "${DIR_IPA_PY}/${PLUGIN}.py" || NEW_PY=X
		cp -v "${PLUGIN_PY}" "${DIR_IPA_PY}/"
		cd "${DIR_IPA_PY}/"
		p_tellme "Compiling python script:"
		python    -m compileall "${PLUGIN}"* && \
		python -O -m compileall "${PLUGIN}"*
	fi
	
	PLUGIN_JS="${DIR_SRC_PLUGINS}/${PLUGIN}.js"
	if [ -f "${PLUGIN_JS}" ]; then
		p_tellme "Installing javascript script:"
		DIR_PLUGIN="${DIR_IPA_JS}/plugins/${PLUGIN}"
		[ -d "${DIR_PLUGIN}" ] || mkdir -p "${DIR_PLUGIN}"
		diff -q -N "${PLUGIN_JS}" "${DIR_PLUGIN}/${PLUGIN}.js" || NEW_JS=X
		cp -v "${PLUGIN_JS}" "${DIR_PLUGIN}/"
	fi
done

### Reloading
p_title "Reloading IPA services..."
if [ -z "${OPT_RELOAD}" ]; then
	if   [ -n "${NEW_LD}" ]; then p_warnme "[reload disabled] You should run the command 'ipa-server-upgrade'"
	elif [ -n "${NEW_PY}" ]; then p_warnme "[reload disabled] You should run the command 'apachectl graceful'"
	fi
elif [ "${OPT_RELOAD}" = 'auto' ]; then
	if   [ -n "${NEW_LD}" ]; then p_tellme "Upgrade IPA server (reload schema and much more !)..."; ipa-server-upgrade
	elif [ -n "${NEW_PY}" ]; then p_tellme "Reload Apache wsgi child processes for python scripts..."; apachectl graceful
	fi
else ipa-server-upgrade ## force reload
fi
[ -d "${HOME}/.cache/ipa" ] && rm -rf "${HOME}/.cache/ipa"

p_tellme "IPA services status..."
ipactl status || p_error "Some FreeIPA services are not running"
p_success
