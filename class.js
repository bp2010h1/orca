/*
 * This file is part of the squeakyJS project.
 *
 * Copyright (C) 2010, Free Software Foundation, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA
 */

Class = function(attributes)
{
	var newClass = function() {};

	if('superClass' in attributes) {
		// copy superclass methods and attributes to new class
		for(attr in attributes['superClass']) {
			newClass.prototype[attr] = attributes['superClass'][attr];
		}
		
		newClass.prototype.$superClass = attributes['superClass'];
		newClass.prototype._super = function(method, args) {
			return this.$superClass[method].apply(this, args);
		};
	}

	if('classVariables' in attributes) {
		// extent by new class variables
		for(idx in attributes['classVariables']) {
			newClass.prototype[attributes['classVariables'][idx]] = null;		
		}
	}

	if('classMethods' in attributes) {
		// extent by new class methods
		for(method in attributes['classMethods']) {
			newClass.prototype[method] = attributes['classMethods'][method];		
		}		
	}
	
	// initialize method is called after instanciation
	newClass.prototype.$objectPrototype = function() { this.initialize(); };
	
	// default constructor
	newClass.prototype.$objectPrototype.prototype.initialize = function() { };

	// "new" is a reserved keyword in Safari -> leading underline
	newClass.prototype._new = function() {
		// create new instance of our class
		return new this.$objectPrototype();
	}
	
	if('superClass' in attributes) {
		// inherit methods and attributes from superclass
		newClass.prototype.$objectPrototype.prototype = attributes['superClass']._new();
		newClass.prototype.$objectPrototype.prototype.$superClass = attributes['superClass'];
		
		// ability to call superclass methods in the context of the current object
		newClass.prototype.$objectPrototype.prototype._super = function(method, args) {
			return this.$superClass.$objectPrototype.prototype[method].apply(this, args);
		};
	}

	if('instanceVariables' in attributes) {
		// set instance variables to null by default
		for(idx in attributes['instanceVariables']) {
			newClass.prototype.$objectPrototype.prototype[attributes['instanceVariables'][idx]] = null;		
		}
	}
		
	if('instanceMethods' in attributes) {
		// extent by new instance methods
		for(method in attributes['instanceMethods']) {
			newClass.prototype.$objectPrototype.prototype[method] = attributes['instanceMethods'][method];		
		}
	}
	
	// "class" is a reserved keyword in Safari -> leading underline
	newClass.prototype.$objectPrototype.prototype._class = new newClass();
	
	return newClass.prototype.$objectPrototype.prototype._class;
};
