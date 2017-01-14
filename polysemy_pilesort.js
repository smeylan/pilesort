/*************************************
   firebase references
 *************************************/
var ref = new Firebase("https://brilliant-heat-3296.firebaseio.com/polysemy_pilesort");
//var ref = firebase.database().ref().child("polysemy_pilesort");
var userRef = ref.child("subjectInfo");
var IPuserRef = ref.child("subjectByIP");
var workerIDuserRef = ref.child("subjectByWorkerID");
var stimuliRef = ref.child("inputs");
var trialRef = ref.child("trials");
var thisUserRef;
var userID; //unique hash from firebase
var userIP;
var workerID=getParamFromURL("workerID"); //amazon worker id
var userExists;

/*************************************
   input variables
 *************************************/
var totalTrials = 6;
var currentIndex = 0; //index of current trial. will start indexing at 1, once newTrial() is called.
var sentenceIndex = 0;
//var sorted = range(1, totalTrials); //int list starting at 1, with length=totalTrials
//var stimuliIndices = shuffle(sorted);
//var wordSpace = ["chicken", "shower"]; //list of possible words, in alphabetical order
//var wordList = shuffle(wordSpace).slice(0,totalTrials); //list of stimuli words for this participant
//var wordList = ["cell", "figure", "foot", "form", "girl", "home", "paper", "table"];
var totalWordList = ['case','church','family','feet','question','time'] 
var wordList = shuffle(totalWordList).slice(0,totalTrials);
var stimuli; //stimuli objects associated with current word
var sentenceKeys = []; //randomized list of sentence keys for current word
var trialSize = 12; //max number of sentences in each trial
var colorlist = ["#C4E17F", "#DB9DBE", "#FECF71", "#F0776C", "#F7FDCA", "#669AE1", "#C49CDE", "#62C2E4"];
var lastClicked;

/*************************************
    main
 *************************************/
$(document).ready ( function(){
//     $("#consent").html(consentHTML);
//
    var w = window.innerWidth;
    if(w >= 800) {
        $(".start-entered").css("left", (w-800)/2);
    }
    //TODO?: add warning when browser window too small?
    
    //get user info
    getSubjectInfo();
//
//         
    //newTrial();
    $("#agree").click(function(){
        $("#consent").addClass("hidden");
        $("#experiment").removeClass("hidden");
        newTrial();
    });

    $("#decline").click(function(){
        $("#consent").addClass("hidden");
        $("#declinedExperiment").removeClass("hidden");
    });

    $("#next").click(function(){
            sentenceIndex += 1;
            dropOneSentence();
    })


    $("#submit").click(function() {
        recordTrial();
        //newTrial();
        
        if(currentIndex <= totalTrials-1){
            newTrial();
        } else {
            thisUserRef.update({ completed: 1 });
            $("#experiment").addClass("hidden");
            $("#finishedExperiment").removeClass("hidden");
            return;
        }
    })


})


/*************************************
    helper functions called in main
 *************************************/
