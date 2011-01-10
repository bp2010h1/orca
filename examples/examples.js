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

Person = Class({
	instanceVariables: [name],
	instanceMethods: {
		setName: function(aName) {
			this.name = aName;
		},
		getName: function() {
			return this.name;
		},
		makeNoise: function() {
			return this.getName() + " says: ";
		}
	}
});

Pirate = Class({
	// inherits from Person
	superClass: Person,
	instanceMethods: {
		makeNoise: function() {
			// access makeNoise method from superclass (doesn't need parameters)
			return this._super.makeNoise() + this._class.noise();
		}
	},
	classMethods: {
		evaluateBlock: function(aBlock) {
			aBlock.value("yiii").value("haaaa");	
		},
		noise: function() {
/*			aBlock = block(function(a) {				
				return block(function(b) { 
					nonLocalReturn(a+b); 
				});
			});*/
			
//			this.evaluateBlock(aBlock);	
				
			return 'Arrrrrr!!!';
		}
	}
});

jack = Pirate._new();
jack.setName("Captain Jack Sparrow");

alert(jack.makeNoise());
