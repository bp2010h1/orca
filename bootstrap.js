JsGlobal = this;

// these two get overridden when True and False classes are available
$true = true;
$false = false;

// allow to use AnyClass.new() instead of new AnyClass(); where AnyClass is a function
Function.prototype.$new = function(){
 var obj = {};
 this.apply(obj, arguments);
 return obj;
};