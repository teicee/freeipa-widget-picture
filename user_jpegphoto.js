/**
 * FreeIPA extension: User jpegphoto (avatar).
 *
 * Copyright 2021 téïcée SARL <https://www.teicee.com>
 * Written by Grégory MARIGOT <gmarigot at teicee.com>
 */
define(
	[
		'freeipa/phases',
		'freeipa/user'
	],
function(phases, user) {

	// helper function
	function get_item(array, attr, value) {
		for (var i=0, l=array.length; i<l; i++) {
			if (array[i][attr] === value) return array[i];
		}
		return null;
	}

	// Adds 'jpegPhoto' field into user details facet
	user.add_jpegphoto_pre_op = function() {
		var facet   = get_item(user.entity_spec.facets, '$type', 'details');
		if (! facet) return;
		var section = get_item(facet.sections,          'name',  'identity');
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

	phases.on('customization', user.add_jpegphoto_pre_op);
	return user;
});
