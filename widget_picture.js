/**
 * FreeIPA extension: Widget picture (file upload & preview).
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
	'freeipa/ipa',
	'freeipa/phases',
	'freeipa/widget',
	'freeipa/reg',
	'freeipa/text',
	'dojo/on',
	'exports'
], function(IPA, phases, widget, reg, text, on, exp) {


/**
 * Widget to manage picture field (<img /> + <input file />).
 * @class
 * @extends IPA.input_widget
 */
IPA.picture_widget = function (spec) {
	spec = spec || {}
	var that = IPA.input_widget(spec);
	that.accept = spec.accept || "image/*";
	that.height = spec.height || 160;
	that.debug  = spec.debug  || false;

	/**
	 * @inheritDoc
	 */
	that.create = function(container) {
		that.widget_create(container);
		var id = IPA.html_util.get_next_id(that.name);
		
		// UI used if user doesn't have write rights:
		that.display_control = $('<img/>', {
			name:       that.name,
//			height:     that.height,
			style:      "max-height:"+that.height+"px",
			'class':    "form-control-static img-thumbnail",
			alt:        "[ unable to display the picture ]"
		}).appendTo(container);
		
		// editable UI:
		that.input_group = $('<div/>').appendTo(container);
		if (that.debug) that.input_debug = $('<textarea/>', {
			rows:       15,
			width:      '100%'
		}).appendTo(that.input_group);
		
		that.input = $('<input/>', {
			type:       "file",
			'class':    "hidden",
			accept:     that.accept,
			name:       that.name,
			id:         id
		}).appendTo(that.input_group);
		
		that.input_group_btn = $('<div/>', {
			'class': 'input-group-btn'
		}).appendTo(that.input_group);
		
		that.input_button = $('<label/>', {
			'class':    "btn btn-default",
			'style':    "padding-top: 2px;",
			'title':    "Load a picture file",
			'text':     text.get('@i18n:buttons.set'),
			'for':      id
		}).appendTo(that.input_group_btn);
		
		that.input_remove = $('<button/>', {
			'class':    "btn btn-default",
			'title':    "Remove current picture",
			'text':     text.get('@i18n:buttons.remove'),
		}).appendTo(that.input_group_btn);
		that.input_remove.on('click', function(){ that.clear(); });
		
		if (that.undo) {
			that.create_undo(that.input_group_btn);
		}
		
		that.create_error_link(container);
		that.set_enabled(that.enabled);
		that.update_read_only();
		
		that.flag_displayed = false;
		that.input.on('change', function() {
			if (! this.files.length) return;
			that.display_control[0].src = URL.createObjectURL( this.files[0] );
			that.display_control.css({ opacity: 0.5 }).show();
			that.flag_displayed = true;
			var reader = new FileReader();
			reader.addEventListener("load", function() {
				that.update([ this.result.replace(/^data:.*base64,/,'') ]);
			}, false);
			reader.readAsDataURL( this.files[0] );
		});
		that.display_control.on('load', function() {
			URL.revokeObjectURL(this.src);
		});
	};

	/**
	 * @inheritDoc
	 */
	that.update_read_only = function() {
		if (!that.input) return;
		that.input_group.css('display', that.is_writable() ? '' : 'none');
	};

	/**
	 * Convert base64-encoded binary string into a Blob object.
	 */
	that.blob_from_base64 = function(b64data) {
		var byteArrays = [];
		var byteCharacters = atob(b64data);
		for (var offset = 0; offset < byteCharacters.length; offset += 512) {
			var slice = byteCharacters.slice(offset, offset + 512);
			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
			byteArrays.push(new Uint8Array(byteNumbers));
		}
		return new Blob(byteArrays);
	}

	/**
	 * @inheritDoc
	 */
	that.update = function(values) {
		if (!values || !values.length) return that.clear();
		that.display_control.css({ opacity: 0.5 });
		if (that.input_debug) that.input_debug.val(values[0]);
		if (!that.flag_displayed) that.display_control[0].src = URL.createObjectURL( that.blob_from_base64(values[0]) );
		that.flag_displayed = false;
		that.display_control.data('empty',false).css({ opacity: 1.0 }).show();
		that.input_remove.show();
		that.on_value_changed(values); // ([ values[0] ]);
	};

	/**
	 * @inheritDoc
	 */
	that.save = function() {
		return that.value;
	};

	/**
	 * @inheritDoc
	 */
	that.clear = function() {
		that.display_control[0].src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // 1px GIF
		that.display_control.data('empty',true).hide();
		that.input_remove.hide();
		if (that.input_debug) that.input_debug.val('');
		that.input.val('');
		that.on_value_changed([]);
	};

	return that;
};


/**
 * Register widgets and formatters to registries
 * @member widget
 */
exp.register = function() {
	var w = reg.widget;
	w.register('picture', IPA.picture_widget);
};

phases.on('registration', exp.register);

return exp;
});
