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