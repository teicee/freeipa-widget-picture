## FreeIPA extension: User jpegphoto (avatar).
##
## Copyright 2021 téïcée SARL <https://www.teicee.com>
## Written by Grégory MARIGOT <gmarigot at teicee.com>

from ipaserver.plugins.user import user
from ipalib import Bytes, _

###
### Object User
###

user.takes_params += (
	Bytes('jpegphoto?',
		cli_name='avatar',
		label=_("Avatar"),
		doc=_("Base-64 encoded user picture (jpegphoto)"),
	),
)

