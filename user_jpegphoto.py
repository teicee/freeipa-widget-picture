## FreeIPA extension: User jpegphoto (avatar).

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

