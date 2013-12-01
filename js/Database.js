    var currentDatabase;
    var initializeDatabase = function(db){
    	currentDatabase = db;
    	currentDatabase.transaction(function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS TODO (id unique,icon, title, detail, currentProgress, iconColor, titleColor, detailColor, undoneColor, latitude, longitude)', [],
                 function(tx,results) { console.log("Created table TODO"); },
                 function(tx,err) { alert("Error creating table TODO: "+err.message); });
            tx.executeSql('CREATE TABLE IF NOT EXISTS LOCATIONS (placeName, latitude, longitude, imagePaths, placeDescription)', [],
                    function(tx,results) { console.log("Created table LOCATIONS"); },
                    function(tx,err) { alert("Error creating table LOCATIONS: "+err.message); });
        }, errorCB);
    	
    }
    
    var errorCB = function(err){
        alert("Error processing SQL: "+err.code);
    }
    
    var addTaskToDatabase = function(task){
    	currentDatabase.transaction(function(tx){
    		tx.executeSql('INSERT INTO TODO VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [task.id, task.icon, task.title, task.detail, task.currentProgress, task.iconColor, task.titleColor, task.detailColor, task.undoneColor, task.latitude, task.longitude],
                  function(tx,results) { console.log("Inserted current task in the database"); },
                  function(tx,err) { alert("Error adding task to the database: "+err.message); });
             console.log("Data written to TODO table.");
    	}, errorCB);
    };
    var clearDatabase = function(){
    	currentDatabase.transaction(function(tx){
    		tx.executeSql('DROP TABLE TODO',[],
                  function(tx,results) { console.log("TODO Table Dropped"); },
                  function(tx,err) { alert("Error dropping the database: "+err.message); });
    		tx.executeSql('CREATE TABLE IF NOT EXISTS TODO (id unique,icon, title, detail, currentProgress, iconColor, titleColor, detailColor, undoneColor, latitude, longitude)', [],
                    function(tx,results) { console.log("Created table TODO"); },
                    function(tx,err) { alert("Error creating table TODO: "+err.message); });
    		tx.executeSql('DROP TABLE LOCATIONS',[],
                    function(tx,results) { console.log("TODO Table Dropped"); },
                    function(tx,err) { alert("Error dropping the database: "+err.message); });
    		tx.executeSql('CREATE TABLE IF NOT EXISTS LOCATIONS (placeName, latitude, longitude, imagePaths, placeDescription)', [],
                     function(tx,results) { console.log("Created table LOCATIONS"); },
                     function(tx,err) { alert("Error creating table LOCATIONS: "+err.message); });
    	}, errorCB);
    }  

    var countTasks = function(callback){
        currentDatabase.transaction(function(tx){
            tx.executeSql('SELECT MAX(id) AS max FROM TODO',[],
                  function(tx,results) { callback(results.rows.item(0).max);},
                  function(tx,err) { alert("Error dropping the database: "+err.message); });
        }, errorCB);
    }
    
    var addMarkerPositionToDatabase = function(placeName, newMarker, imagePaths, placeDescription){
    	currentDatabase.transaction(function(tx){
    		tx.executeSql('INSERT INTO LOCATIONS (placeName, latitude, longitude, imagePaths, placeDescription) VALUES (?, ?, ?, ?, ?)', [placeName, newMarker.lat(), newMarker.lng(), imagePaths, placeDescription],
                  function(tx,results) { console.log("Inserted current marker in the database"); },
                  function(tx,err) { alert("Error adding current position to the database: "+err.message); });
             console.log("Data written to LOCATIONS table.");
    	}, errorCB);
    };
    var deleteMarkerPositionFromDatabase = function(marker){
    	currentDatabase.transaction(function(tx){
    		tx.executeSql('DELETE FROM LOCATIONS WHERE latitude=? AND longitude=?', [marker.lat(), marker.lng()],
                  function(tx,results) { console.log("Deleted marker from the database"); },
                  function(tx,err) { alert("Error deleting marker: "+err.message); });
            tx.executeSql('DELETE FROM TODO WHERE latitude=? AND longitude=?', [marker.lat(), marker.lng()],
                  function(tx,results) { console.log("Deleted tasks from the corresponding position"); },
                  function(tx,err) { alert("Error deleting tasks from the corresponding position: "+err.message); });
    	}, errorCB);
    }


    var loadTasksFromDatabase = function(latitude, longitude, callback){
    	console.log(latitude);
    	console.log(longitude);
    	currentDatabase.transaction(function(tx) {
    	   tx.executeSql('SELECT * FROM TODO WHERE latitude=? AND longitude=?', [latitude, longitude], querySuccess, errorCB);
    	},errorCB);
    	
    	 function querySuccess(tx, results) {    
            var len = results.rows.length;
            var listOfTasks = [];
            console.log("TODO table: " + len + " rows found.");
            for(var i=0;i<len;i++){
           	    listOfTasks.push(results.rows.item(i));
            	console.log(results.rows.item(i));
            }
            
            callback(listOfTasks);
            console.log("Data read from the TODO table");
        }
    }
    var loadPositionsFromDatabase = function(callback){
    	currentDatabase.transaction(function(tx) {
    	   tx.executeSql('SELECT * FROM LOCATIONS', [], querySuccess, errorCB);
    	},errorCB);
    	
    	 function querySuccess(tx, results) {    
            var len = results.rows.length;
            var listOfPositions = [];
            console.log("LOCATIONS table: " + len + " rows found.");
            for(var i=0;i<len;i++)
            	listOfPositions.push(results.rows.item(i));
            
            callback(listOfPositions);
            console.log("Data read from the LOCATIONS table");
        }
    }
    var updateLocationData = function(latitude, longitude, property, newValue){
      currentDatabase.transaction(function(tx){
        tx.executeSql("UPDATE LOCATIONS SET "+property+"=? WHERE latitude=? AND longitude=?",[newValue, latitude, longitude],
                  function(tx,results) { console.log(property + " Modified"); },
                  function(tx,err) { alert("Error modifying "+property+": "+err.message); });
      }, errorCB);
    }
    var updateElement = function(task, property, newValue){
    	currentDatabase.transaction(function(tx){
    		tx.executeSql("UPDATE TODO SET "+property+"=? WHERE id=?",[newValue, task.id],
                  function(tx,results) { console.log(property + "Modified"); },
                  function(tx,err) { alert("Error modifying "+property+": "+err.message); });
    	}, errorCB);
    };
    var deleteFromDatabase = function(id){
    	currentDatabase.transaction(function(tx){
    		tx.executeSql("DELETE FROM TODO WHERE id=?",[id],
                  function(tx,results) { "Task Deleted Successfully" },
                  function(tx,err) { alert("Task can not be Deleted!!") });
    	}, errorCB);
    }