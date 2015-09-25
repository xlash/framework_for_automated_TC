/*-------------------------------------------------------------------------
   * Postman framework for automatic testing. This is the server-side framework
   *
   * AUTHORS
   *  - Guillaume Nourry-Marquis
   * DEPENDENCIES
   *  - None
   *
   *
   * VERSION HISTORY
   *  - 0.1 - 2015-09-15 - First release
   *-------------------------------------------------------------------------/*/

//console.log("PARENT requester.html listening::");

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
tc_total=0
tc_success_total=0
cat_results={}
results=[]
win_id = 'results_window'+FRAMEWORK.random(99);
// Listen to message from child window
chrome.app.window.create('results.html',{id: win_id},
	function(appWin) {
	    var pageWindow = appWin.contentWindow;
	    var pageDocument = pageWindow.document;

	    pageWindow.addEventListener('load',function() {
	        loaded_window();
	    },false);
	}
);
function loaded_window(){
	result_window_DOM=chrome.app.window.get(win_id).contentWindow.document; //Because it's not defined, it's a GLOBAL variable
	result_window_DOM.getElementById("save_as_btn").addEventListener("click", saveAs_Handler);
	result_window_DOM.getElementById("clear_btn").addEventListener("click", clear_Handler);
};


//reporting_window.innerHTML = "TESTTTTTTTTTTTTTTTTTTTTTTTTTT";
eventer(messageEvent,function(e) {
	if (Object.keys(e.data).indexOf('TestCaseID')!=-1){
	    //console.log("PARENT requester.html listening::"+e.data);
		results_table= result_window_DOM.getElementById('results');
		var row_id=Math.floor((Math.random() * 99999999999999) + 1);
		var tc_success=true;
		var row=results_table.insertRow(1);  //0 = Header Line 1 is new line, line i+1 to e.data.sequences.length+1 = different validations rows
		row.setAttribute("id","tr_"+row_id,0);
		row.setAttribute("class","tr_testcase",0);
		row.setAttribute("style","border-style: solid;border-width: 15px;");
		var cell14 = row.insertCell(0);
		var cell13 = row.insertCell(0);
		var cell12 = row.insertCell(0);
		var cell11 = row.insertCell(0);
		var cell10 = row.insertCell(0);
		var cell9 = row.insertCell(0);
		var cell8 = row.insertCell(0);
		var cell7 = row.insertCell(0);
		var cell6 = row.insertCell(0);
		var cell5 = row.insertCell(0);
		var cell4 = row.insertCell(0);
		var cell3 = row.insertCell(0);
		var cell2 = row.insertCell(0);
		var cell1 = row.insertCell(0);
		cell1.innerHTML = e.data.categories;
		cell2.innerHTML = e.data.TestCaseID + '</br></br><input type="button" id="'+row_id+'" value="Delete" />';
		cell3.innerHTML = "Result";
		cell4.innerHTML = e.data.description;
		cell5.innerHTML = "Start time";
		cell6.innerHTML = "End time";
		//cell7.innerHTML = "Seq #";
		//cell8.innerHTML = "Name";
		//cell9.innerHTML = "SEQ_STATUS";
		//cell10.innerHTML = "Validation results";
		//cell11.innerHTML = "Request";
		//cell12.innerHTML = "Request Timestamp";
		//cell13.innerHTML = "Response";
		//cell14.innerHTML = "Response Timestamp";
		//Xlash911 20150911 No inline javascript is permitted in Chrome App. and no alternative options are available but adding listener. http://stackoverflow.com/questions/13591983/onclick-within-chrome-extension-not-working
        result_window_DOM.getElementById(row_id).addEventListener("click", deleteSelectedRows_Handler);

		cell1.rowSpan = e.data.sequences.length ;
		cell2.rowSpan = e.data.sequences.length ;
		cell3.rowSpan = e.data.sequences.length ;
		cell4.rowSpan = e.data.sequences.length ;
		cell5.rowSpan = e.data.sequences.length ;
		cell6.rowSpan = e.data.sequences.length ;
		cell7.rowSpan = 1 ;
		cell8.rowSpan = 1 ;
		cell9.rowSpan = 1 ;
		cell10.rowSpan = 1 ;
		cell11.rowSpan = 1 ;
		cell12.rowSpan = 1 ;
		cell13.rowSpan = 1 ;
		cell14.rowSpan = 1 ;



		for(i=0;i<e.data.sequences.length;i++){
			seq = e.data.sequences[i]
			if (i==0){
				seqcell1 = cell7;
				seqcell2 = cell8;
				seqcell3 = cell9;
				seqcell4 = cell10;
				seqcell5 = cell11;
				seqcell6 = cell12;
				seqcell7 = cell13;
				seqcell8 = cell14;
			}else {
				var seq_row=results_table.insertRow(i+1); //0 = Header Line 1 is new line, line i+1 to e.data.sequences.length+1 = different validations rows
				var seqcell8 = seq_row.insertCell(0);
				var seqcell7 = seq_row.insertCell(0);
				var seqcell6 = seq_row.insertCell(0);
				var seqcell5 = seq_row.insertCell(0);
				var seqcell4 = seq_row.insertCell(0);
				var seqcell3 = seq_row.insertCell(0);
				var seqcell2 = seq_row.insertCell(0);
				var seqcell1 = seq_row.insertCell(0);
			}
			seqcell1.innerHTML = i;
			seqcell2.innerHTML = seq.NAME;			
			seqcell3.innerHTML = seq.STATUS;
			seqcell5.innerHTML = seq.request;
			seqcell6.innerHTML = seq.request_timestamp;
			seqcell7.innerHTML = seq.response;
			seqcell8.innerHTML = seq.response_timestamp;
			//Verify validation status
			var seq_success=true;
			for (var key in seq.validations) {
			  if (seq.validations.hasOwnProperty(key)) {
			    if (seq.validations[key]===false){
					seq_success=false
					tc_success=false
				}
			  }
			}
			seqcell4.innerHTML = seq_success + "</br></br>" + JSON.stringify(seq.validations, null, 4);
			if (seq.STATUS=='SKIPPED'){tc_success=false; seqcell4.style.backgroundColor='gray';}
			else if (seq.STATUS=='FAILED' || seq.STATUS=='ERROR'){tc_success=false; seqcell4.style.backgroundColor='red';}
			else if (seq_success){seqcell4.style.backgroundColor='green';}
			else {seqcell4.style.backgroundColor='red';}
		}
		cell3.innerHTML = tc_success;
		
		if (tc_success){cell3.style.backgroundColor='green';}
		else {cell3.style.backgroundColor='red';}
		e.data.tc_success=tc_success;
		e.data.table_row_id=row_id

		//End of new result publishing. Keep at bottom of method
	    results.push(e.data)
		print_stats_table();
	}
},false);

