ProtoObject._new = function() {
  return this.basicNew().initialize();
}

Number.prototype._plus = function(anotherNumber){ return this +  anotherNumber };

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
