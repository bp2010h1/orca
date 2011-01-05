_true = True.basicNew();
_false = False.basicNew(); 

// Make JsGlobal alert: 'something' work out of the box
JsGlobal = this;

// allow to use AnyClass.new() instead of new AnyClass(); where AnyClass is a function
Function.prototype._new = function(){
 var obj = {};
 this.apply(obj, arguments);
 return obj;
};



block = function(func, that) {
	b = BlockClosure._new();
	b.$creationContext = arguments.callee.caller;
	
	b.$func = function() {
		try {
			ret = func.apply(that, arguments);
			if (ret != undefined) {
			  if(ret.$creationContext == func) {
				  ret.$creationContext = this.$creationContext;
			  }
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
};