//main trial function; each trial corresponds to one word
function newTrial() {
    // var w = window.innerWidth;
    // var h = window.innerHeight;
    // if(w>915 && h>550){
    //     $("#warning").addClass("hidden");
    // } else{
    //     $("#warning").removeClass("hidden");
    //     $("#warning").html("<p style='color:black'>please only work on this experiment on a computer, and make sure your browser window is large enough to accomondate the canvas.</p>");
    // }

    currentIndex += 1;
    $('#trialnum').text('Trial '+currentIndex.toString()+'/'+totalTrials.toString());

    //clear out old sentences
    $("#sentences").empty();

    //reset variables
    stimuli = {};
    inputSize = 0;
    sentenceKeys = [];
    sentenceIndex = 0;
    $("#submit").addClass("disabled hidden");
    $("#next").addClass("disabled").removeClass("hidden");    
    //get stimuli json
    var getStimuli = $.Deferred();
    stimuliRef.child(wordList[currentIndex-1]).once("value", function(snapshot) {
        stimuli = snapshot.val();
        var inputSize = snapshot.val()["sentences"];
        //stimuli.splice(parseInt(snapshot.key())-1, 0, snapshot.val());

        if(inputSize > 0  &&  Object.keys(stimuli).length > inputSize ) {
            sentenceKeys = sList(inputSize, trialSize);
            getStimuli.resolve();
        }
    })

    

    //load the sentences
    //var loadSentences = $.Deferred();
    getStimuli.done(function() {
        //load instruction keywords
    $("#info").html('<b>Instructions: </b>You will see a total of ' +sentenceKeys.length+ ' sentences that include the word <b style="background-color:yellow">' 
        +wordList[currentIndex-1]+'</b>. Each sentence is represented by a numbered square in the grey canvas below. Drag the squares around in the canvas, such that sentences with similar meanings for "' 
        +wordList[currentIndex-1]+ '" are grouped closer together. The full content of each sentence will be displayed below the canvas. '
        + '<p style="text-decoration:underline">Please do not refresh this page until the experiment is finished, make sure your browser window is large enough to accommodate the canvas, and turn off Privacy Badger extension to allow us to save your answers.</p>')

        dropOneSentence();
        //loadChoices();
        //if ($("#rainbow > div").length - 1 == sentenceKeys.length) {loadSentences.resolve();}
        // $("#next").click(function(){
        //     sentenceIndex += 1;
        //     dropOneSentence();
        // })

    })
}



//drag-drop run for one sentence
function dropOneSentence(){
    $("#next").addClass("disabled");
    $("#warning").removeClass("hidden");
    //$("#alttxt").removeClass("disabled");
    //$("#next").html('');
    var colorstr = colorlist[sentenceIndex%8];
    var newDivString = ' <div class="draggable" id="';
    var newDiv0 = newDivString.concat (sentenceKeys[sentenceIndex].toString());
    //var newDiv00 = newDiv0.concat('" style= "background-color:',colorstr,';position:absolute; left:500px"><h4>');//,(window.outerWidth)/2, '"><h4>');
    var newDiv00 = newDiv0.concat('" style= "background-color:',colorstr,';position:absolute; left:',((window.innerWidth)/2)-19, 'px"><h4>');

    var newDiv = newDiv00.concat(sentenceIndex+1, "</h4></div>");
    $( "#sentences" ).append(newDiv);

    lastClicked = sentenceKeys[sentenceIndex].toString();

    $( ".draggable" ).draggable({revert:"invalid"});
    //$("#label-text" ).text(stimuli[sentenceKeys[sentenceIndex].toString()]["sentence"]);
    $("#label-text" ).html(stimuli[sentenceKeys[sentenceIndex].toString()]);    
    $("#label").css("background-color", colorstr);

    $( ".draggable" ).mouseover(function() {
        //$("#label-text" ).text(stimuli[this.id]["sentence"]);
        //$("#label").css("background-color", $(this).css("background-color"));
        //this.style.border-style="dashed";
        //$(this).css("border-style", "dashed");
        //$("#hover-text" ).text(stimuli[this.id]["sentence"]);
        if((lastClicked != this.id) ) {
            $("#hover-text" ).html(stimuli[this.id]);
            $("#hover").css("background-color", $(this).css("background-color"));
            $(this).css("border-style", "dashed");
        }

    })
    .mouseout(function() {
        $(this).css("border-style", "solid");
        
        $( "#hover-text" ).text( "Move your cursor close to a number to see the corresponding sentence." );
        $("#hover").css("background-color", "#ccc");
    })
    .mousedown(function() {
        //$("#label-text" ).text(stimuli[this.id]["sentence"]);
        lastClicked = this.id;

        $("#label-text" ).html(stimuli[this.id]);

        $("#label").css("background-color", $(this).css("background-color"));
        $(this).css("border-style", "dashed");
        $( "#hover-text" ).text( "Move your cursor close to a number to see the corresponding sentence." );
        $("#hover").css("background-color", "#ccc");

        $(this).css("z-index", 1);

        // ///
        // $( ".draggable" ).mouseover(function() {
        //     //$("#label-text" ).text(stimuli[this.id]["sentence"]);
        //     //$("#label").css("background-color", $(this).css("background-color"));
        //     //this.style.border-style="dashed";
        //     //$(this).css("border-style", "dashed");
        //     $("#hover-text" ).text(stimuli[this.id]["sentence"]);
        //     $("#hover").css("background-color", $(this).css("background-color"));
        //     $(this).css("border-style", "dashed");
        //
        // })
        // .mouseout(function() {
        //     $(this).css("border-style", "solid");
        //     
        //     $( "#hover-text" ).text( "Move your cursor close to a number to see the corresponding sentence." );
        //     $("#hover").css("background-color", "#ccc");
        // })
        // ///

    })
    .mouseup(function() {
        $(this).css("border-style", "solid");

        $( "#label-text" ).text( "Hold your mouse down on a number to see the corresponding sentence" );
        $("#label").css("background-color", "#ccc");

        $(this).css("z-index", 2);

        lastClicked = 0;
        
    });
}


