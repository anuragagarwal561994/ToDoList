var addAnItemToList = function(){
	newTask = new Object();
	totalTasks++;
	newTask.id = ++currentId;
	console.log(newTask.id);
	if(newTaskIcon === null)
		newTask.icon = 'fui-new';
	else
		newTask.icon = newTaskIcon;
	newTask.latitude = currentLatitude;
	newTask.longitude = currentLongitude;
	newTask.index = totalTasks;
	newTask.currentProgress = 0;
	newTask.undoneColor = newTaskUnDoneColor;
	newTask.detailColor = newTaskDetailColor;
	newTask.titleColor = newTaskTitleColor;
	newTask.iconColor = newTaskIconColor;
	newTask.title = document.getElementById('title').value;
	newTask.detail = document.getElementById('detail').value;
	if(newTask.title.length===0)
		newTask.title = 'Title';
	if(newTask.detail.length===0)
		newTask.detail = 'Detail';
	addToHTML(newTask);
	addTaskToDatabase(newTask);
	allTasks.push(newTask);
};
var addToHTML = function(newTask){
	var list = $("#to ul");
	list.append('<li>' + '<a class="delete-button" data-role="button" data-icon="delete" data-shadow="false" data-iconshadow="false" data-theme="a" data-iconpos="notext" ></a>' +
						'<span class="todo-icon  ' + newTask.icon + '"></span>' + 
						'<div class="todo-content">' + 
							'<h4 class="todo-name" contenteditable onkeypress="return limitToCharacters(this, 50)">' + newTask.title + '</h4>' + 
							'<span class="current-progress"> ('+ newTask.currentProgress+'%)</span>' + 
							'<p contenteditable onkeypress="return limitToCharacters(this, 200)">' + newTask.detail + '</p>'+
						'</div>'+
					'</li>');
	var currentLi = $('#to ul li:last-child');
	var currentCompressedProgressHTML = $('#to ul li:last-child span.current-progress');
	currentLi.append('<input type="range" name="slider" class="task-progress" value = "'+newTask.currentProgress+'" min="0" max="100" data-highlight="true" data-mini="true" />')
	$("#main").trigger("create");
	$('#task-done').css('width', progress/totalTasks  + "%");
	$('#to ul li:last-child h4').css("color", newTask.titleColor);
	$('#to ul li:last-child p').css("color", newTask.detailColor);
	$('#to ul li:last-child span.todo-icon').css("color", newTask.iconColor);
	$('#to ul li:last-child span.current-progress').css("color", "white");

	currentLi.css("background-color", newTask.undoneColor);
	if(newTask.currentProgress==100){
		currentLi.addClass("todo-done");
		currentLi.css("background-color", "#000");
	}
	$('.task-progress').last().change(function(){
		progress=progress - parseInt(newTask.currentProgress);
		newTask.currentProgress = parseInt($(this).val());
		progress += newTask.currentProgress;
		updateElement(newTask, 'currentProgress', newTask.currentProgress);
		if(totalTasks!==0)   	  
  		  $('#task-done').css('width', progress/totalTasks  + "%");
  	  	else
  		  $('#task-done').css('width',0+ "%");
		if(newTask.currentProgress==100){
			currentLi.addClass("todo-done");
			currentLi.css("background-color", "#000");	
		}
		else{
			currentLi.removeClass("todo-done");
			currentLi.css("background-color", newTask.undoneColor);
		}
		currentCompressedProgressHTML.text("("+newTask.currentProgress+"%)");
	});
	$('.ui-slider').click(function(event){
		event.stopImmediatePropagation();
		removeHighlight();
		currentClickedTask = newTask;
		clicked = event.target;
	});
	var detailHTML = $('#to ul li:last-child p');
	var iconHTML = $('#to ul li:last-child span.todo-icon');
	var sliderInputHTML = $("#to ul li:last-child input");
	var sliderHTML = $("#to ul li:last-child .ui-slider");
	var currentProgressHTML = $('#to ul li:last-child .current-progress')
	$('#to ul li:last-child span.todo-icon').click(function(event){
		event.stopImmediatePropagation();
		currentClickedTask = newTask;
		clicked = event.target;
		removeHighlight();
	});
	
	$('#to ul li:last-child span.todo-icon').on('taphold', function(event){
		$.mobile.changePage("#modify-icon", {

		});
		currentClickedIcon = this;
		collapsed = detailHTML.is(":visible");
		currentClickedTask = newTask;
		currentCollapsedIconChangeHTML = iconHTML;
	});

	$('#to ul li:last-child h4').click(function(event){
		clicked = event.target;
		removeHighlight();
		currentClickedTask = newTask;
		event.stopImmediatePropagation();
	});
	$('#to ul li:last-child p').click(function(event){
		clicked = event.target;
		currentClickedTask = newTask;
		removeHighlight();
		event.stopImmediatePropagation();
	});
	
	$(detailHTML).toggle();
	$(sliderInputHTML).toggle();
	$(sliderHTML).toggle();
	$(iconHTML).toggleClass('collapsed-icon fui-' + newTask.icon);
	$('#to ul li:last-child').click(function(){
		$(detailHTML).toggle();
		$(sliderInputHTML).toggle();
		$(sliderHTML).toggle();
		$(iconHTML).toggleClass('collapsed-icon');
		$(currentProgressHTML).toggle();
	});
	currentLi.on("click", function(event){
		currentClickedTask = newTask;
		removeHighlight();
		clicked = event.target;
		event.stopImmediatePropagation();
	});

	$('#to ul li:last-child .delete-button').click(function(event){
		alert('hi');
		$($(this).parent()).remove();
		progress=progress - newTask.currentProgress;
		totalTasks--;
		if(totalTasks!=0)
			$('#task-done').css('width', progress/totalTasks  + "%");
		else
			$('#task-done').css('width', 0 + "%");
		deleteFromDatabase(newTask.id);
	});
};
var modifyTaskIcon = function(){
	var currentClasses = $(currentClickedIcon).attr('class');
	$(currentClickedIcon).removeClass(currentClasses);
	$(currentClickedIcon).addClass('todo-icon ' + chooseIcon);
	if(collapsed==false)
		$(currentClickedIcon).addClass('collapsed-icon');
	updateElement(currentClickedTask, 'icon', chooseIcon);	
};
