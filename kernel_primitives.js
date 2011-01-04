ProtoObject._new = function() {
  return this.basicNew().initialize();
};

$Object._new = ProtoObject._new;
OrderedCollection._new = $Object._new;
Point._new = $Object._new;
Rectangle._new = $Object._new;

Number.prototype.$plus = function(anotherNumber){ return this +  anotherNumber };
Number.prototype.$minus = function(anotherNumber){ return this -  anotherNumber };

Array.prototype.new$ = function(arr){return new Array(arr)};

BlockClosure.value = function(){
  this.$func.apply(this, arguments);
}

block = function(func) {
	b = BlockClosure._new();
	b.$creationContext = arguments.callee.caller;
	
	b.$func = function() {
		try {
			ret = func.apply(this, arguments);
			if (ret.$creationContext == func) {
				ret.$creationContext = this.$creationContext;
			}
			return ret;
		}
		catch(e) {
			if(e == func) {
				this.$creationContext.nonLocalReturnValue = e.nonLocalReturnValue;
				throw this.$creationContext;
			} 
			else {
				throw e;
			}
		}
	}
	b.$func.$creationContext = arguments.callee.caller;
	
	return b;
}
