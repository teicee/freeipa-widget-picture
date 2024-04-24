/**
 * FreeIPA extension: User jpegphoto attribute (avatar).
 *
 * Copyright 2021 téïcée SARL <https://www.teicee.com>
 * Written by Grégory MARIGOT <gmarigot at teicee.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
define([
	'freeipa/phases',
//	'freeipa/user'      /* user not available on all pages (ex: '/ipa/migration/') */
	'freeipa/ipa'
], function(phases, IPA) {
	var user_jpegphoto_plugin = {};

	// helper function
	function get_item(array, attr, value) {
		for (var i=0, l=array.length; i<l; i++) {
			if (array[i][attr] === value) return array[i];
		}
		return null;
	}

	// Adds 'jpegPhoto' field into user details facet
	user_jpegphoto_plugin.add_jpegphoto_pre_op = function() {
		if (IPA.user === undefined) return true;
		
		var facet   = get_item(IPA.user.entity_spec.facets, '$type', 'details');
		if (! facet) return;
		var section = get_item(facet.sections,              'name', 'identity');
		if (! section) return;
		
		section.fields.push({
			name:   'jpegphoto',
			label:  "Avatar",
			$type:  'picture',
			accept: 'image/jpeg,image/png',
			height: 240,
			debug:  false
		});
		return true;
	};

	phases.on('customization', user_jpegphoto_plugin.add_jpegphoto_pre_op);
	return user_jpegphoto_plugin;
});
