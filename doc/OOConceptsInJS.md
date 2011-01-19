# Implementation of Object-oriented Concepts in JavaScript

## Introduction

JavaScript is an object-oriented language with no support for classes and other concepts you may be familiar with. JavaScript supports OOP on its own way – with prototypes. Prototypes come with the benefits that they are compact and flexible. You can use them to implement other object-oriented concepts easily.

## Note

In this paper I will use words from the OOP vocabulary like classes, methods or attributes in a JavaScript context. Those things have actually nothing to do with JavaScript. I just want to try to avoid expressions like “the class-like object” for not to confuse you.

## Classes and Instanciation

Functions in JavaScript are nothing less than objects. That means that variables can be set to functions which can be applied later in a context of your choice. With new you can instantiate objects from a constructor function. The constructor function will be called with the context of the new object.

	SimpleClass = function() {
		this.foo = "bar";
	}
 
	anObject = new SimpleClass();
	alert(anObject.foo);

In this example an object is instantiated from the class SimpleClass and foo is set to “bar”. So we can use functions for defining sth. like a class. The function itself can be used as a constructor for new objects.

## Inheritance

For implementing inheritance we can make use of the JavaScript native prototype concept. Every object has a prototype slot. Objects in this slot are copied to every instance on instantiation.

For inheritance we can set the prototype of our child class to an instance of the parent class. This way every child instances will have the same structure like the parent instances. We can also add and overwrite parent objects by explicitely defining new objects in the prototype. We can also do meta programming easily just by adding a new slot to the prototype. All instantiated objects will have this method after that.

	SimpleClass = function() { }
	SimpleClass.prototype.foo = function() { alert("bar") };

	SecondClass = function() { }
	SecondClass.prototype = new SimpleClass();

	anObject = new SecondClass();
	anObject.foo();

## Overwriting methods and accessing super methods

The next problem is the access to methods from super classes in case you have overwritten them in you inherited class. In Squeak you would simply do sth. like this:

	add: aNumber to: aSecondNumber
		super add: aNumber to: aSecondNumber.

If we want to overload a method from our inherited methods we don’t know which class the prototype object was instantiated from. Therefore we have to save a reference to the superclass to the new class.

	SimpleClass = function() { }
	SimpleClass.prototype.foo = function() { alert("bar") };
 
	SecondClass = function() { }
	SecondClass.prototype = new SimpleClass();
	SecondClass.prototype.superClass = SimpleClass;
	SecondClass.prototype.foo = function() { alert("nu bar"); }

	anObject = new SecondClass();
	anObject.foo();
	anObject.superClass.prototype.foo.apply(this);

When we access the super classes method with the prototype it is very important that the invoked method will run in the context of the current classes instance. Otherwise the method won’t use the variables from our instance or call other methods as super methods.

JavaScript comes with a very nice solution for this problem – the apply function, which is part of every function. You just call the apply function with the current context as the first parameter and an array of arguments as an optional second parameter.

With this knowledge we can write a method called super which should be implemented to every class. For that we set the super slot for the prototype of every object in JavaScript.

	Object.prototype.super = function(method, args) { 
		this.superClass.prototype[method].apply(this);
	}

The method can be called like this:

	anObject.super('foo');

and even with parameters:

	anObject.super('add', [1,5]);