function print_stats_table(){
	tb_stats = result_window_DOM.getElementById('tb_stats')
	tc_total=0
	tc_success_total=0
	//Initial cleanup
	for (var category in cat_results) {
   		if (cat_results.hasOwnProperty(category)) {
	    	result_window_DOM.getElementById('row_'+category).remove();
	    }
	}
	cat_results={}
	//End cleanup

	//Compute overall stats
    for(j=0;j<results.length;j++){
		tc_total+=1;
		if(results[j].tc_success){tc_success_total+=1}
	}
	//Update total tests Statistics
	tb_stats.deleteRow(0);
	row=tb_stats.insertRow(0);
	cell=row.insertCell(0);
	cell.innerHTML = tc_success_total + " / " + tc_total
	cell=row.insertCell(0);
	cell.innerHTML = " Total : "

    //Compute category stats table
	cat_results={}
    for(j=0;j<results.length;j++){
		//For each categories, display statistics
		for (i=0;i<results[j].categories.length;i++){
			category = results[j].categories[i]
			//If first time we are logging statistics for this category
			if (!cat_results.hasOwnProperty(category)){ 
				cat_results[category] = {'success_total':0,'total':0}
			}
			cat_results[category].total+=1;
			if (results[j].tc_success){cat_results[category].success_total +=1;}
		}

    }
    //Print category table
    for (var category in cat_results) {
   		if (cat_results.hasOwnProperty(category)) {
	    	row=tb_stats.insertRow(1);
			row.setAttribute('id','row_'+category)
			cell=row.insertCell(0);
			cell.innerHTML = cat_results[category].success_total + " / " + cat_results[category].total
			if (cat_results[category].success_total == cat_results[category].total & cat_results[category].total != 0 ){cell.style.backgroundColor='green'}
			else if (cat_results[category].total != 0) {cell.style.backgroundColor='red';}
			else  {cell.style.backgroundColor='gray';}

			cell=row.insertCell(0);
			cell.innerHTML = category
		}
	}
	
	//End Statistics
}
function deleteSelectedRows_Handler(e) {
	var id = "tr_" + e.currentTarget.id
	setTimeout(function() {
    	deleteSelectedRows(id);
	}, 500);
}
function saveAs_Handler(e) {
    saveFile('Postman_sessionlogs_'+FRAMEWORK.timeConverter(false)+'.html','<html>'+result_window_DOM.getElementById('popup_window').innerHTML+'</html>');
}
function clear_Handler(e) {
    clear_results();
}

