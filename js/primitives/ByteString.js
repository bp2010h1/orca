
// Runtime depends on: boxing.js

(function() {

	st.ByteString._addInstanceMethods({
		at_put_: function (index, aCharacter) {
			aCharacter.isCharacter().ifFalse_(st.block(function () {
				return st.nonLocalReturn(this.errorImproperStore());
			}));
			aCharacter.isOctetCharacter().ifFalse_(st.block(function () {
				this.becomeForward_(st.WideString.from_(this));
				return st.nonLocalReturn(this.at_put_(index, aCharacter));
			}));
			index.isInteger().ifTrue_ifFalse_(st.block(function () {
				if (st.unbox(index) <= st.unbox(this).length) {
					var start = this._original.substr(0, st.unbox(index) - 1);
					var end = this._original.substr(st.unbox(index));
					var newString = start + st.unbox(aCharacter) + end;
					this._original = newString;
					return this;
				} else { 
					return this.errorSubscriptBounds_(index); 
				}
			}), st.block(function () {
				return this.errorNonIntegerIndex();
			}));
		},

		at_: function (index){
			return st.character(st.unbox(this)[st.unbox(index) - 1]);
		}
		
	});

})();
