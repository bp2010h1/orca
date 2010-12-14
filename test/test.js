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
		}
	}
});

B = Class({
	superClass: A,
	instanceMethods: {
		testMethod2: function(num) { 
			return num; 
		},
		setTest: function(num) {
			return this.$super('setTest', [num]);
		},
		lastName: function() {
			return this.class.lastName();
		}
	},
	classVariables: ['size'],
	classMethods: {
		myAge: function() {
			return this.$super('myAge', []);
		},
		lastName: function() {
			return 'Skywalker';
		}
	}
});

a = A.new();
b = B.new();

Assert.isTrue(typeof a.foo == 'undefined');
Assert.isFalse(typeof b.foo == 'undefined');
Assert.isTrue(b.foo == null);
Assert.isTrue(typeof a.bar == 'undefined');
Assert.isTrue(typeof a.initialize == 'function');
Assert.isTrue(typeof b.testMethod == 'function');
Assert.isTrue(typeof b.testMethod2 == 'function');
Assert.isTrue(b.testMethod2(1337) == 1337);
Assert.isTrue(typeof A.new == 'function');
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

