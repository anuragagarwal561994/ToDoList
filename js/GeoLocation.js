var map,
    currentPositionMarker,
    mapCenter = new google.maps.LatLng(40.700683, -73.925972),
    markers = new Object(), radius = 1000,
    infowindow = new google.maps.InfoWindow({});
var currentImageIndex = 0;

var currentClickedMarker = null, currentTitle = null;
var photos = ['images/icons/501.png', 'images/icons/502.png', 'images/icons/108.png'];

var markTargets = function (name, p, imagePaths, description) {
    marker = new google.maps.Marker({ 
        position: p,
        map: map,
//        draggable: true,
//        animation: google.maps.Animation.DROP
        title: currentTitle,
        clickable: true
    });
    marker.placeName = name;
    marker.placeDescription = description;
    marker.imagePaths = imagePaths;
    marker.visited = false;
    marker.allMarkerTasks = [];
    id = marker.__gm_id;
    markers[id] = marker;
    addLocationToList(marker);
    google.maps.event.addListener(marker, "click", function(point){
        currentClickedMarker = this;
        var placeName = this.placeName;
        var placeDescription = this.placeDescription;
        if(placeName.length==0)
            placeName = "Place Name";
        if(placeDescription.length==0)
            placeDescription = "Place Description";
        infowindow.setContent('<div id="marker-content"><b><p contenteditable id="place-name" onkeypress="return limitToCharacters(this, 45);">'+placeName+'</p></b>'+
      '<p contenteditable onkeypress="return limitToCharacters(this, 200);" id="place-description">'+placeDescription+'</p></div>');        
        infowindow.open(map,this);
     });
    google.maps.event.addListener(marker, "dblclick", function(point){
        showTasksForMarker(this);
     });
    
    $("#deleteMarker").click(function(){
        delMarker(currentClickedMarker.__gm_id);
        $.mobile.changePage("#map", function(){

        });
    });
}
var showTasksForMarker = function(marker){
    reset();
    $('#main-nav-1').hide();
    $('#main-nav-2').hide();
    $('#main-nav-3').show();
    currentClickedMarker = marker;
    photos = currentClickedMarker.imagePaths.split(",");   
    for(var tasks in currentClickedMarker.allMarkerTasks){
        addToHTML(currentClickedMarker.allMarkerTasks[tasks]);
        progress = progress + parseInt(currentClickedMarker.allMarkerTasks[tasks].currentProgress);
    }
    totalTasks = currentClickedMarker.allMarkerTasks.length;
    markTotalProgress(progress, totalTasks);
    $.mobile.changePage("#main", {
    })
}

var markTotalProgress = function(progress, totalTasks){
    if(totalTasks!==0)        
        $('#task-done').css('width', progress/totalTasks  + "%");
    else
        $('#task-done').css('width',0+ "%");
}
var delMarker = function (id) {
    marker = markers[id]; 
    marker.setMap(null);
    console.log('deleting');
    deleteMarkerPositionFromDatabase(marker.position);
    delete markers[id];
    document.getElementById(marker.position.lat()+"_"+marker.position.lng()).remove();
}

