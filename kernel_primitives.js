ProtoObject.prototype._new = function() {
  return this.basicNew().initialize();
}

Number.prototype._plus = function(anotherNumber){ return this +  anotherNumber };