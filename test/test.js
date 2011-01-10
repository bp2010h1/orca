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

// setup

A = Class({
	instanceVariables: ['foo'],
	instanceMethods: {
		initialize: function() {
			
		},
		testMethod: function() {
		},
		setTest: function(num) {
			this.test = num;
		}
	},
	classVariables: ['age'],
	classMethods: {
		myAge: function() {
			return this.age;
		},
		firstName: function() {
			return 'Chuck';
		},		
		lastName: function() {
			return 'Norris';
		},
		married: function() {
			// for non-local return testing
//			b = block(function() { nonLocalReturn(true); });
//			b.value();
			return false;
		}
	}
});

B = Class({
	superclass: A,
	instanceMethods: {
		testMethod2: function(num) { 
			return num; 
		},
		setTest: function(num) {
			return this._super.setTest(num);
		},
		lastName: function() {
			return this._class.lastName();
		}
	},
	classVariables: ['size'],
	classMethods: {
		myAge: function() {
			return this._super.myAge();
		},
		lastName: function() {
			return 'Skywalker';
		},
		married: function() {
			// for non-local return testing
			return this._super.married();
		}
	}
});

a = A.basicNew();
b = B.basicNew();

// testing
Assert.isTrue(typeof a.initialize == 'function');
Assert.isFalse(typeof a.foo == 'undefined');
Assert.isFalse(typeof b.foo == 'undefined');
Assert.isTrue(b.foo == null);
Assert.isTrue(typeof a.bar == 'undefined');
Assert.isTrue(typeof a.initialize == 'function');
Assert.isTrue(typeof b.testMethod == 'function');
Assert.isTrue(typeof b.testMethod2 == 'function');
Assert.isTrue(b.testMethod2(1337) == 1337);
Assert.isTrue(typeof A.basicNew == 'function');
Assert.isTrue(typeof A.firstName == 'function');
Assert.isTrue(A.firstName() == 'Chuck');
Assert.isTrue(A.lastName() == 'Norris');
Assert.isTrue(typeof B.firstName == 'function');
Assert.isTrue(B.firstName() == 'Chuck');
Assert.isTrue(B.lastName() == 'Skywalker');

a.setTest(3);
Assert.isTrue(a.test == 3);
Assert.isFalse(b.test == 3);

b.setTest(4);
Assert.isTrue(a.test == 3);
Assert.isTrue(b.test == 4);

B.age = 100;
Assert.isTrue(B.myAge() == 100);
Assert.isTrue(b.lastName() == B.lastName());

// test non-local return
//Assert.isTrue(A.married() == true);
//Assert.isTrue(B.married() == true);