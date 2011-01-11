# squeakyJS

## INTRODUCTION

squeakyJS is the implementation of the class class model from the programmers
views in JavaScript. It supports inheritance of classes, access to superclass methods and
class-side methods. Furthermore there is an implementation for nonlocal return and
blocks.

## GETTING STARTED

	Foo = Class({
		superclass: Bar,

		instanceVariables: ['a', 'b', 'c'],

		instanceMethods: {
			initialize: function() {
			},
			// further methods
		},

		classVariables: ['d', 'e', 'f'],

		classMethods: {
			name: function() {
				aBlock = block(function() { nonLocalReturn("This is a non local return"); });
				aBlock.value();
				
				// this part should never be executed
				return 'Foo';
			}
		}
	});

	inst = Foo._new()


Every parameter is optional. To get more familiar, please try out
the examples.

## META PROGRAMMING

You can extend your class and instance methods by using the following methods:

	Foo._addClassMethod("test", function() { });
	Foo._addInstanceMethod("test", function() { });

This will extend the prototypes. So the new methods will be there
for subclasses too.

## RESERVED METHOD NAMES

# Class side
- _classPrototype
- _objectPrototype
- _super

# Instance side
- _super
- _class
