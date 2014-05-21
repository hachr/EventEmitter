var asEventEmitter = (function () {
	"use strict";

	var slice = Array.prototype.slice;

	/**
	 * add a listener/subscriber
	 * @param {string} event
	 * @param {Function} callback
	 * @param {Object=} context
	 * @returns {*}
	 */
	function addListener(event, callback, context) {
		"use strict";
		if (!event) {
			throw new Error("missing parameter: event");
		}
		if (!callback) {
			throw new Error("missing parameter: callback");
		}

		this._listeners = this._listeners || {};
		if (!this._listeners) this._listeners = {};
		if (!this._listeners[event]) this._listeners[event] = [];
		this._listeners[event].push({callback: callback, context: context});

		this.emit("_addListener", event);

		return this;
	}

	/**
	 * remove a listener/subscriber
	 * @param {string} event
	 * @param {Function} callback
	 * @param {Object=}context
	 * @returns {*}
	 */
	function removeListener(event, callback, context) {
		"use strict";
		if (this._listeners && this._listeners[event]) {
			this._listeners[event] = this._listeners[event].filter(function (l) {
				return (callback && callback !== l.callback) && (context && context !== l.context);
			});
		}

		this.emit("_removeListener", event);

		return this;
	}

	/**
	 * check the existence of a listener, including internal events with _
	 * @param {string}event
	 * @returns {boolean}
	 */
	function hasListener(event) {
		"use strict";
		if (event) {
			return (this._listeners && this._listeners[event] && this._listeners[event].length > 0);
		} else {
			for (event in this._listeners) {
				if (event[0] !== "_" && this._listeners.hasOwnProperty(event) && this._listeners[event].length > 0) {
					return true;
				}
			}
			return false;
		}
	}

	/**
	 * notify the listener/subscriber
	 * @param {string} event
	 * @returns {*}
	 */
	function emit(event) {
		"use strict";
		var listeners = this._listeners && this._listeners[event];
		var args = slice.call(arguments, 1);

		if (listeners) {
			listeners.forEach(function (l) {
				l.callback.apply(l.context || null, args);
			});
		}
		return this;
	}

	/**
	 * subscribed to this event but immediately remove after the first broadcast/emit
	 * @param {string} event
	 * @param {Function} callback
	 * @param {Object=} context
	 * @returns {*}
	 */
	function once(event, callback, context) {
		"use strict";
		var fired = false;
		var self = this;

		function g() {
			"use strict";
			self.removeListener(event, g, context);
			if (!fired) {
				fired = true;
				callback.apply(context || null, arguments);
			}
		}

		this.addListener(event, g, context);
		return this;
	}

	return function () {
		this.addListener = this.on = addListener;
		this.removeListener = this.off = removeListener;
		this.hasListener = hasListener;
		this.emit = emit;
		this.once = once;
		return this;
	}
})();

/**
 *
 * @constructor
 */
function EventEmitter(){
	asEventEmitter.call(EventEmitter.prototype);
}

/**
 * Usage: EventEmitter.mixin(Class)
 * helper class to mixin the event emitter functionality to another class.
 * @param clazz
 */
EventEmitter.mixin = function(clazz){
	"use strict";
	if(!clazz){
		throw new Error("cannot mix invalid class");
	}
	asEventEmitter.call(clazz.prototype);
};
