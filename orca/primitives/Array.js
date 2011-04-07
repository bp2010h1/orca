
(function() {

	_Array._addInstanceMethods({
		_privateGet: function(index) {
			return _boxObject(this.original$[index]);
		},
		_privateSet: function(index, obj) {
			this.original$[index] = _unboxObject(obj);
		},
		
		size: function(){
			return number(this.original$.length);
		},
		at_put_: function(idx, val){
			this._privateSet(idx.original$ - 1, val);
			return val;
		},
		at_: function(idx){
			return this._privateGet(idx.original$ - 1);
		},
		isEmpty: function(){
			return bool(this.original$.length == 0);
		},
		
		/* this is actually not a primitive and should be implemented by squeak.
		   it is only implemented here to work around a hardly tracable bug, probably in out blocks
		   and nonlocal return */
		includes_: function(anElement) {
			for (var i = 0; i < this.original$.length; i++) {
				if (_unboxObject(this._privateGet(i)._equals(anElement)))
					return _true;
			}
			return _false;
		},
		asObject : function () {
			// creates Prototype from object literal
			// Can only be called on arrays containing only Associations (understanding key()/value())
			var newObject = {};
			for (var i = 0; i < this.original$.length; i++) {
				var anAssociation = this._privateGet(i);
				newObject[_unboxObject(anAssociation.key())] = _unboxObject(anAssociation.value());
			}
			// Box the resulting primitive object, that is filled with unboxed values.
			return _boxObject(newObject);
		}
	});
	_Array._addClassMethods({
		new_: function(size) {
			// Not filling the indices of the array with 'nil', because of autoboxing
			return array(new Array(size.original$));
		}
	});

})();
