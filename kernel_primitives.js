ProtoObject.$new = function() {
  return this.basicNew().initialize();
};

$Object.$new = ProtoObject.$new;
OrderedCollection.$new = $Object.$new;
Point.$new = $Object.$new;
Rectangle.$new = $Object.$new;
S2JWorld.$new = $Object.$new;

$true = True.basicNew();
$false = False.basicNew();

Number.prototype.$plus = function(anotherNumber){ return this +  anotherNumber };
Number.prototype.$minus = function(anotherNumber){ return this -  anotherNumber };
Number.prototype.$at = function(anotherNumber){ return Point.x$y$(this, anotherNumber); }

Array.new$ = function(arr){return new Array(arr)};

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
