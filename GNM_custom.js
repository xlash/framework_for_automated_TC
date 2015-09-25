/*-------------------------------------------------------------------------
   * Postman framework for automatic testing. This is the framework for Tests Cases
   *
   * AUTHORS
   *  - Guillaume Nourry-Marquis
   * DEPENDENCIES
   *  - None
   *
   *
   * VERSION HISTORY
   *  - 0.2 - 2015-09-17 
   *-------------------------------------------------------------------------/*/

//JS does not support string char replacement. http://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}
//String shuffle method extension 
//http://stackoverflow.com/questions/3943772/how-do-i-shuffle-the-characters-in-a-string-in-javascript
String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

var FRAMEWORK = {

  log : function (message){
    var log_str = "";
    try {
      if (Object.keys(environment).indexOf('TC_NAME')!=-1){
        log_str+=environment['TC_NAME'];

      }
      log_str+="::";
      if (Object.keys(environment).indexOf('SEQ_NUM')!=-1){
        log_str+=environment['SEQ_NUM'].toString() ;
      }
      log_str+=' - ';
      log_str+="::";
      if (FRAMEWORK['sequences'].length !=0 &&  Object.keys(environment).indexOf('SEQ_NUM')!=-1 && environment['SEQ_NUM'].toNumber()>=0 && Object.keys(FRAMEWORK['sequences']).length >= environment['SEQ_NUM'].toNumber() && Object.keys(FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()]).indexOf('NAME') !=-1){
        log_str+=FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()]['NAME'];
      }
      log_str+="::";
    }
    finally{
     console.log("FRAMEWORK_DEBUG::" + log_str  +  " ==> " +  message);
    }
  },
  
  _setVar : function (name,value){
          if (Object.keys(globals).indexOf(name)!=-1) {
              postman.setEnvironmentVariable(name,globals[name]);
              FRAMEWORK.log('Using global variable ' + name + "value="+ globals[name] );
          } else {
              postman.setEnvironmentVariable(name,value);
          }
          /*varlist.push(name);*/
  }
  ,
  _test_init : function (testcase_name,description,categories_array){
    FRAMEWORK.log("FRAMEWORK_DEBUG:: test_init begins");
    description = (typeof description === 'undefined') ? {} : description;   
    categories_array = (typeof categories_array === 'undefined') ? [] : categories_array;  
    postman.clearEnvironmentVariables();
    varlist={};
    //If repeating the same tests cases, put back in the env the iteration variables. Make sure we are still in the same test case!
    if (FRAMEWORK.repeat_tc && (FRAMEWORK.iteration_for == null || testcase_name==FRAMEWORK.iteration_for)) {
      FRAMEWORK._repeatTC_prepareNextIteration(testcase_name);
    } 
    else {FRAMEWORK.repeat_tc=false;FRAMEWORK._repeatTC_clear();}
    if (FRAMEWORK.iteration_num >= 100) {FRAMEWORK._repeatTC_clear();throw "MAXIMUM TC iteration reached";}

    FRAMEWORK.setVar('TC_NAME',testcase_name);
    FRAMEWORK.setVar('ITERATION_FOR',testcase_name); //Make sure while repeating this test case, that we haven't change test case
              /*By default sequence name can be None*/
    FRAMEWORK.setVar('SEQ_NUM',-1);
    FRAMEWORK.setVar('REPEAT_TC',FRAMEWORK.repeat_tc);
    if (FRAMEWORK.repeat_tc) {
      FRAMEWORK.setVar('NEXT_ITERATIONS',FRAMEWORK.next_iteration);
      FRAMEWORK.setVar('ITERATION_NUM',FRAMEWORK.iteration_num);
      FRAMEWORK.setVar('ITERATION_FOR',FRAMEWORK.iteration_for);
      FRAMEWORK.setVar('TOTAL_ITERATION_NUM',FRAMEWORK.TOTAL_ITERATION_NUM)
    }
    FRAMEWORK.testcase={'TestCaseID':environment['TC_NAME'],'sequences':[],'description':description,'categories':categories_array}
    FRAMEWORK.SKIP_NEXT_TESTCASES = false;
    FRAMEWORK['sequences'] = [];
        FRAMEWORK.log("FRAMEWORK_DEBUG:: test_init ends");
  },
  //Methods that allows to repeat a test case
  _repeatTC_clear: function () {
      FRAMEWORK.repeat_tc =false;
      FRAMEWORK.iterations = [];
      FRAMEWORK.next_iteration=null
      FRAMEWORK.iteration_num = 0;
      FRAMEWORK.iteration_for = null;
  },
  _repeatTC_for: function (iteration_array) {
    if (FRAMEWORK.iterations.length==0){
      FRAMEWORK.repeat_tc =true
      FRAMEWORK.iterations = iteration_array;
      FRAMEWORK.TOTAL_ITERATION_NUM=iteration_array.length
    }
    else {FRAMEWORK.log("Skipping set iteration array, already repeating TC")}
  },
  _repeatTC_prepareNextIteration: function (testcase_name) {
      FRAMEWORK.next_iteration = FRAMEWORK.iterations.pop();
      FRAMEWORK.log("RepeatTC : Next iteration ready : " + FRAMEWORK.next_iteration)
      FRAMEWORK.iteration_num+=1;
      if (FRAMEWORK.iteration_for==null){FRAMEWORK.iteration_for = testcase_name;}
      if (FRAMEWORK.iterations.length==0){
        FRAMEWORK.log("RepeatTC : Done repeating after this last one! ")
        FRAMEWORK.repeat_tc=false;
      }
  },
  _test_exit: function (){
      FRAMEWORK.log("FRAMEWORK_DEBUG:: test_exit begins");
      //postman.clearEnvironmentVariables();  ==> Handled in the test_init now
      FRAMEWORK.testcase.sequences = FRAMEWORK['sequences']
      FRAMEWORK.writeResult(FRAMEWORK.testcase);
      FRAMEWORK.log("FRAMEWORK_DEBUG:: test_exit ends");

  },
  //  FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()]['STATUS']=='FAILED' 'ERROR' 'SUCCESS' 'SKIPPED'
  _sequence_init : function (sequence_name){
    FRAMEWORK.log("FRAMEWORK_DEBUG:: sequence_init begins");
    //verify if previous sequence passed. Skip for first TC
    if (environment['SEQ_NUM']===undefined){throw("SEQUENCE_INIT :Please instantiate a new TestCase before calling a new sequence.")}
    if (environment['SEQ_NUM'].toNumber() >=0 && ['SUCCESS','EXECUTED'].indexOf(FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()]['STATUS']) ==-1  ) {
      postman.setEnvironmentVariable('url','SKIP_NEXT_TEST_CASE');
    }
    else {      
      postman.setEnvironmentVariable('url',globals['base_url']);
    }

    //Increment seq_num for this new sequence
    postman.setEnvironmentVariable('SEQ_NUM',environment['SEQ_NUM'].toNumber()+1);
    sequence = {} ;
    sequence['NAME'] = sequence_name;
    if (FRAMEWORK.repeat_tc){sequence['NAME'] += " REPFRAMEWORKTION::" + FRAMEWORK.iteration_num}
    sequence['STATUS'] = 'NOT_RUN';
    sequence['request'] = "";
    sequence['response'] = "";
    sequence['request_timestamp'] = FRAMEWORK.timeConverter(true);
    sequence['response_timestamp'] = "";
    sequence['validations'] = "";
    FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()] = sequence;
    FRAMEWORK.log("FRAMEWORK_DEBUG:: sequence_init ends");
  },
  _sequence_end : function (tests_obj){
    FRAMEWORK.log("FRAMEWORK_DEBUG:: sequence_end begins"); 
    //Verify if test was skipped
    tests_obj = (typeof tests_obj === 'undefined') ? {} : tests_obj;    
    sequence = FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()];
    try{
        if (environment['SEQ_NUM'].toNumber() >=1 && request.url.indexOf('SKIP_NEXT_TEST_CASE') > -1){
            sequence['STATUS'] = 'SKIPPED';
            sequence['request'] = "<pre></pre>" ;
            sequence['response'] =  "<pre></pre>" ;
            sequence['response_timestamp'] = FRAMEWORK.timeConverter(true);
            sequence['validations'] = false;
        }
        else {
            sequence['STATUS'] = 'EXECUTED';
            if (FRAMEWORK.SKIP_NEXT_TESTCASES){sequence['STATUS'] = 'FAILED';}
            sequence['request'] = "<pre style='overflow: scroll;word-wrap: break-word; width: 1000px;height:400px; text-align: left; valign: top; whitespace: nowrap;'><b>" + request.method + ' ' + request.url + '</b>\n' + JSON.stringify(request.headers, null, 4) + '\n\n\n' + request.data + "</pre>" ;
            sequence['response'] =  "<pre style='overflow: scroll;word-wrap: break-word; width: 1000px;height:400px; text-align: left; valign: top; whitespace: nowrap;'><b>" + responseCode.code + '</b>\n\n' + JSON.stringify(responseHeaders, null, 4) + '\n\n' + responseBody + "</pre>" ;
            sequence['response_timestamp'] = FRAMEWORK.timeConverter(true);
            sequence['validations'] = tests_obj;
        } 
    } catch(ex){
      FRAMEWORK.log("sequence_end error. Stop executing next tests. Error =" + ex)
      sequence['STATUS'] = 'ERROR';
    }
    finally{
      FRAMEWORK['sequences'][environment['SEQ_NUM'].toNumber()] = sequence;
      FRAMEWORK.log("FRAMEWORK_DEBUG:: sequence_end ends");
    }
  },
  _sequence_error : function (exception){
    FRAMEWORK.log("Error Validation sequence error: " + exception.message + ":: " + exception.name);
    FRAMEWORK._set_status_errored();
  },
  _skip_next_testcases : function (){FRAMEWORK.SKIP_NEXT_TESTCASES=true;},
  _continue_tests_if : function (condition){if(!condition){FRAMEWORK.skip_next_testcases();}},
  _timeConverter : function (pretty_print,short){
    pretty_print = (typeof pretty_print === 'undefined') ? false : pretty_print;    
    short = (typeof short === 'undefined') ? false : short;    
    var a = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = a.getMonth()+1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var mili = a.getMilliseconds();
    if (min<10){min="0" + min.toString()};
    if (date<10){date="0" + date.toString()};
    if (month<10){month="0" + month.toString()};
    if (sec<10){sec="0" + sec.toString()};
    if (hour<10){hour="0" + hour.toString()};
    if (mili<10){
      mili="0" + mili.toString()
    } else if (mili<100){
      mili="00" + mili.toString()
    }
    var time  = ""
    if (pretty_print){
        time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec + '.' + mili;
    } else if (short) {
        time = month + '' + date + '' + hour + '' + min + '' + sec + '' + mili;

    }else {
        time = year + '' + month + '' + date + '' + hour + '' + min + '' + sec + '' + mili;
    }
    return time;
  },

  _set_status_failed : function () {
    FRAMEWORK['sequences'][environment['SEQ_NUM']]['STATUS'] = 'FAILED';
  },
  
  _set_status_passed : function () {
    FRAMEWORK['sequences'][environment['SEQ_NUM']]['STATUS'] = 'PASSED';
  },
  _set_status_errored : function () {
      try{
        FRAMEWORK['sequences'][environment['SEQ_NUM']]['STATUS'] = 'ERROR';
      }
      catch(e){
        FRAMEWORK.log("_set_status_errored::Cannot set status")
      }
      finally{ FRAMEWORK.skip_next_testcases();}
  },



  //Returns random integer between min and max. Min is optionnal or 0. (Both values are inclusive)
  _random : function (max_val,min_val) {
    min_val = (typeof min_val === 'undefined') ? 0 : min_val; //Optional minimum value field
    if ( min_val> max_val) {throw "Minimal value "+ min_val + " needs to be smaller than max value : "+ max_val;}
    if ( min_val== max_val) {return min_val;}
    ran = Math.floor((Math.random() * (max_val - min_val +1)) + min_val)
    return ran

  },

  /*return random partner id*/
  _generate_partner : function () {
    for (tentative=0;tentative<100;tentative++) {
      partner_id=FRAMEWORK.random(FRAMEWORK.partners.length-1);
      if (FRAMEWORK.partners[partner_id]['T&R']==1) {
        return partner_id; 
      }
    }
    throw "FRAMEWORK::_generate_partner::ERR_002 Unable to find a partner in 100 iterations";
  },
  /*http://stackoverflow.com/questions/326596/how-do-i-wrap-a-function-in-javascript
  Wrapper method for proper error handling of the FRAMEWORK module. Each function needs to be wrapped manually*/
  _makeSafe : function (fn) {
    return function(){
      try{
        return fn.apply(this, arguments);
      }catch(ex){
          FRAMEWORK.log( "FRAMEWORK::makeSafe::ErrorHandler::" + ex);
          FRAMEWORK.log( "FRAMEWORK::makeSafe::ErrorHandler::stacktrace" + ex.stack);
          FRAMEWORK.SKIP_NEXT_TESTCASES = true;
          FRAMEWORK.set_status_error();
      }
    };
  },
  _writeResult : function(msg) {
       parent.postMessage(msg, '*');
  },
  _get_resource_category : function(){
    return FRAMEWORK.RESOURCES[FRAMEWORK.random(FRAMEWORK.RESOURCES.length-1)].accronym
  },

  //List of variables available in the module
  sequences : []

};

