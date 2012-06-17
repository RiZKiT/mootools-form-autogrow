/*
---

name: Form.AutoGrow

description: Automatically resizes textareas based on their content.

authors: Christoph Pojer (@cpojer)

credits: Based on a script by Gary Glass (www.bookballoon.com)

license: MIT-style license.

requires: [Core/Class.Extras, Core/Element, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, Class-Extras/Class.Binds, Class-Extras/Class.Singleton]

provides: Form.AutoGrow

...
*/

var Core = require('Core');
var Class = Core.Class;
var Options = Core.Options;
var Events = Core.Events;
var Browser = Core.Browser;
var Element = Core.Element;

var wrapper = new Element('div').setStyles({
	overflowX: 'hidden',
	position: 'absolute',
	wordBreak: 'break-all',
	top: 0,
	left: -9999
});

var escapeHTML = function(string){
	return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

var AutoGrow = module.exports = new Class({

	Implements: [Options, Class.Singleton, Class.Binds],

	options: {
		minHeightFactor: 2,
		margin: 0
	},

	initialize: function(element, options){
		this.setOptions(options);
		element = this.element = document.id(element);

		return this.check(element) || this.setup();
	},

	setup: function(){
		this.attach().focus().resize();
	},

	toElement: function(){
		return this.element;
	},

	attach: function(){
		this.element.addEvents({
			focus: this.bound('focus'),
			keydown: this.bound('keydown')
		});

		if (!['android', 'ios'].contains(Browser.Platform.name))
			this.element.addEvent('scroll', this.bound('scroll'));

		return this;
	},

	detach: function(){
		this.element.removeEvents({
			focus: this.bound('focus'),
			keydown: this.bound('keydown'),
			scroll: this.bound('scroll')
		});

		return this;
	},

	focus: function(){
		wrapper.setStyles(this.element.getStyles('fontSize', 'fontFamily', 'width', 'lineHeight')).inject(document.body);

		this.minHeight = (wrapper.set('html', 'A').getHeight() + this.options.margin) * this.options.minHeightFactor;

		return this;
	},

	keydown: function(){
		this.resize.delay(15, this);
	},

	resize: function(){
		var element = this.element,
			html = escapeHTML(element.get('value')).replace(/\n|\r\n/g, '<br/>A');

		if (wrapper.get('html') == html) return this;

		wrapper.set('html', html);
		var height = wrapper.getHeight() + this.options.margin;
		if (element.getHeight() != height){
			element.setStyle('height', Math.max(this.minHeight, height));

			AutoGrow.fireEvent('resize', [this]);
		}

		return this;
	},

	scroll: function(){
		this.element.scrollTo(0, 0);
	}

});

AutoGrow.extend(new Events);
