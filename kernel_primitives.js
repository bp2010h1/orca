ProtoObject._new = function() {
  return this.basicNew().initialize();
};

$Object._new = ProtoObject._new;
OrderedCollection._new = $Object._new;
Point._new = $Object._new;
Rectangle._new = $Object._new;
S2JWorld._new = $Object._new; 
BlockClosure._new = $Object._new; 

Number.prototype._plus = function(anotherNumber){ return this +  anotherNumber };
Number.prototype._minus = function(anotherNumber){ return this -  anotherNumber };
Number.prototype._at = function(anotherNumber){ return Point.x_y_(this, anotherNumber); }

Array.new_ = function(arr){return new Array(arr)};

BlockClosure.value = function(){
  this.$func.apply(this, arguments);
}