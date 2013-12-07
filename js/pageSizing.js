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
$('#add-task').on('pageshow', function(event){
    initializeAddTask();
});
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