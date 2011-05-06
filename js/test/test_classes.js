
st.klass('A', {
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

st.klass('B', {
	superclass: st.A,
	instanceMethods: {
		testMethod2: function(num) { 
			return num; 
		},
		setTest: function(num) {
			return st.supa('setTest')(num);
		},
		lastName: function() {
			return this._theClass.lastName();
		}
	},
	classInstanceVariables: ['size'],
	classMethods: {
		myAge: function() {
			return st.supa('myAge')();
		},
		lastName: function() {
			return 'Skywalker';
		}
	}
});


tester = {
	test1: function() {
		a = st.A._newInstance();
		b = st.B._newInstance();

		// testing
		st.tests.assert(typeof a.initialize == 'function', "is initialize a function?");
		st.tests.assert(typeof a.foo != 'undefined');
		st.tests.assert(typeof b.foo != 'undefined');
		st.tests.assert(b.foo == null);
		st.tests.assert(typeof a.bar == 'undefined');
		st.tests.assert(typeof a.initialize == 'function');
		st.tests.assert(typeof b.testMethod == 'function');
		st.tests.assert(typeof b.testMethod2 == 'function');
		st.tests.assert(b.testMethod2(1337) == 1337);
		st.tests.assert(typeof st.A._newInstance == 'function');
		st.tests.assert(typeof st.A.firstName == 'function');
		st.tests.assert(st.A.firstName() == 'Chuck');
		st.tests.assert(st.A.lastName() == 'Norris');
		st.tests.assert(typeof st.B.firstName == 'function');
		st.tests.assert(st.B.firstName() == 'Chuck');
		st.tests.assert(st.B.lastName() == 'Skywalker');

		a.setTest(3);
		st.tests.assert(a.test == 3);
		st.tests.assert(b.test != 3);

		b.setTest(4);
		st.tests.assert(a.test == 3);
		st.tests.assert(b.test == 4);

		st.B.age = 100;
		st.tests.assert(st.B.myAge() == 100);
		st.tests.assert(b.lastName() == st.B.lastName());
	}
};

tester
