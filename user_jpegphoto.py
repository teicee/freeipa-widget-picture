## FreeIPA extension: User jpegphoto (avatar).
##
## Copyright 2021 téïcée SARL <https://www.teicee.com>
## Written by Grégory MARIGOT <gmarigot at teicee.com>
##
## This program is free software: you can redistribute it and/or modify
## it under the terms of the GNU Affero General Public License as
## published by the Free Software Foundation, either version 3 of the
## License, or (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