function initializeMap()
{
    map = new google.maps.Map(document.getElementById('map-canvas'), {
       disableDoubleClickZoom: true,
       zoom: 13,
       center: mapCenter,
       mapTypeId: google.maps.MapTypeId.ROADMAP
     });
    google.maps.event.addListener(map, "dblclick", function(event){
        for(var m in markers)
            if(google.maps.geometry.spherical.computeDistanceBetween (markers[m].position, event.latLng)<=2*radius){
                alert("Position too close to another position.");
                return;
            }
        // $("#get-title").click(function(){
        //     currentTitle = $("#place-title").val();
        //     $.mobile.changePage("#map", {});
        //     addMarkerPositionToDatabase(event.latLng);
        //     markTargets(event.latLng);
        // });
        // $.mobile.changePage("#define-place", {
        //     role: "dialog"
        // });
     addMarkerPositionToDatabase("", event.latLng,"","");
     markTargets("",event.latLng,"","");
    });
    
    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    if (db === null) {
          alert("Database could not be opened.");
          return;
    }
    initializeDatabase(db);
    init();
    // clearDatabase();
    var input = (document.getElementById('search-place'));
    var searchBox = new google.maps.places.SearchBox(input); 
    google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      searchMarker = new google.maps.Marker({ 
        position: place.geometry.location,
        title: "Target Location"
      });

      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
    });

    google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
    });

    loadPositionsFromDatabase(function(results){
        loadNonLocationTasks();
        $('#main-nav-2').show();
        $('#main-nav-1').hide();
        $('#main-nav-3').hide();
        for(var i=0;i<results.length;i++){
            currentLoadingMarkerPosition = clone(results[i]);
            markTargets(currentLoadingMarkerPosition.placeName, new google.maps.LatLng(currentLoadingMarkerPosition.latitude, currentLoadingMarkerPosition.longitude),currentLoadingMarkerPosition.imagePaths, currentLoadingMarkerPosition.placeDescription);
        }
        for(var marker in markers)
            loadTasks(markers[marker]);

    });
}
var addLocationToList = function(marker){
    if(marker.placeName.length!=0)
        placeName = marker.placeName;
    else
        placeName = "Undefined";
    if(marker.placeDescription.length!=0)
        placeDescription = marker.placeDescription;
    else
        placeDescription = "Undefined";
    $("#location-list ul").append("<li id='"+marker.position.lat()+'_'+marker.position.lng()+"'><span class='location-place-name'>"+placeName+
    "</span><br><span class='location-place-detail'>"+placeDescription+
    "</span><br><br>Photos: <span class='location-total-photos'>"+(marker.imagePaths.split(',').length-1)+
    "</span><br>Total Tasks: <span class='location-total-tasks'>0"+
    "</span>&#09;Completed Tasks: <span class='location-completed-tasks'>0</span><hr></li>");
    $('#location-list ul li:last-child').on('swipeleft', function(){
        showTasksForMarker(marker);
    });
    $('#location-list ul li:last-child').on('swiperight', function(){
        delMarker(marker.__gm_id);
        $(this).remove();
    });
}
var findMarkerThroughPosition = function(latitude, longitude){
    for(var marker in markers)
        if(markers[marker].position.lat()==latitude&&markers[marker].position.lng()==longitude)
            return markers[marker];
}
var loadNonLocationTasks = function(){
    loadTasksFromDatabase(undefined, undefined, function(results){
        tasks = results;
        for(var i=0;i<tasks.length;i++){
            nonLocationTasks.push(clone(tasks[i]));
            addToHTML(nonLocationTasks[i]);
        }
    });
}
var loadTasks = function(currentMarker){
    loadTasksFromDatabase(currentMarker.position.lat(), currentMarker.position.lng(), function(results){
        tasks = results;
        currentMarker.completedTasksCount=0;
        for(var i=0;i<tasks.length;i++){
            if(tasks[i].currentProgress==100)
                currentMarker.completedTasksCount++;
            currentMarker.allMarkerTasks.push(clone(tasks[i]));
            addToHTML(currentMarker.allMarkerTasks[i]);

        }
        document.getElementById(currentMarker.position.lat()+"_"+currentMarker.position.lng()).getElementsByClassName('location-total-tasks')[0].innerHTML=tasks.length;
        document.getElementById(currentMarker.position.lat()+"_"+currentMarker.position.lng()).getElementsByClassName('location-completed-tasks')[0].innerHTML=currentMarker.completedTasksCount;
    })
}

function locError(error) {
    // the current position could not be located
    alert("The current position could not be found!");
}

function setCurrentPosition(pos) {
    var image = "images/current_position_marker.png";
    currentPositionMarker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
        ),
        title: "Current Position",
        icon: image
    });
    map.panTo(new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
        ));
}

var displayAndWatch = function(position) {
    // set current position
    setCurrentPosition(position);
    // watch position
    watchCurrentPosition();
}
var positionTimer=null;
var watchCurrentPosition = function(){
    positionTimer = navigator.geolocation.watchPosition(
        function (position) {
            setMarkerPosition(
                currentPositionMarker,
                position
            );
        });
}

var setMarkerPosition = function(marker, position) {
    marker.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
       
    for(var m in markers)
        if(google.maps.geometry.spherical.computeDistanceBetween (markers[m].position, marker.position)<=radius&&markers[m].visited===false){
            navigator.notification.vibrate(2000);
            positionTimer = null;
            $.mobile.changePage("#main", {
            
            });
            markers[m].visited = true;
            setTimeout(function(){
                markers[m].visited = false;
            }, 120000);
        }          
}

function initLocationProcedure() {
    initializeMap();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayAndWatch, locError);        
    } else {
        alert("Your browser does not support the Geolocation API");
    }
}
$('#main-nav-1').hide();
$('#main-nav-2').show();
$('#main-nav-3').hide();
$(document).ready(function() {
    initLocationProcedure();
});

$(window).resize(function(){
        $('#map-canvas').css('height', $(window).height() - $('div.ui-header.ui-bar-default').height()-35-$('div.ui-input-search.ui-shadow-inset.ui-btn-corner-all.ui-btn-shadow.ui-icon-searchfield.ui-body-c').height());
    $('#maincontent').css('height', $(window).height() - parseInt($('#main-header').css('height'))-2- parseInt($('#footer').css('height')));
    $('#set-location-content').css('height', $(window).height() - parseInt($("#set-location-header").css('height')) - parseInt($("#set-location-footer").css('height')))
    $('#location-list').css('height', $(window).height()-parseInt($('#locations-header').css('height')));
});
$('#map').on('pageshow', function(event){
    $('#map-canvas').css('height', $(window).height() - $('div.ui-header.ui-bar-default').height()-35-$('div.ui-input-search.ui-shadow-inset.ui-btn-corner-all.ui-btn-shadow.ui-icon-searchfield.ui-body-c').height());
    google.maps.event.trigger(map, "resize");
})
$(document).on('pagechange', function(){
    $('#maincontent').css('height', $(window).height() - parseInt($('#main-header').css('height'))-2- parseInt($('#footer').css('height')));
    $('#set-location-content').css('height', $(window).height() - parseInt($("#set-location-header").css('height')) - parseInt($("#set-location-footer").css('height')));
    $('#location-list').css('height', $(window).height()-parseInt($('#locations-header').css('height')));
    currentImageIndex = 0;
    if(photos.length==0)
        $('#image-location').attr('src', 'images/icons/108.png');
    else
        $('#image-location').attr('src', photos[0]);
    $('#error-message').hide();
});
$(document).bind("mobileinit", function() {
  $.support.touchOverflow = true;
  $.mobile.touchOverflowEnabled = true;
});

