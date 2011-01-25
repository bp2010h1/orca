
// setup

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
	classInstanceVariables: ['age'],
	classMethods: {
		myAge: function() {
			return this.age;
		},
		firstName: function() {
			return 'Chuck';
		},		
		lastName: function() {
			return 'Norris';
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
			return _super('setTest')(num);
		},
		lastName: function() {
			return this.__class.lastName();
		}
	},
	classInstanceVariables: ['size'],
	classMethods: {
		myAge: function() {
			return _super('myAge')();
		},
		lastName: function() {
			return 'Skywalker';
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
