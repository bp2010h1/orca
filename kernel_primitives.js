// 
// Implementations of primitive methods
// This is loaded at the very end, everything is already available
// If this gets too long, split it in multiple files
// 

// TODO see Float
// TODO add _Array as Squeak-class! (see Array)

// Error

Error._objectPrototype.prototype.signal = function(){ throw this };

// Float (TODO this should be moved to Number or something... the whole Number-class-hierarchy should be supported in JS)
// For this, the Parser must "find out" which class is instantiated from a number-literal.. Integer/SmallInteger/Floast/etc.

Float._objectPrototype.prototype._plus = function(other) { return number(this.num$ + other.num$); };
Float._objectPrototype.prototype._minus = function(other) { return number(this.num$ - other.num$); };
Float._objectPrototype.prototype._times = function(other) { return number(this.num$ * other.num$); };
Float._objectPrototype.prototype._slash = function(other) { return number(this.num$ / other.num$); };
Float._objectPrototype.prototype._slash_slash = function(other) { return number(this.num$ / other.num$); };
Float._objectPrototype.prototype._less = function(other) {
  if( this.num$ < other.num$)
  return _true;
  else
  return _false;
};
Float._objectPrototype.prototype._greater = function(other) {
  if( this.num$ > other.num$)
  return _true;
  else
  return _false;
};
Float._objectPrototype.prototype._less_equals = function(other) {
  if( this.num$ <= other.num$) return _true;
  else return _false;
  };
Float._objectPrototype.prototype._equals = function(other) {
  if( this.num$ == other.num$)  return _true;
  else return _false;
  };
Float._objectPrototype.prototype.timesRepeat_ = function(aBlock){
  for(var i = 0; i < this.num$; i++) {
  aBlock.value();
  }
}

// Point

Point._objectPrototype.prototype._times = function(aNumber){ return (this.x()._times(aNumber))._at(this.y()._times(aNumber))};

// Array (TODO this is no squeak-class, must be changed (includes array()-function, js()-function for array-objects,
// translated Array-litarly to the array()-function, implement the primitives in a real way.

Array.new_ = function(size){return new Array(size.num$)};
Array.prototype.size = function(){ return number(this.length) };
Array.prototype.at_put_ = function(idx, val){ this[idx.num$-1] = val; return val };
Array.prototype.at_ = function(idx){ return this[idx.num$-1] };

// BlockClosure

BlockClosure._objectPrototype.prototype.value = function(){
  return this.$func.apply(this, arguments);
};
BlockClosure._objectPrototype.prototype.value_ = BlockClosure._objectPrototype.prototype.value;
BlockClosure._objectPrototype.prototype.value_value_ = BlockClosure._objectPrototype.prototype.value;
BlockClosure._objectPrototype.prototype.value_value_value_ = BlockClosure._objectPrototype.prototype.value;
BlockClosure._objectPrototype.prototype.value_value_value_value_ = BlockClosure._objectPrototype.prototype.value;

BlockClosure._objectPrototype.prototype.whileTrue_ = function(anotherBlock){
  // TODO implement whileTrue for real
  while(this.value() == _true) {
  anotherBlock.value();
  }
};