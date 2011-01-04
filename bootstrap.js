JsGlobal = this;

// allow to use AnyClass.new() instead of new AnyClass(); where AnyClass is a function
Function.prototype.$new = function(){
 var obj = {};
 this.apply(obj, arguments);
 return obj;
};