/*
<application>JAVASCRIPT ASSERTION UNIT</application>
<version>1.1</version>
<author>D. Fournier</author>
<e-mail>zenon48@users.sourceforge.net</e-mail>
<copyright>2002 ID EST</copyright>
<license>GPL</license>
<filename>assert.js</filename>
<documentation></documentation>
*/
//--------------------------------ASSERTION CLASSES
/*
################################
ASSERT_Tester class
Role: setting the assertion
Instantiator: Assert global variable
################################
*//*c)class*/function
ASSERT_Tester(){
var
/*static final (boolean)int*/ASSERT_FALSE=0, ASSERT_TRUE=1, ASSERT_SKIP=2;

/*m)private boolean*/this.setAssert=function(
/*a)boolean*/doIt,
/*a)any*/arg0,		//)argument to test
/*a)any*/arg1		//)expected argument || second argument to test in compare
){
if(this.isShortAssert(doIt) || this.isTrueAssert(doIt)){
	this.processor = new ASSERT_Processor(arg0, arg1);
	this.reporter.setChecked();
	return true;	
	}
return false;
}	//---setAssert

/*m)private (boolean)int*/this.check=function(
/*a)string*/operation,		//)assertion operation
/*a)any*/arg0,		//)argument to test
/*a)any*/arg1,		//)expected argument 
/*a)boolean*/doIt,	//)(optional) assertion checking flag
/*a)string*/id		//)(optional) calling function name and comment
){
if(!this.setAssert(doIt, arg0)) return ASSERT_SKIP;
if(this.processor.check(operation)) return ASSERT_TRUE;
this.reporter.setFailure(new ASSERT_Failure(this.getDoItComment(doIt, id), arg0, arg1));
return ASSERT_FALSE;
}	//---check

/*m)private (boolean)int*/this.compute=function(
/*a)string*/operation,		//)assertion operation
/*a)any*/arg0,		//)argument to test
/*a)any*/arg1,		//)expected argument 
/*a)boolean*/doIt,	//)(optional) assertion has to be done yes || no
/*a)string*/id		//)(optional) calling function name and comment
){
if(!this.setAssert(doIt, arg0)) return ASSERT_SKIP;
if(this.processor.compute(operation)) return ASSERT_TRUE;
this.reporter.setFailure(new ASSERT_Failure(this.getDoItComment(doIt, id), arg0, arg1));
return ASSERT_FALSE;
}	//---compute

/*m)public (boolean)int*/this.compare=function(
/*a)string*/operation,	//)assertion operation
/*a)any*/arg0,		//)argument to compare
/*a)any*/arg1,		//)argument to compare
/*a)boolean*/doIt,	//)(optional) assertion has to be done yes || no
/*a)string*/id		//)(optional) calling function name and comment
){
if(!this.setAssert(doIt, arg0, arg1)) return ASSERT_SKIP;
if(this.processor.compare(operation)) return ASSERT_TRUE;
var
/*string*/assertion = (operation=='==') ? '' : operation;
this.reporter.setFailure(new ASSERT_Failure(this.getDoItComment(doIt, id), arg0, assertion + arg1));
return ASSERT_FALSE;
}	//---compare

/*m)public (boolean)int*/this.isTrue=function(
/*a)any*/arg0,
/*a)boolean*/doIt,	//)(optional) assertion has to be done yes || no
/*a)string*/id		//)(optional) calling function name and comment
){
return this.check('', arg0, 'true', doIt, id);
}	//---isTrue

/*m)public (boolean)int*/this.isFalse=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.check('!', arg0, 'false', doIt, id);
}	//---isFalse

/*m)public (boolean)int*/this.isNull=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.check('null==', arg0, 'null', doIt, id);
}	//---isNull

/*m)public (boolean)int*/this.isNotNull=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.check('null!=', arg0, '!= null', doIt, id);
}	//---isNotNull

/*m)public (boolean)int*/this.isUndefined=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.check('undefined==', arg0, 'undefined', doIt, id);
}	//---isUndefined

/*m)public (boolean)int*/this.isNotUndefined=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.check('undefined!=', arg0, '!= undefined', doIt, id);
}	//---isNotUndefined