var addImage = function(mode){
    tizen.application.launchAppControl(mode==true?fileManagerAppControl:cameraAppControl, null, 
        function(){console.log("launch appControl succeeded");},
        function(e){console.log("launch appControl failed. Reason: " + e.name);},
        imageAppControlReplyCB);
}
var fileManagerAppControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/pick", null, "image/*", null, [new tizen.ApplicationControlData("http://tizen.org/appcontrol/data/selection_mode",["multiple"])]);
var cameraAppControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/create_content", null, "image/*", null, [new tizen.ApplicationControlData("http://tizen.org/appcontrol/data/camera/allow_switch",["false"])]);
var imageAppControlReplyCB = {
    onsuccess: function(data) {
        for (var i=0; i < data.length; i++) {
            if(data[i].key == "http://tizen.org/appcontrol/data/selected") {
                console.log("Stored at: " + data[i].value[0]);
                $('#image-location').attr('src', data[i].value[0]);
                currentImageIndex = photos.length;
                for(var j=0;j<data[i].value.length;j++)
                    photos.push(data[i].value[j]);
                $('#error-message').hide();
                updateLocationData(currentClickedMarker.position.lat(), currentClickedMarker.position.lng(), "imagePaths", photos);
                currentClickedMarker.imagePaths = photos.join();
                document.getElementById(currentClickedMarker.position.lat()+"_"+currentClickedMarker.position.lng()).getElementsByClassName('location-total-photos')[0].innerHTML=photos.length;
            }
        }
    },
    onfailure: function() {
        console.log('Service returned with failure');
    }
};
function deleteImage(){
    if(photos.length!=0){
        photos.splice(currentImageIndex, 1);
        if(currentImageIndex>0&&currentImageIndex==photos.length)
            currentImageIndex = (currentImageIndex+1)%(photos.length+1);
        updateLocationData(currentClickedMarker.position.lat(), currentClickedMarker.position.lng(), "imagePaths", photos);
    }
    if(photos.length==0)
        $('#image-location').attr('src', 'images/icons/108.png');
    else
        $('#image-location').attr('src', photos[currentImageIndex]);    
    $('#error-message').hide();
    currentClickedMarker.imagePaths = photos.join();
    document.getElementById(currentClickedMarker.position.lat()+"_"+currentClickedMarker.position.lng()).getElementsByClassName('location-total-photos')[0].innerHTML=photos.length;
}
function forward(){
    if(photos.length>1){
        currentImageIndex = (currentImageIndex + 1)%photos.length;
        $('#image-location').attr('src', photos[currentImageIndex]);
        $('#error-message').hide();
    }
}
function backward(){
    if(photos.length>1){
        if(currentImageIndex>0)
            currentImageIndex = currentImageIndex-1;
        else if(currentImageIndex==0)
            currentImageIndex = photos.length - 1;
        $('#image-location').attr('src', photos[currentImageIndex]);
        $('#error-message').hide();
    }
}
function onImageNotFound(){
    $('#image-location').attr('src', 'images/icons/55.png');
    document.getElementById('error-message').innerHTML = photos[currentImageIndex] + ' not found!!!';
    $('#error-message').show();
}
function loadAllTasks(mode){
    reset();
    totalTasks = nonLocationTasks.length;
    for(var taskIndex in nonLocationTasks){
        addToHTML(nonLocationTasks[taskIndex]);
        progress = progress + parseInt(nonLocationTasks[taskIndex].currentProgress);
    }
    if(mode==true){
        for(var marker in markers){
            for(var taskIndex in markers[marker].allMarkerTasks){
                addToHTML(markers[marker].allMarkerTasks[taskIndex]);
                progress = progress + parseInt(markers[marker].allMarkerTasks[taskIndex].currentProgress);
            }
            totalTasks = totalTasks + markers[marker].allMarkerTasks.length;
        }    
        $('#main-nav-1').hide();
        $('#main-nav-2').show();
        $('#main-nav-3').hide();
    }
    else{
        $('#main-nav-2').hide();
        $('#main-nav-1').show();
        $('#main-nav-3').hide();
    }
    markTotalProgress(progress, totalTasks);
    $.mobile.changePage("#main", {
    });
}