/*Define all methods with safe wrapper for Error handling and proper logging.*/
FRAMEWORK.isUsingDynamicValues = FRAMEWORK._makeSafe(FRAMEWORK._isUsingDynamicValues);
FRAMEWORK.set_status_failed = FRAMEWORK._makeSafe(FRAMEWORK._set_status_failed);
FRAMEWORK.set_status_passed = FRAMEWORK._makeSafe(FRAMEWORK._set_status_passed);
// FRAMEWORK._set_status_errored(); //Do not makeSafe this method, it's internal, and to handle error already
FRAMEWORK.test_exit = FRAMEWORK._makeSafe(FRAMEWORK._test_exit);
FRAMEWORK.test_init = FRAMEWORK._makeSafe(FRAMEWORK._test_init);
FRAMEWORK.sequence_init = FRAMEWORK._makeSafe(FRAMEWORK._sequence_init);
FRAMEWORK.sequence_end = FRAMEWORK._makeSafe(FRAMEWORK._sequence_end);
FRAMEWORK.sequence_error = FRAMEWORK._makeSafe(FRAMEWORK._sequence_error);
FRAMEWORK.setVar = FRAMEWORK._makeSafe(FRAMEWORK._setVar);
//FRAMEWORK.log = FRAMEWORK._makeSafe(FRAMEWORK._log);  Do not define. May cause infinite loop.
FRAMEWORK.timeConverter = FRAMEWORK._makeSafe(FRAMEWORK._timeConverter);
FRAMEWORK.random = FRAMEWORK._makeSafe(FRAMEWORK._random);
FRAMEWORK.writeResult = FRAMEWORK._makeSafe(FRAMEWORK._writeResult);
FRAMEWORK.skip_next_testcases = FRAMEWORK._makeSafe(FRAMEWORK._skip_next_testcases);
FRAMEWORK.continue_tests_if = FRAMEWORK._makeSafe(FRAMEWORK._continue_tests_if);
FRAMEWORK.repeatTC_prepareNextIteration = FRAMEWORK._makeSafe(FRAMEWORK._repeatTC_prepareNextIteration);
FRAMEWORK.repeatTC_for = FRAMEWORK._makeSafe(FRAMEWORK._repeatTC_for);
FRAMEWORK.repeatTC_clear = FRAMEWORK._makeSafe(FRAMEWORK._repeatTC_clear);


FRAMEWORK.repeatTC_clear();
FRAMEWORK.INVALID_CHARACTERS = "|!\"/$%?&*()_+¨^>`:.\'±@\\£¢¤¬¦²³¼½¾][}{~´­¯°«»";


