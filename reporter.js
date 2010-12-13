/*
<application>JAVASCRIPT ASSERTION UNIT</application>
<version>1.1</version>
<author>D. Fournier</author>
<e-mail>zenon48@users.sourceforge.net</e-mail>
<copyright>2002 ID EST</copyright>
<license>GPL</license>
<filename>reporter.js</filename>
<documentation></documentation>
*/
/*
################################
ASSERT_Report_Listener class
Role: listening for assertion failures
Instantiator: Reporter global variable
################################
*//*c)class*/function
ASSERT_Report_Listener(
/*ASSERT_Reporter*/reporter
){
/*m)public boolean*/this.listen=function(){
if(this.reporter.isEndReport()) return false;	///stop listening
this.setLastFailures();
return true;	///continue listening
}	//---listen

/*m)private void*/this.setLastFailures=function(){
var
/*ASSERT_Failure[]*/failures = this.reporter.getFailures();
if(!failures) return;
var
atlevel = this.failures.length;
for(var at=0,end=failures.length;at<end;at++) this.failures[this.failures.length] = failures[at];	///this.failures = this.failures.concat(failures);	///doesn't work in IE5
this.setReport(atlevel);
}	//---setLastFailures

/*m)private void*/this.setReport=function(
/*a)int*/atlevel
){
var
/*string*/content = '';
for(var at=atlevel,end=this.failures.length;at<end;at++) content += this.formater.getFormat(this.failures[at], this.getSourceStat(at));
this.reporter.setViewer(content);
}	//---setReport

/*m)private int*/this.getLastFailureStat=function(
/*ASSERT_Failure[]*/failures
){
return failures[failures.length-1].getStat();
}	//---getLastFailureStat

/*m)private int*/this.getSourceStat=function(
/*a)int*/atlevel
){
var
/*int*/at = atlevel;
while((at < this.failures.length-1) && !this.hasNewSource(at+1)) at++;
return this.hasNewSource(atlevel) ? this.failures[at].getStat() : null;
}	//---getSourceStat

/*m)private void*/this.hasNewSource=function(
/*a)int*/at
){
return (at==0) ? true : strcmp(this.failures[at].getCaller(), this.failures[at-1].getCaller());
}	//---hasNewSource

/*m)private ASSERT_Reporter*/this.reporter = reporter;
/*m)private ASSERT_Report_Formater*/this.formater = new ASSERT_Report_Formater();
/*m)private ASSERT_Failure[]*/this.failures = [];
}	//---ASSERT_Report_Listener

/*
################################
ASSERT_Report_Formater class
Role: presenting the report text
Instantiator: ASSERT_Report_Listener
################################
*//*c)class*/function
ASSERT_Report_Formater(){
var
/*static final string*/STAMP_TEMPLATE = '<div class="stamp">%s</div>\n',
SOURCE_TEMPLATE = '<div class="source"><div class="stat">&#160;ASSERTIONS checked :<span class="checked">&#160;%s&#160;</span>failed :<span class="failed">&#160;%s&#160;</span></div>\
	<span class="source">%s</span><br/><span class="path">%s</span></div>\n',
FAILURE_TEMPLATE = '<div class="failure">expected:<span class="expected">&#160;%s&#160;</span>\
	found:<span class="found">&#160;%s&#160;</span><span class="comment">%s</span></div>\n';
WARN_TEMPLATE = '<div class="warn"><span class="warn">&#160;%s&#160;</span>&#160;%s&#160;</div>\n';

/*m)protected string*/this.getFormat=function(
/*a)ASSERT_Failure*/failure,
/*a)ASSERT_Reporter_Stat*/stat		//)null if no id:comment for this failure/warning
){
return this.getSource(failure, stat) + this.getFailure(failure);
}	//---getFormat

/*m)private string*/this.getSource=function(
/*a)ASSERT_Failure*/failure,
/*a)ASSERT_Reporter_Stat*/stat
){
return (stat==null) ? '' : this.getStampText() + this.getSourceText(failure, stat);
}	//---getSource

/*m)private string*/this.getFailure=function(
/*a)ASSERT_Failure*/failure
){
return failure.isWarning() ? this.getWarningText(failure) : this.getFailureText(failure);
}	//---getFailure

/*m)private string*/this.getSourceText=function(
/*a)ASSERT_Failure*/failure,
/*a)ASSERT_Reporter_Stat*/stat
){
return sprintf(SOURCE_TEMPLATE, stat.getChecked(), stat.getFailed(), failure.getCaller(), failure.getSource());
}	//---getSourceText

/*m)private string*/this.getStampText=function(){
return sprintf(STAMP_TEMPLATE, this.getStamp());
}	//---getStampText

/*m)public string*/this.getStamp=function(){
var
/*date*/now = new Date(),
/*int*/millisec = now.getMilliseconds();
if(millisec < 100) millisec = '0' + millisec;
return sprintf('%s-%s-%s @%s:%s:%s&#160;&#160;.%s',
	this.setLeadingZero(now.getDate()),
	this.setLeadingZero(now.getMonth()+1),
	now.getFullYear(),
	this.setLeadingZero(now.getHours()),
	this.setLeadingZero(now.getMinutes()),
	this.setLeadingZero(now.getSeconds()),
	this.setLeadingZero(millisec));
}	//---getStamp

/*m)private string*/this.setLeadingZero=function(
/*a)int*/value
){
var
/*string*/lead = (value < 10) ? '0' : '';
return lead + value;	///cast value to string if it's not
}	//---setLeadingZero

/*m)private string*/this.getFailureText=function(
/*a)string[]*/failure
){
return sprintf(FAILURE_TEMPLATE, failure.getExpected(), failure.getFound(), failure.getComment());
}	//---getFailureText

/*m)private string*/this.getWarningText=function(
/*a)string[]*/failure
){
return sprintf(WARN_TEMPLATE, failure.getExpected(), failure.getComment());
}	//---getWarningText

}	//---ASSERT_Report_Formater

/*
################################
Utility functions
################################
*//*f)public string*/function
sprintf(
/*a)string*///format, parameters...
){
var
/*string*/content = '',
/*string[]*/slice = arguments[0].split('%s');
for(var at=1,end=slice.length;at<=end;at++) content += slice[at-1] + (arguments[at] || '');	///let the interpreter catch any missing %s
return content;
}	//---sprintf

/*f)public int*/function
strcmp(
/*a)string*/s1,	//)string to compare
/*a)string*/s2	//)string to compare
){
if((typeof(s1) != 'string') && (typeof(s2) != 'string')) return 1;
var
/*int*/i=0,
m=s1.length, n=s2.length;
while((i<m) && (i<n) && (s1.charAt(i)==s2.charAt(i))) i++;
if(i<m) return (i<n) ? (s1.charCodeAt(i) - s2.charCodeAt(i)) : 1;
return (m==n) ? 0 : -1;
}	//---strcmp

/*
################################
Reporter instance listener wrapper
################################
*//*f)public void*/function
listenReport(){
if(window.opener.closed) window.close();
if(Reporter.listen()) window.setTimeout('listenReport()', LISTENER_TICK);
}	//---listenReport

/*
################################
Reporter instance global variable
################################
*/
var
/*ASSERT_Report_Listener*/Reporter = new ASSERT_Report_Listener(window.opener.Assert.reporter);
var
/*static final int*/LISTENER_TICK = 1*1000;	///check for new failures every second

/*function*/window.onload = listenReport;

