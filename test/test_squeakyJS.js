
Class('A', {
	instanceVariables: ['foo'],
	instanceMethods: {
		initialize: function() {

		},
		testMethod: function() {
		},
		setTest_: function(num) {
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
		testMethod2_: function(num) { 
			return num; 
		},
		setTest_: function(num) {
			return _super('setTest_')(num);
		},
		lastName: function() {
			return this.__class.lastName;
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


tester = {
	test1: function() {
		a = A._newInstance();
		b = B._newInstance();

		// testing
		//assert(typeof a.initialize == 'function', "is initialize a function?");
		assert(typeof a.foo != 'undefined', 'typeassertion 1');
		assert(typeof b.foo != 'undefined', 'typeassertion 2');
		assert(b.foo === null);
		assert(typeof a.bar == 'undefined', 'typeassertion 3');
		//assert(typeof a.initialize == 'function');
		//assert(typeof b.testMethod == 'function');
		assert(typeof b.testMethod2_ == 'function', 'typeassertion 4');
		assert(b.testMethod2_(1337) == 1337);
		assert(typeof A._newInstance == 'function', 'typeassertion 5');
		//assert(typeof A.firstName == 'function');
		assert(A.firstName == 'Chuck');
		assert(A.lastName == 'Norris');
		//assert(typeof B.firstName == 'function');
		assert(B.firstName == 'Chuck');
		assert(B.lastName == 'Skywalker');

		a.setTest_(3);
		assert(a.test == 3);
		assert(b.test != 3);

		b.setTest_(4);
		assert(a.test == 3);
		assert(b.test == 4);

		B.age = 100;
		debugger;
		assert(B.myAge == 100);
		assert(b.lastName == B.lastName);
	}
};

tester
