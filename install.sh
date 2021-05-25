#!/bin/sh
## FreeIPA extension: Widget picture (file upload & preview).
EXTNAME="widget_picture"

INPATH="$(dirname $0)"
JSPATH="/usr/share/ipa/ui/js/plugins/${EXTNAME}"
PYPATH=
RELOAD=

usage() {
	printf "\nUsage: ${0} [--reload]\n\n" >&2
	printf "  -r, --reload  :  Restart FreeIPA services\n\n"
	exit 1
}

error() {
	printf "\nERROR: ${1}!\n\n" >&2; exit 1
}

pyini() {
	for dir in /usr/lib/python* ; do
		[ -d "${dir}/site-packages/ipaserver/plugins" ] && PYPATH="${dir}/site-packages/ipaserver/plugins" && return 0
		[ -d "${dir}/dist-packages/ipaserver/plugins" ] && PYPATH="${dir}/dist-packages/ipaserver/plugins" && return 0
	done
	return 1
}

set -e
[ "x$1" = "x--reload" -o "x$1" = "x-r" ] && RELOAD=todo && shift
[ $# -eq 0 ] || usage

if [ -f "${INPATH}/${EXTNAME}.js" ]; then
	[ -d "/usr/share/ipa/ui/js" ] || error "Unable to detect FreeIPA JS path"
	[ -d "${JSPATH}" ] || mkdir -p "${JSPATH}"
	cp -v "${INPATH}/${EXTNAME}.js" "${JSPATH}/"
fi

if [ -f "${INPATH}/${EXTNAME}.py" ]; then
	pyini || error "Unable to detect FreeIPA python lib path"
	cp -v "${INPATH}/${EXTNAME}.py" "${PYPATH}/"
	[ -z "${RELOAD}" ] || systemctl restart ipa
fi

[ -d ~/.cache/ipa ] && rm -rf ~/.cache/ipa

