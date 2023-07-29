var CLIPBOARD = new CLIPBOARD_CLASS(true);

function CLIPBOARD_CLASS(autoresize) {
    var _self = this;
    clicktimer = null;

    //handlers
    document.addEventListener('paste', function(e) {
       
        var BLOCK_TIME = 500;
        function handleclick() {
            _self.paste_auto(e);
        }
        
        if (clicktimer) {
        } else {
            handleclick();
            clicktimer = setTimeout(function() {
                clicktimer = null;
            }, BLOCK_TIME);
        }

        
    }, false);

    //on paste
    this.paste_auto = function(e) {
        if (e.clipboardData) {
            var items = e.clipboardData.items;
            if (!items) return;

            //access data directly
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                //image
                var blob = items[i].getAsFile();
                var URLObj = window.URL || window.webkitURL;
                var source = URLObj.createObjectURL(blob);
                this.paste_createImage(source);
                }
            }
            e.preventDefault();

        }
    };
    //draw pasted image to svg
    this.paste_createImage = function(source) {
        var pastedImage = new Image();
        pastedImage.onload = function() {
            var clipboardCanvas = document.createElement("canvas")
            // set dimensions of canvas
            clipboardCanvas.width = pastedImage.width;
            clipboardCanvas.height = pastedImage.height;
            var context = clipboardCanvas.getContext("2d")
            context.drawImage(pastedImage, 0, 0, pastedImage.width, pastedImage.height);
            var dataurl = clipboardCanvas.toDataURL("image/png")

            var img = document.createElementNS('http://www.w3.org/2000/svg','image');
            img.setAttributeNS(null,'height',pastedImage.height);
            img.setAttributeNS(null,'width',pastedImage.width);
            img.setAttributeNS(null,'id',counter);
            img.setAttributeNS(null,'href',dataurl);
            img.setAttributeNS(null,'draggable','false');
            img.setAttributeNS(null, 'style', 'pointer-events:none');
            img.setAttributeNS(null,'x','30');
            img.setAttributeNS(null,'y',parseInt(scrollableDiv.scrollTop) + 30);
            img.setAttributeNS(null,'preserveAspectRatio','none');
            $('#svg').append(img);
            
            counter++;
            var resizer = document.getElementById("resizer");
            if (resizer != null) {
                resizer.remove();
            }
            
            changePenAction("move");

        };
        pastedImage.src = source;
    };
}


function changePenWidth() {
    pensize = document.getElementById("widthRange").value;
    document.getElementById("changepenWidthbutton").innerHTML = pensize;
}

function changeLabelWidth() {
    textSize = document.getElementById("textwidthRange").value;
    document.getElementById("textSizeLabel").innerHTML = "&nbsp;"+ textSize+"&nbsp;";
    displayTextDiv.style.fontSize  = textSize +"px";

}

function togglePenMode() {
    PENMODEFLAG = !PENMODEFLAG

    if (PENMODEFLAG) {
        pendrawloaction.className = "unselectable glyphicon glyphicon-ok"
    } else {
        pendrawloaction.className = "unselectable glyphicon glyphicon-remove"
    }
}

function changePenFill() {
    if (fillShape) {
        fillShape = false;
        document.getElementById("changePenFillLabel").innerHTML = "<a class='unselectable'><span class='unselectable glyphicon glyphicon-adjust'><span class='unselectable glyphicon glyphicon-remove'></a>";
    } else {
        fillShape = true;
        document.getElementById("changePenFillLabel").innerHTML = "<a class='unselectable'><span class='unselectable glyphicon glyphicon-adjust'><span class='unselectable glyphicon glyphicon-ok'></a>";
    }
}

function clearArea() {
    svg.innerHTML = "";
    items = [];
    counter = 0;
}

function changePenColour(colourInput) {
    colour=colourInput;
    document.getElementById('penColour').style.color = colour;
    document.getElementById('outerDisplayDivHolder').style.color = colour;
}

function forceStop() {
    enableScroll();
    if (flag) {
        flag = false;
        dot_flag = false;
        counter++;
    }
}

function changeImageResizerPos() {
    var resizer = document.getElementById("resizer");
    resizer.setAttribute("cx",  document.getElementById(counter).getAttribute("x"));
    resizer.setAttribute("cy",  document.getElementById(counter).getAttribute("y"));
}

function changePenAction(action) {
    penAction = action;
    if (penAction == "pen") {
        document.getElementById('penAction').innerHTML = '<span class="glyphicon glyphicon-pencil large" id="changepenbutton"></span>';
    } else if (penAction == "fill") {
        document.getElementById('penAction').innerHTML = '<span class="glyphicon glyphicon-tint large" id="changepenbutton"></span>';
    } else if (penAction == "line") {
        document.getElementById('penAction').innerHTML = '<span class="glyphicon glyphicon-resize-horizontal large" id="changepenbutton"></span>';
    } else if (penAction == "circle") {
        document.getElementById('penAction').innerHTML = '<span class="unselectable large">O</span>';
    } else if (penAction == "move") {
        document.getElementById('penAction').innerHTML = '<span title="Move The last Item" class="glyphicon glyphicon-move large" id="changepenbutton"></span>';
    } else if (penAction == "rectangle") {
        document.getElementById('penAction').innerHTML = '<span class="glyphicon glyphicon glyphicon-stop large" id="changepenbutton"></span>';
    } else if (penAction == "text") {
        updateDisplayTextArea();
        document.getElementById('penAction').innerHTML = '<span class="glyphicon glyphicon-text-background large" id="changepenbutton"></span>'; 
        //alert("Text is not yet supported");       
    } else if (penAction == "moveNoResizer") {
        document.getElementById('penAction').innerHTML = '<span title="Move The last Item" class="glyphicon glyphicon-move large" id="changepenbutton"></span>';
    }

    // create resizer if pen is move and delete if not
    if (penAction == "move") {
        svg.innerHTML += '<circle id="resizer" cx="0" cy="0" r="15" fill="red" stroke="white" stroke-width="2" />';
    } else {
        var resizer = document.getElementById("resizer");
        if (resizer != null) {
            resizer.remove();
        }
    }

}

function KeyPress(e) {
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
        
        counter--;
        if (counter < 0) {
            counter = 0;
        }
        var lastItem = document.getElementById(counter);
        lastItem.remove();

    }
}

document.onkeydown = KeyPress;