//CLIENT-SIDE-JS
//http://stackoverflow.com/questions/15487014/removing-mulitple-selected-rows-with-rowspan
function deleteSelectedRows(id) {    
	var table = result_window_DOM.getElementById('results');
 	var row = result_window_DOM.getElementById(id);
 	var rowIndex = row.rowIndex;
  	var rowSpan = row.cells[0].rowSpan;
  	rowIndex=rowIndex+rowSpan-1; //Min rowspan is 1.             
    for(var j=0; j<rowSpan; j++) {       
	    table.deleteRow(rowIndex); //delete the selected rows  . 
	    rowIndex--; 
	}
	//Delete result object
    for(j=0;j<results.length;j++){
		if("tr_"+results[j].table_row_id==id){results.removeAt(j)}
	}
	print_stats_table();
}
function clear_results() {    
	var table = result_window_DOM.getElementById('results');           
    for(var j=table.rows.length-1; j>0; j--) {       
	    table.deleteRow(j); //delete the selected rows  . 
	}
	results=[];
	print_stats_table();
}

function _errorHandler(e) {
	var msg = '';

	switch (e.code) {
	  case FileError.QUOTA_EXCEEDED_ERR:
	    msg = 'QUOTA_EXCEEDED_ERR';
	    break;
	  case FileError.NOT_FOUND_ERR:
	    msg = 'NOT_FOUND_ERR';
	    break;
	  case FileError.SECURITY_ERR:
	    msg = 'SECURITY_ERR';
	    break;
	  case FileError.INVALID_MODIFICATION_ERR:
	    msg = 'INVALID_MODIFICATION_ERR';
	    break;
	  case FileError.INVALID_STATE_ERR:
	    msg = 'INVALID_STATE_ERR';
	    break;
	  default:
	    msg = 'Unknown Error';
	    break;
	};

	console.log('ErrorHandler: ' + msg);
}
// Request a FileSystem and set the filesystem variable.
function initFileSystem() {
  navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 5,
    function(grantedSize) {
      // Request a file system with the new size.
      window.requestFileSystem(window.PERSISTENT, grantedSize, function(fs) {
        // Set the filesystem variable.
        filesystem = fs;
      }, _errorHandler);

    }, _errorHandler);
}
initFileSystem();

var _entry=null;
function saveFile(filename, source) {
	//Careful, incorrect filename will crash silently
    chrome.fileSystem.chooseEntry({type: 'saveFile',suggestedName: filename}, function(writableFileEntry) {
	    writableFileEntry.createWriter(function(writer) {
	      writer.onerror = _errorHandler;
	      writer.onwriteend = function(e) {
	        console.log('write complete');
	      };
	      writer.write(new Blob([source], {type: 'text/plain'}));
	    }, _errorHandler);
	});

  };
