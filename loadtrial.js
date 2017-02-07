var colorlist = ["#C4E17F", "#DB9DBE", "#FECF71", "#F0776C", "#F7FDCA", "#669AE1", "#C49CDE", "#62C2E4"];

///main///
$(document).ready ( function(){
    var trialID =  getParamFromURL( 'trialID' );
}

///helper functions
function dropOneSentence(){
    $("#next").addClass("disabled");
    $("#nextdiv").html('<input class="btn btn-info disabled" id="next" style="color:black" type="button" value="New Sentence" /><div id="block" style="position:absolute; left:0; right:0; top:0; bottom:0; zIndex:5"></div>');
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


    })
    .mouseup(function() {
        $(this).css("border-style", "solid");

        $( "#label-text" ).text( "Hold your mouse down on a number to see the corresponding sentence" );
        $("#label").css("background-color", "#ccc");

        $(this).css("z-index", 2);

        lastClicked = 0;

               
    });
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