/*m)public (boolean)int*/this.isNumber=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.compute('!', arg0, 'number', doIt, id);
}	//---isNumber

/*m)public (boolean)int*/this.isNotNumber=function(
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.compute('', arg0, 'NaN', doIt, id);
}	//---isNotNumber

/*m)public (boolean)int*/this.isEqual=function(
/*a)any*/arg1,
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.compare('==', arg0, arg1, doIt, id);
}	//---isEqual

/*m)public (boolean)int*/this.isNotEqual=function(
/*a)any*/arg1,
/*a)any*/arg0,
/*a)boolean*/doIt,
/*a)string*/id
){
return this.compare('!=', arg0, arg1, doIt, id);
}	//---isNotEqual

/*m)public (boolean)int*/this.warn=function(
/*a)string*/warning,
/*a)boolean*/doIt
){
if(!this.setAssert(doIt, true)) return ASSERT_SKIP;
this.reporter.setFailure(new ASSERT_Warning(warning));
return ASSERT_FALSE;
}	//---warn

/*m)private (boolean)int*/this.getDoItComment=function(
/*a)boolean*/doIt,
/*a)string*/id
){
return Argument.isString(doIt) ? doIt : id;
}	//---getDoItComment

/*m)private (boolean)int*/this.isShortAssert=function(
/*a)boolean*/doIt
){
return Argument.isUndefined(doIt) || Argument.isString(doIt);	///assertion function called without providing doIt argument
}	//---isShortAssert

/*m)private (boolean)int*/this.isTrueAssert=function(
/*a)(boolean)*/doIt
){
return Argument.isBoolean(doIt) && doIt;
}	//---isTrueAssert

/*private ASSERT_Processor*/this.processor = null;
/*private ASSERT_Reporter*/this.reporter = new ASSERT_Reporter();
}	//---ASSERT_Tester

/*
################################
ASSERT_Processor class
Role: processing an assertion(checking, computing or comparing)
Instantiator: ASSERT_Tester
################################
*//*c)class*/function
ASSERT_Processor(
/*a)any*/arg0,	//)argument to test
/*a)any*/arg1	//)second argument to test in compare
){
/*m)protected boolean*/this.check=function(
/*string*/op
){
return eval(op + this.arg0.getArgument());
}	//---check

/*m)protected boolean*/this.compute=function(
/*string*/op
){
return eval(op + 'isNaN(' + this.arg0.getArgument() + ')');
}	//---compute

/*m)protected boolean*/this.compare=function(
/*string*/op
){
return eval(this.arg0.getArgument() + op + this.arg1.getArgument());
}	//---compare

/*private ASSERT_Argument*/this.arg0 = new ASSERT_Argument(arg0);
/*private ASSERT_Argument*/this.arg1 = new ASSERT_Argument(arg1);
}	//---ASSERT_Processor


