/*
 * This file is part of the squeakyJS project.
 *
 * Copyright (C) 2010, bp2010h1
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

runSqueakyJSTests = function() {

    Class('A', {
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

    Class('B', {
        superclass: A,
        instanceMethods: {
            testMethod2: function(num) { 
                return num; 
            },
            setTest: function(num) {
                return this._super.setTest(num);
            },
            lastName: function() {
                return this.__class.lastName();
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

    a = A._newInstance();
    b = B._newInstance();

    // testing
    assert(typeof a.initialize == 'function', "is initialize a function?");
    assert(typeof a.foo != 'undefined');
    assert(typeof b.foo != 'undefined');
    assert(b.foo == null);
    assert(typeof a.bar == 'undefined');
    assert(typeof a.initialize == 'function');
    assert(typeof b.testMethod == 'function');
    assert(typeof b.testMethod2 == 'function');
    assert(b.testMethod2(1337) == 1337);
    assert(typeof A._newInstance == 'function');
    assert(typeof A.firstName == 'function');
    assert(A.firstName() == 'Chuck');
    assert(A.lastName() == 'Norris');
    assert(typeof B.firstName == 'function');
    assert(B.firstName() == 'Chuck');
    assert(B.lastName() == 'Skywalker');

    a.setTest(3);
    assert(a.test == 3);
    assert(b.test != 3);

    b.setTest(4);
    assert(a.test == 3);
    assert(b.test == 4);

    B.age = 100;
    assert(B.myAge() == 100);
    assert(b.lastName() == B.lastName());

    // test non-local return
    //assert(A.married() == true);
    //assert(B.married() == true);
}