/*
 * Copyright (c) 2009, 2010 bp2010h1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

Person = Class({
	instanceVariables: ['name'],
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
	superclass: Person,
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
			});
			
			this.evaluateBlock(aBlock);	
				*/
			return 'Arrrrrr!!!';
		}
	}
});

jack = Pirate._newInstance();
jack.setName("Captain Jack Sparrow");

alert(jack.makeNoise());