/*
################################
ASSERT_Argument class
Role: setting the assertion argument
Instantiator: ASSERT_Processor, ASSERT_Failure
################################
*//*c)class*/function
ASSERT_Argument(
/*a)any*/arg
){
/*m)private any*/this.setArgument=function(
/*a)any*/arg
){
return this.isWithoutQuote(arg) ? arg :
	this.isArray(arg) ? this.setArrayQuoteOn(arg.concat()) :	///copy array
	this.setQuoteOn(arg);
}	//---setArgument

/*m)private string*/this.setQuoteOn=function(
/*a)string*/arg
){
if(this.isString(arg)){
	arg = arg.replace(/"/g, '&quot;');
	arg = arg.replace(/'/g, '&apos;');
	}
return '"'+arg+'"';
}	//---setQuoteOn

/*m)private string*/this.setQuoteOff=function(
/*a)any*/arg
){
if(this.isString(arg)){
	arg = arg.replace(/&quot;/g, '"');
	arg = arg.replace(/&apos;/g, "'");
	}
return (arg=='""') ? arg : arg.substr(1, arg.length-2);	///strip "" added by setQuoteOn
}	//---setQuoteOff

/*m)private any[]*/this.setArrayQuoteOn=function(
/*a)any[]*/arg
){
for(var k in arg) if(this.isString(arg[k])) arg[k] = this.setQuoteOn(arg[k]);
return arg;
}	//---setArrayQuoteOn

/*m)private any[]*/this.setArrayQuoteOff=function(
/*a)any[]*/arg
){
for(var k in arg) if(this.isString(arg[k])) arg[k] = this.setQuoteOff(arg[k]);
return arg;
}	//---setArrayQuoteOff

/*m)private string*/this.setTagOn=function(
/*a)string*/arg
){
arg = arg.replace(/</g, '&lt;');
arg = arg.replace(/>/g, '&gt;');
return arg;
}	//---setTagOn

/*m)protected any*/this.getArgument=function(){
return this.isArray(this.argument) ? this.getArrayArgument() : this.argument;
}	//---getArgument

/*m)private (boolean)string*/this.getArrayArgument=function(){
return this.argument.length ? '['+this.argument+']' : false;	///empty array is false
}	//---getArrayArgument

/*m)protected string*/this.getArgumentAsText=function(){
if(this.isNull(this.argument)) return 'null';
if(this.isUndefined(this.argument)) return 'undefined';
if(this.isNumber(this.argument) || this.isBoolean(this.argument)) return this.argument.toString();
if(this.isString(this.argument)) return this.getStringAsText(this.argument);
if(this.isArray(this.argument)) return this.getArrayAsText(this.argument);
}	//---getArgumentAsText

/*m)protected string*/this.getStringAsText=function(
/*string*/arg
){
return this.setTagOn(this.setQuoteOff(arg));
}	//---getStringAsText

/*m)protected string*/this.getArrayAsText=function(
/*any[]*/arg
){
return '['+this.setArrayQuoteOff(arg)+']';
}	//---getArrayAsText

/*m)private boolean*/this.isWithoutQuote=function(
/*a)any*/arg
){
return this.isNumber(arg) || this.isBoolean(arg) || this.isNull(arg) || this.isUndefined(arg);
}	//---isWithoutQuote

/*m)public boolean*/this.isNumber=function(
/*a)any*/arg
){
return typeof(arg)==='number';
}	//---isNumber

/*m)public boolean*/this.isString=function(
/*a)any*/arg
){
return typeof(arg)==='string';
}	//---isString

/*m)public boolean*/this.isUndefined=function(
/*a)any*/arg
){
return arg===undefined;
}	//---isUndefined

/*m)public boolean*/this.isNull=function(
/*a)any*/arg
){
return arg===null;
}	//---isNull

/*m)public boolean*/this.isBoolean=function(
/*a)any*/arg
){
return arg===true || arg===false;
}	//---isBoolean

/*m)public boolean*/this.isArray=function(
/*a)any*/arg
){
return !this.isNull(arg) && typeof(arg)==='object' && (arg.length!==undefined);
}	//---isArray

/*m)public boolean*/this.isObject=function(
/*a)any*/arg
){
return !this.isNull(arg) && typeof(arg)==='object' && (arg.length===undefined);
}	//---isObject

/*m)public boolean*/this.isEmpty=function(
/*a)any*/arg
){
return ((this.isString(arg) || this.isArray(arg)) && !arg.length);
}	//---isEmpty

/*private any*/this.argument = this.setArgument(arg);
}	//---ASSERT_Argument

//--------------------------------FAILURE CLASSES
/*
################################
ASSERT_Abstract_Failure class
Role: setting the assertion failure data
Instantiator: none
################################
*//*c)class*/function
ASSERT_Abstract_Failure(){
/*m)private string*/this.setCaller=function(
/*a)string*/id			//)function name and test comment
){
return Argument.isUndefined(id) ? '(not specified)' : id.substr(0, id.indexOf(':'));
}	//---setCaller

/*m)private string*/this.setComment=function(
/*a)string*/id			//)function name and test comment
){
return Argument.isUndefined(id) ? '' : id.substr(id.indexOf(':') + 1);	///skip :
}	//---setComment

/*m)private void*/this.setStat=function(
/*a)ASSERT_Reporter_Stat*/stat
){
this.stat = stat;
}	//---setStat

/*m)protected string*/this.getSource=function(){
return this.source;
}	//---getSource

/*m)protected string*/this.getCaller=function(){
return this.caller;
}	//---getCaller

/*m)protected string*/this.getComment=function(){
return this.comment;
}	//---getComment

/*m)protected string*/this.getExpected=function(){
return this.expected.getArgumentAsText();
///return this.found;
}	//---getExpected

/*m)protected ASSERT_Reporter_Stat*/this.getStat=function(){
return this.stat;
}	//---getStat

/*m)protected boolean*/this.isWarning=function(){
return this.warning;
}	//---isWarning

/*m)private boolean*/this.warning = false;
/*m)private string*/this.source = location.href;
/*m)private string*/this.caller = null;
/*m)private string*/this.comment = null;
/*m)private string*/this.expected = null;
/*m)private ASSERT_Reporter_Stat*/this.stat = null;
}	//---ASSERT_Abstract_Failure

/*
################################
ASSERT_Failure class extends ASSERT_Abstract_Failure
Role: setting the assertion failure data
Instantiator: ASSERT_Tester
################################
*//*c)class*/function
ASSERT_Failure(
/*a)string*/id,			//)function name and test comment
/*a)any*/found,			//)found value (arg0)
/*a)string*/expected	//)expected value (arg1)
){
/*m)protected string*/this.getFound=function(){
return this.found.getArgumentAsText();
}	//---getFound

/*m)private string*/this.caller = this.setCaller(id);
/*m)private string*/this.comment = this.setComment(id);
/*m)private any*/this.found = new ASSERT_Argument(found);
/*m)private string*/this.expected = new ASSERT_Argument(expected);
}	//---ASSERT_Failure
ASSERT_Failure.prototype = new ASSERT_Abstract_Failure;


/*
################################
ASSERT_Warning class extends ASSERT_Abstract_Failure
Role: setting the warning data
Instantiator: ASSERT_Tester
################################
*//*c)class*/function
ASSERT_Warning(
/*a)string*/warning	//)warning comment
){
/*m)private string*/this.warning = true;
/*m)private string*/this.caller = this.setCaller(warning);
/*m)private string*/this.comment = this.setComment(warning);
/*m)private string*/this.expected = new ASSERT_Argument('WARNING!');
}	//---ASSERT_Warning
ASSERT_Warning.prototype = new ASSERT_Abstract_Failure;

//--------------------------------REPORTER CLASSES
/*
################################
ASSERT_Reporter class
Role: reporting the assertion failure
Instantiator: ASSERT_Tester
################################
*//*c)class*/function
ASSERT_Reporter(){
/*m)protected void*/this.setClear=function(){
this.stop = false;
this.checked = 0;
this.failed = 0;
this.overall = 0;
this.reported = 0;
this.failures = [];
this.viewer.setClear();
}	//---setClear

/*m)protected void*/this.setFailure=function(
/*ASSERT_Failure*/failure
){
this.setFailed(failure);
failure.setStat(new ASSERT_Reporter_Stat(this.checked, this.failed));
this.failures.push(failure);
this.getViewer();
}	//---setFailure

/*m)private void*/this.setChecked=function(){
this.checked++;
}	//---setChecked

/*m)private void*/this.setFailed=function(
/*ASSERT_Failure*/failure
){
this.overall++;
if(failure.isWarning()) return;
this.failed++;
}	//---setFailed

/*m)public void*/this.setEnd=function(){
this.stop = true;
}	//---setEnd

/*m)private void*/this.setViewer=function(
/*a)string*/content
){
this.viewer.setDisplay(content);
}	//---setViewer

/*m)public void*/this.setClose=function(){
this.viewer.setClose();
}	//---setClose

/*m)protected ASSERT_Failure[]*/this.getFailures=function(){
if(this.hasNotReported()){
	var
	/*int*/atLevel = this.reported;
	this.reported = this.overall;		///clear
	return this.failures.slice(atLevel);
	}
return null;
}	//---getFailures

/*m)private void*/this.getViewer=function(){
this.viewer.getViewer();
}	//---getViewer

/*m)protected boolean*/this.isEndReport=function(){
return this.stop;
}	//---isEndReport

/*m)private (boolean)int*/this.hasNotReported=function(){
return this.overall - this.reported;
}	//---hasNotReported

	///members set by setClear()
/*m)private ASSERT_Failure[]*/	//this.failures		//)failures repository
/*m)private int*/			//this.checked		//)assertions checked count
/*m)private int*/			//this.failed		//)failures recorded count
/*m)private int*/			//this.overall		//)failures and warnings reported count
/*m)private int*/			//this.reported		//)failures reported count
/*m)private boolean*/		//this.stop			//)to stop reporting listener
/*m)private ASSERT_Reporter_Viewer*/this.viewer = new ASSERT_Reporter_Viewer();
this.setClear();
}	//---ASSERT_Reporter

/*
################################
ASSERT_Reporter_Stat class
Role: reporting the statistics of assertion failures
Instantiator: ASSERT_Reporter
################################
*//*c)class*/function
ASSERT_Reporter_Stat(
/*int*/checked, 	//)checked assertions count
/*int*/failed		//)failed assertions (failures) count
){
/*m)protected string*/this.getChecked=function(){
return this.checked.toString();
}	//---getChecked

/*m)protected string*/this.getFailed=function(){
return this.failed.toString();
}	//---getFailed

/*m)private int*/this.checked = checked;	//)checked assertions count
/*m)private int*/this.failed = failed;		//)failed assertions (failures) count
}	//---ASSERT_Reporter_Stat

/*
################################
ASSERT_Reporter_Viewer class
Role: reporting the assertion failure on a browser window
Instantiator: ASSERT_Reporter
################################
*//*c)class*/function
ASSERT_Reporter_Viewer(){
/*m)private void*/this.setDisplay=function(
/*a)string*/content
){
this.widget.document.getElementById('report').innerHTML += content;
}	//---setDisplay

/*m)private void*/this.setClear=function(){
if(!this.isReportClosed()) this.widget.document.getElementById('report').innerHTML = '';
}	//---setClear

/*m)protected void*/this.setClose=function(){
if(!this.isReportClosed()) this.widget.close();
}	//---setClose

/*m)private void*/this.getViewer=function(){
if(this.isReportClosed()) this.widget = window.open(REPORTER_URL, 'REPORTER',
	'width='+REPORTER_WIDTH+',height='+REPORTER_HEIGHT+',left='+REPORTER_LEFT+',top='+REPORTER_TOP+',dependent=1,scrollbars=1');
}	//---getViewer

/*m)private boolean*/this.isReportClosed=function(){
return !this.widget || this.widget.closed;
}	//---isReportClosed

/*m)private window*/this.widget = null;
}	//---ASSERT_Reporter_Viewer

/*
################################
CONFIGURATION PARAMETERS
Edit these variables to reflect your configuration needs
################################
*/
var
/*static final string*/	REPORTER_URL = 'assert/reporter.html',				//put an absolute path if you prefer
/*static final int*/	REPORTER_WIDTH = 700, REPORTER_HEIGHT = 400,	//reporter window dimensions
						REPORTER_LEFT = 100, REPORTER_TOP = 0;			//reporter window screen position

/*
################################
Assert reporter wrapper
################################
*//*f)public void*/function
clearReport(){
Assert.reporter.setClear();
}	//---clearReport

/*f)public void*/function
setEnd(){
Assert.reporter.setEnd();
}	//---setEnd
/*
################################
Assert instance global variable
Argument instance global variable
################################
*/
var
/*ASSERT_Tester*/Assert = new ASSERT_Tester();
var
/*ASSERT_Argument*/Argument = new ASSERT_Argument(/*undefined*/);

/*
################################
Reporter window behaviour
################################
*/
window.onunload =
/*f)public void*/function(){
//Assert.reporter.setClose();	//uncomment this line if you want to have the reporter window automatically closed when you unload the document containing the script to be tested
}	//---


