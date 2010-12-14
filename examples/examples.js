Person = Class({
	instanceVariables: [name],
	instanceMethods: {
		initialize: function() {
			
		},
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
	superClass: Person,
	instanceMethods: {
		makeNoise: function() {
			// access makeNoise method from superclass (doesn't need parameters)
			return this.$super('makeNoise') + this.class.noise();
		}
	},
	classMethods: {
		noise: function() {
			return 'Arrrrrr!!!';
		}
	}
});

jack = Pirate.new();
jack.setName("Captain Jack Sparrow");

alert(jack.makeNoise());