//function recordTrial(response, inputID) {
function recordTrial() {
    if (currentIndex <= 0) {return;}
    var response = getPositions();
    trialData = {
        //"inputID":inputID,
        "inputWord":wordList[currentIndex-1],
        "inputSentences":sentenceKeys,
        "userID":userID,
        "response":response,
    };
    trialRef.push(trialData);
}

function getPositions() {
    var positionsJSON = new Object();
    for (var i=0; i<sentenceKeys.length; i++) {
        var itemStr = $("#"+sentenceKeys[i])[0].outerHTML;
        var startL = itemStr.indexOf("left");
        var endL = itemStr.indexOf(';', startL);
        var LString = itemStr.substring(startL, endL);
        var startT = itemStr.indexOf("top");
        var endT = itemStr.indexOf(';', startT);
        var TString = itemStr.substring(startT, endT);
        positionsJSON[sentenceKeys[i]] = LString +';'+ TString;
    }
    return positionsJSON
}



//send IP and location info to firebase
//¿amazon worker id?
function getSubjectInfo(){
    var city = null;
    var country = null;
    var getLocation = $.Deferred();
    var IPkey;
    var IDkey;
    var lati;
    var longi;

    $.get("https://wordful-flask.herokuapp.com/ip", function(response) {
        country = response.country_code;
        userIP = response.ip;
        lati = response.latitude;
        longi =  response.longitude;
        city = response.city;

        IPkey = userIP.toString().split(".").join("_");
        IDkey = workerID.toString();

        
        if (IPkey!=null && IDkey!=null ) {
        //if (IPkey!=null ) {
            getLocation.resolve();
        }
    }, "json")

    

    // Generate a reference to a new location and add some data using push()
    getLocation.done(function() {
        var checkUser = $.Deferred();
        //TODO: put back user check.
        //checkIfUserExists(IPkey, IDkey, checkUser);
        checkUser.resolve();
        

        var jsonData = {userDisplayLanguage: navigator.language,
					userAgent: navigator.userAgent,
					ipAddress: userIP,
                    amazonWorkerID: workerID,
                    userCountry: country,
                    latitude: lati,
                    longitude: longi,
                    city: city,
                    //condition: stimuliIndices,
                    condition:wordList,
                    completed:0
                    };

        
                
            
            //IPuserRef.set(IPkey:jsonData);
            checkUser.done(function() {
                var newIPRef = IPuserRef.child(IPkey);
                var newIDRef = workerIDuserRef.child(IDkey);
                //newIPRef.set(jsonData);
                //newIDRef.set(jsonData);

                var newPostRef = userRef.push(jsonData);
                userID = newPostRef.key();
                $("#AMTcode").text(userID);
                thisUserRef = newPostRef;
                thisUserRef.onDisconnect().update({ endedAt: Firebase.ServerValue.TIMESTAMP });
                thisUserRef.update({ startedAt: Firebase.ServerValue.TIMESTAMP });

                newIPRef.set({user: userID});
                newIDRef.set({user: userID});

                Raven.setUserContext({
                    id: userID
                })
                //console.log(userID)

            })
            //workerIDuserRef.set(IDkey:jsonData);


    })
}


