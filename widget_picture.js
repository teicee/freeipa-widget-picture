// FreeIPA extension: Widget picture (file upload & preview).

define(
	[
		'freeipa/ipa',
		'freeipa/phases',
		'freeipa/widget',
		'freeipa/reg',
		'freeipa/text',
		'dojo/on',
		'exports'
	],
function(IPA, phases, widget, reg, text, on, exp) {


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
		if (that.debug) that.input_debug = $('<textarea/>', {rows:15, width:'100%'}).appendTo(that.input_group);
		that.input = $('<input/>', {
			type:       "file",
			'class':    "hidden",
			accept:     that.accept,
			name:       that.name,
			id:         id
		}).appendTo(that.input_group);
		
		that.input.on('change', function() {
			that.display_control.css({ opacity: 0.5 });
			var reader = new FileReader();
			reader.addEventListener("load",      function(){ that.update([ this.result.replace(/^data:.*base64,/,'') ]); }, false);
			reader.addEventListener("loadend",   function(){ that.display_control.css({ opacity: 1.0 }); });
			reader.readAsDataURL( this.files[0] );
		});
		
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
	};

	/**
	 * @inheritDoc
	 */
	that.update_read_only = function() {
		if (!that.input) return;
		that.input_group.css('display', that.is_writable() ? '' : 'none');
	};

	/**
	 * @inheritDoc
	 */
	that.update = function(values) {
		var value = values && values.length ? values[0] : '';
		if (value !== '') {
			that.display_control.prop('src', 'data:image/jpeg;base64,' + value).data('empty',false).show();
			that.input_remove.show();
		} else {
			that.display_control.prop('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=').data('empty',true).hide();
			that.input_remove.hide();
		}
		if (that.input_debug) that.input_debug.val(value);
		that.on_value_changed(values);
	};

	/**
	 * @inheritDoc
	 */
	that.save = function() {
		if (that.display_control.data('empty')) return [];
		return [ that.display_control.prop('src').replace(/^data:.*base64,/, '') ];
	};

	/**
	 * @inheritDoc
	 */
	that.clear = function() {
		that.input.val('');
		if (that.input_debug) that.input_debug.val('');
		that.display_control.prop('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=').data('empty',true).hide();
		that.input_remove.hide();
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
