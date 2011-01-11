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
		classInstanceVariables: ['ABC'],

		classMethods: {
			name: function() {
				aBlock = block(function() { nonLocalReturn("This is a non local return"); });
				aBlock.value();
				
				// this part should never be executed
				return 'Foo';
			}
		}
	});

	inst = Foo._newInstance()


Every parameter is optional. To get more familiar, please try out
the examples.

## META PROGRAMMING

You can extend your class and instance methods by using the following methods:

	Foo._addClassMethods( {test: function() { } });
	Foo._addInstanceMethods( {test: function() { } });
	Foo._addInstanceVariables( ['test', 'test1'], null ); // initialized by default to null
	Foo._addClassInstanceVariables( ['test', 'test1'] ); // initialized by default to null
	Foo._addClassVariables( ['test', 'test1'] ); // initialized by default to null

This will extend the prototypes. So the new methods will be there
for subclasses too.

## RESERVED METHOD NAMES / VARIABLES

# Class side
- _classPrototype
- _instancePrototype
- _super
- _newInstance

- _addClassMethods
- _addInstanceMethods
- _addInstanceVariables
- _addClassInstanceVariables
- _addClassVariables

# Instance side
- _super
- _class