/*************************************
   jquery ui script for drag-drop
 *************************************/
$(function() {
    $( ".draggable" ).draggable();
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
         onCanvasStyle( ui.draggable );
         if (sentenceIndex == sentenceKeys.length-1) {
            $("#next").addClass("hidden");
            $("#submit").removeClass("disabled hidden");
         }
         if (sentenceIndex < sentenceKeys.length-1) {
            $("#next").removeClass("disabled");
            $("#warning").addClass("hidden");
            //$("#next").html('<div id="alttxt" title="Move the current sentence to proceed" style="position:absolute; left:0; right:0; top:0; bottom:0;"></div>');
            //$("#alttxt").addClass("disabled");
         }
      }
    });
  });

function onCanvasStyle($item) {

    //parse to get id string of item
    var itemStr = $item[0].outerHTML;
    var startIndex = itemStr.indexOf("id=") + 4;
    var endIndex = itemStr.indexOf('"', startIndex);
    var idString = itemStr.substring(startIndex, endIndex);

    //change border color
    $("#" + idString).css("border-color", "black");

}


/*************************************
   user IP check
 *************************************/

// function checkIfUserExists(IP, checkUser) {
//     var IPcheck;
//   //var IPRef = new Firebase(USERS_LOCATION);
//   IPuserRef.child(IP).once('value', function(snapshot) {
//     var exists = (snapshot.val() != null);
//     IPExistsCallback(IP, exists);
//     IPcheck = "done";
//     if (userExists != null && IPcheck != null) {
//         checkUser.resolve();
//     }
//   });
//
//   workerIDuserRef.child(workerID).once('value', function(snapshot) {
//     var exists = (snapshot.val() != null);
//     IPExistsCallback(workerID, exists);
//     if (userExists != null && IPcheck != null) {
//         checkUser.resolve();
//     }
//   });
// }

function userExistsCallback(IPD, IPDexists) {
  if (IPDexists) {
    //alert('user ' + IP + ' exists!');
    $("#consent").addClass("hidden");
    $("#userExists").removeClass("hidden");
  } else {
    userExists = false;
  }
}

// function workerIDExistsCallback(ID, IDexists) {
//   if (IDexists) {
//     //alert('user ' + ID + ' exists!');
//     //$(".container").html(userExistsHTML);
//     $("#consent").addClass("hidden");
//     $("#userExists").removeClass("hidden");
//   } else {
//     //alert('user ' + ID + ' does not exist!');
//     userExists = false;
//   }
// }

 
function checkIfUserExists(IP, workerID, checkUser) {
    var IPcheck;
  //var IPRef = new Firebase(USERS_LOCATION);
  IPuserRef.child(IP).once('value', function(snapshot) {
    var exists1 = (snapshot.val() != null);
    userExistsCallback(IP, exists1);
    IPcheck = "done";
  });

  workerIDuserRef.child(workerID).once('value', function(snapshot) {
    var exists2 = (snapshot.val() != null);
    userExistsCallback(workerID, exists2);
    if (userExists != null && IPcheck != null) {
        checkUser.resolve();
    }
  });
}



/*************************************
   other helper functions
 *************************************/
function keywordsHTML(idString) {
    if(idString=="test"){return "test";}
    var keywordList = stimuli[idString]["keywords"];
    var displaytxt = keywordList.join("<br />");
    return displaytxt;
}



function range(start, length) { //generates an integer array with specified starting point and length
    var foo = [];
    for (var i = 0; i < length; i++) {
        foo.push(i+start);
    }
    return foo;
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 != currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


function sList(inputSize, trialSize) {
    var slist = [];
    var sSize = Math.min(inputSize, trialSize)
    var rlist = shuffle(range(1,inputSize));
    rlist = rlist.slice(0, sSize);
    for (var i = 0; i < sSize; i++) {
        var entry = "s".concat(String(rlist[i]-1));
        slist[i] = entry; 
    }
    return slist;
}


function getParamFromURL( name ){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
		return "";
	else
		return results[1];
}
