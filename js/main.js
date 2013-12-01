var chooseIcon;
var newTaskIcon = null;
var icons = ['cmd', 'heart', 'location', 'check', 'cross', 'list', 'new', 'video', 'photo', 'volume', 'time', 'eye', 'chat', 'search', 'user', 'mail', 'lock', 'gear', 'calender-solid'];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7'];
var currentClickedIcon = null;
var currentTaskColor = '#34495e';
var colorChangeElement = '#undone-color';
var newTaskIconColor = '#1abc9c';
var newTaskUnDoneColor = '#34495e';
var newTaskTitleColor = "white";
var newTaskDetailColor = "#798795";
var sliderClasses=0;
var progress=0;
var totalTasks=0;
var toBeModifiedTask=-1;
var currentClickedTitle = null;
var modifiedColor = null;
var currentClickedDetail = null;
var currentClickedUndoneTask = null;
var collapsed = null;
var clicked = null;
var currentClickedTask = null;
var colorPatches = [];
var init = function () {
//	document.addEventListener("deviceready", onDeviceReady, false);
//    function onDeviceReady() {
//           
//    }
		document.addEventListener('keydown', function (event) {
		  var el = event.target;
		  if (el.nodeName != 'INPUT' && el.nodeName != 'TEXTAREA') {
		    if (event.which == 27) {
		      document.execCommand('undo');
		      el.blur();
		    } else if (event.which == 13) {
		      if(clicked!=null){
		      	if(el.innerHTML.length == 0 || el.innerHTML == "<br>")
			      	if(clicked.tagName=="H4")
			      		clicked.innerHTML = "Title"
			      	else if(clicked.tagName=="P")
			      		clicked.innerHTML = "Detail"
		      	else
		      		clicked.innerHTML = el.innerHTML;
		      	if(clicked.tagName=="H4"){
		      		currentClickedTask.title = clicked.innerHTML;
		      		updateElement(currentClickedTask, 'title', clicked.innerHTML);	
		      	}
		      	else if(clicked.tagName=="P"){
			      	currentClickedTask.detail = clicked.innerHTML;
		      		updateElement(currentClickedTask, 'detail', clicked.innerHTML);		
		      	}	
		      }
		      else{
		      	if(el.nodeName=="H1"){
		      		if(el.innerHTML.length==0){
		      			el.innerHTML = "Place Name"
		      			currentClickedMarker.placeName = "";
		      		}
		      		else
		      			currentClickedMarker.placeName = el.innerHTML;
		      		updateLocationData(currentClickedMarker.position.lat(), currentClickedMarker.position.lng(), "placeName", currentClickedMarker.placeName);
		      	}
		      	else if(el.nodeName=="P"){
		      		if(el.innerHTML.length==0){
		      			el.innerHTML = "Place Description"
		      			currentClickedMarker.placeDescription = "";
		      		}
		      		else
		      			currentClickedMarker.placeDescription = el.innerHTML;
		      		updateLocationData(currentClickedMarker.position.lat(), currentClickedMarker.position.lng(), "placeDescription", currentClickedMarker.placeDescription);
		      	}
		      }
		      el.blur();
		      event.preventDefault();
		    }
		  }
		}, true);


	  $('.color-patch').css("border", "3px solid red");
	  $(".color-panel").toggle();
	  $('#change-view').click(function(){
	  	if($(this).attr('data-icon')=='arrow-r'){
	  		$(this).attr('data-icon', 'arrow-l');
	  		$(this).find('.ui-icon').removeClass('ui-icon-arrow-r').addClass('ui-icon-arrow-l');	
	  	}
	  	else{
	  		$(this).attr('data-icon', 'arrow-r');
	  		$(this).find('.ui-icon').removeClass('ui-icon-arrow-l').addClass('ui-icon-arrow-r');
	  	}
	  	$(".color-panel").toggle();
	  	$('#progress-bar').toggle();
	  });

	  document.addEventListener("click", function(){
	  	clicked = null;
	  	removeHighlight();
	  });

	  for(var i=0;i<icons.length;i++)
		  $('#icons').append('<span class="icon pad-between-icons fui-'+icons[i]+'"></span>');
	  
	  $('#add-task').click(function(){
		 colorChangeElement = '#undone-color';
		 removeHighlight();
		 $("#add-task h1 span").replaceWith("<span>Undone</span>");
	  });
	  
	  $('#icons span').click(function(event){
		 event.stopPropagation();
		 removeHighlight();
		 colorChangeElement = "#icons span";
		 $("#add-task h1 span").replaceWith("<span>Icons</span>");
	  });	  
	  $('.icon').click(function(){
		  $('.icon').removeClass("clickedIcon");
		  removeHighlight();
		  $(this).addClass("clickedIcon");
	  });
	  
	  $('#title').click(function(event){
		 event.stopPropagation();
		 removeHighlight();
		 colorChangeElement = "#title";
		 $("#add-task h1 span").replaceWith("<span>Title</span>");
	  });
	  $('#detail').click(function(event){
			 event.stopPropagation();
			 removeHighlight();
			 colorChangeElement = "#detail";
			 $("#add-task h1 span").replaceWith("<span>Detail</span>");
	  });
	  
	  $('#icons span.fui-new').addClass("clickedIcon");
	  
	  for(var i=0;i<icons.length;i++)
		  $('#link-icons').append('<a href="#main" onclick="modifyTaskIcon();"><span class="pad-between-icons fui-' + icons[i] + '"></span></a>');
	 
		for(var i=0;i<colors.length;i++){
		  $('.color-patches.color-panel').append('<div class="color-patch"></div>');
		  $('.color-patch:last-child').css("background-color", colors[i]);
		  colorPatches.push($('.color-patch:last-child'));
		  $('.color-patch:last-child').click(function(event){
			 event.stopImmediatePropagation();
			 removeHighlight(this);
			 if(clicked.tagName == "LI")
			 	$(clicked).css("background-color", $(this).css("background-color"));
			 else if(clicked.tagName == "DIV")
			 	$($(clicked).parent().get(0)).css("background-color", $(this).css("background-color"));
			 else
			 	$(clicked).css("color", $(this).css("background-color"));
			 if(clicked.tagName=="LI" || clicked.tagName == "DIV"){
			 	currentClickedTask.undoneColor = $(this).css("background-color");
			 	updateElement(currentClickedTask, "undoneColor", $(this).css("background-color"));
			 }
			 else if(clicked.tagName=="H4"){
			 	currentClickedTask.titleColor = $(this).css("background-color");
			 	updateElement(currentClickedTask, "titleColor", $(this).css("background-color"));
			 }
			 else if(clicked.tagName=="P"){
			 	currentClickedTask.detailColor = $(this).css("background-color");
			 	updateElement(currentClickedTask, "detailColor", $(this).css("background-color"));
			 }
			 else if(clicked.tagName=="SPAN"){
			 		currentClickedTask.iconColor = $(this).css("background-color");
			 		updateElement(currentClickedTask, "iconColor", $(this).css("background-color"));
			 }
			 else{
			 	currentClickedTask.inputSliderColor = $(this).css("background-color");
			 	updateElement(currentClickedTask, "inputSliderColor", $(this).css("background-color"));
			 }
		  });
	  }


	  for(var i=0;i<colors.length;i++){
		  $('.color-patches.add').append('<div class="color-patch"></div>');
		  $('.color-patch:last-child').css("background-color", colors[i]);
		  colorPatches.push($('.color-patch:last-child'));
		  $('.color-patch:last-child').click(function(event){
		  	 event.stopImmediatePropagation();
		  	 removeHighlight(this);
			 if(colorChangeElement==="#icons span" || colorChangeElement === "#title" || colorChangeElement === "#detail"){
				 $(colorChangeElement).css("color", $(this).css("background-color"));
				 if(colorChangeElement==="#icons span")
					 newTaskIconColor = $(this).css("background-color");
				 else if(colorChangeElement==="#title")
					 newTaskTitleColor = $(this).css("background-color");
				 else
					 newTaskDetailColor = $(this).css("background-color");
			 }
			 else{
				 $(colorChangeElement).css("background-color", $(this).css("background-color"));
				 newTaskUnDoneColor  = $(this).css("background-color");
			 }
			 $(this).css("border", "3px solid black");
		  });
	  }
	  
	  $('#modify-icon span').click(function(event) {
		  for(var i=0;i<icons.length;i++){
			  if($(event.target).is('.fui-' + icons[i])){
				  chooseIcon = 'fui-' + icons[i];
				  break;
			  }
		  }
		});
	  
	  $('#add-task span').click(function(){
		  for(var i=0;i<icons.length;i++){
			  if($(event.target).is('.fui-' + icons[i])){
				  newTaskIcon = 'fui-' + icons[i];
				  break;
			  }
		  }
	  });
};
var removeHighlight = function(patch){
	for(var j=0;j<colorPatches.length;j++)
	 	colorPatches[j].css("border", "0px");
}
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
};
var reset = function(){
	$('#to ul').empty();
	chooseIcon = null;
	newTaskIcon = null;
	currentClickedIcon = null;
	currentTaskColor = '#34495e';
	colorChangeElement = '#undone-color';
	newTaskIconColor = '#1abc9c';
	newTaskUnDoneColor = '#34495e';
	newTaskTitleColor = "white";
	newTaskDetailColor = "#798795";
	sliderClasses=0;
	progress=0;
	totalTasks=0;
	toBeModifiedTask=-1;
	currentClickedTitle = null;
	modifiedColor = null;
	currentClickedDetail = null;
	currentClickedUndoneTask = null;
	collapsed=null;
}
function limitToCharacters(element,limit,evt){
	if(element.innerHTML.length>limit){
		alert("Can't Exceed "+limit+" characters");
		return false;
	}
	return true;
};
var showAllLocations = function(){
	$('#location-list ul').empty();
	for(var marker in markers)
		$("#location-list ul").append("<li>"+markers[marker].placeName+"<hr></li>");
	$("#location-list").trigger("create");
}