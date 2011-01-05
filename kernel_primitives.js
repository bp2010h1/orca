ProtoObject._new = function() {
  return this.basicNew().initialize();
};

_Object._new = ProtoObject._new;
//OrderedCollection._new = _Object._new;
Point._new = _Object._new;
Rectangle._new = _Object._new;
S2JWorld._new = _Object._new; 
S2JBallGame._new = S2JWorld._new;
S2JBall._new = S2JWorld._new;
BlockClosure._new = _Object._new; 
Error._new = _Object._new;

Error._objectPrototype.prototype.signal=function(){throw this}

Number.prototype._plus = function(anotherNumber){ return this + anotherNumber };
Number.prototype._minus = function(anotherNumber){ return this - anotherNumber };
Number.prototype._at = function(anotherNumber){ return Point.x_y_(this, anotherNumber); };
Number.prototype._less = function(anotherNumber) {
  if( this < anotherNumber)
    return _true;
  else
    return _false;
};
Number.prototype._greater = function(anotherNumber) {
  if( this > anotherNumber)
    return _true;
  else
    return _false;
};
Number.prototype._less_equals = function(anotherNumber) {
  if( this <= anotherNumber)  return _true;
  else return _false;
};
Number.prototype._equals = function(anotherNumber) {
  if( this == anotherNumber)  return _true;
  else return _false;
};
Number.prototype.timesRepeat_ = function(aBlock){
  for(var i = 0; i < this; i++) {
    aBlock.value();
  }
}

Array.new_ = function(arr){return new Array(arr)};
Array.prototype.size = function(){ return this.length };
Array.prototype.at_put_ = function(idx, val){ this[idx-1] = val};

BlockClosure._objectPrototype.prototype.value = function(){
  return this.$func.apply(this, arguments);
};

BlockClosure._objectPrototype.prototype.whileTrue_ = function(anotherBlock){
  // TODO implement whileTrue for real
  while(this.value() == _true) {
    anotherBlock.value();
  }
};