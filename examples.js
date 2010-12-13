Person = Class({
	instanceVariables: 
		[ 'name', 'age' ],

	instanceMethods: {
		initialize: function() {
			
		},
		setTest: function(i) {
			this.test = i;
		},
		printTest: function(i) {
			alert(this.test);
		},
		foobar: function() {
			alert("foobar");
		}
	},
	classMethods: {
		foobar200: function() {
			alert("rofl");
		}		
	}
});

Pirate = Class({
	superClass: Person,
	instanceMethods: {
		foobar: function() {
			this.setTest(999);
			alert("pirate foobar");
		}
	}
});

ChefPirate = Class({
	superClass: Pirate,
	instanceMethods: {
		foobar: function() {
			this.$super('setTest', [999]);
			this.printTest();
		}
	}
});

harald = Person.new()

//harald = new Person();
harald.setTest(123);

captainHook = Pirate.new();
captainHook.setTest(456);

jackSparrow = ChefPirate.new();
jackSparrow.foobar();
