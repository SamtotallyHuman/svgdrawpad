function findxy(res, e) {
    e.preventDefault(); // prevents the default action of the event
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = getX(e)
        currY = getY(e)

        flag = true;
        if (penAction == "pen") {
            penStart();
        } else if (penAction == "fill") {
            fillStart();
        } else if (penAction == "line") {
            lineStart();
        } else if (penAction == "circle") {
            circleStart();
        } else if (penAction == "move") {
            moveStart();
        } else if (penAction == "rectangle") {
            rectangleStart();
        } else if (penAction == "text") {
            textStart();
        } else if (penAction == "moveNoResizer") {
            moveNoResizerStart();
        }
    }
    if (res == 'up') {
        if (flag == true) {
            flag = false;
            counter++;
        }
    }
    if (res == 'move') {
        if (flag) {

            prevX = currX;
            prevY = currY;
            currX = getX(e)
            currY = getY(e)
            if (penAction == "pen") {
                penMove();
            } else if (penAction == "fill") {
                fillMove();
            } else if (penAction == "line") {
                lineMove();
            } else if (penAction == "circle") {
                circleMove();
            } else if (penAction == "move") {
                moveMove();
            } else if (penAction == "rectangle") {
                rectangleMove();
            } else if (penAction == "moveNoResizer") {
                moveNoResizerMove();
            }
        }
    }
}

function getX(e) {
    var p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    var ctm = svg.getScreenCTM().inverse();
    var p =  p.matrixTransform(ctm);
    return p.x;
}

function getY(e) {
    var p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    var ctm = svg.getScreenCTM().inverse();
    var p =  p.matrixTransform(ctm);
    return p.y;
}


function penStart() {
    if (fillShape) {
        fillStart();
    } else {
        let polyline = "<polyline points='"+currX+","+currY+"' style='fill:none;stroke:"+colour+";stroke-width:"+pensize+"' id='"+counter+"'></polyline>";
        svg.innerHTML += polyline;
    }
}

function penMove() {
    if (fillShape) {
        fillMove();
    } else {
        let polyline = document.getElementById(counter);
        polyline.setAttribute("points", polyline.getAttribute("points")+" "+currX+","+currY);
    }
}


function fillStart() {
    let polygon = "<polygon points='"+currX+","+currY+"' style='fill:"+colour+";stroke:"+colour+";stroke-width:"+pensize+"' id='"+counter+"'></polyline>";
    svg.innerHTML += polygon;
}

function fillMove() {
    let polygon = document.getElementById(counter);
    polygon.setAttribute("points", polygon.getAttribute("points")+" "+currX+","+currY);
}


function lineStart() {
    let polyline = "<polyline points='"+currX+","+currY+" "+currX+","+currY+"' style='fill:none;stroke:"+colour+";stroke-width:"+pensize+"' id='"+counter+"'></polyline>";
    svg.innerHTML += polyline;
}

function lineMove() {
    if (event.shiftKey) {
        let polygon = document.getElementById(counter);
        let points = polygon.getAttribute("points");
        // removes from the end until the last space
        points = points.substring(0, points.lastIndexOf(" "));

        let centrePoints = points.split(",");
        
        // finds the nearst point which is at a multiple of 45 degrees from the coords in points
        let x = currX;
        let y = currY;
        let centreX = parseInt(centrePoints[0]);
        let centreY = parseInt(centrePoints[1]);
        let distFromCentre = Math.sqrt(Math.pow(x-centreX, 2) + Math.pow(y-centreY, 2));
        let angle = Math.atan2(y - centreY, x - centreX) * 180 / Math.PI;
        let newAngle = Math.round(angle / 45) * 45;
        let newX = centreX + Math.cos(newAngle * Math.PI / 180) * distFromCentre;
        let newY = centreY + Math.sin(newAngle * Math.PI / 180) * distFromCentre;


        points += " "+newX+","+newY;
        // updates the points
        polygon.setAttribute("points", points);

    } else {
        let polygon = document.getElementById(counter);
        let points = polygon.getAttribute("points");
        // removes from the end until the last space
        points = points.substring(0, points.lastIndexOf(" "));
        // adds the new points to points
        points += " "+currX+","+currY;
        // updates the points
        polygon.setAttribute("points", points);
    }
}


function circleStart() {
    if (fillShape) {
        var circle = '<circle class="createdObject" id='+counter+' cx="'+currX+'" cy="'+currY+'" r="0" stroke="'+colour+'" stroke-width="'+pensize+'" fill="'+colour+'" />';
    } else {
        var circle = '<circle id='+counter+' cx="'+currX+'" cy="'+currY+'" r="0" stroke="'+colour+'" stroke-width="'+pensize+'" fill="none" />';
    }
    //et circle = '<circle id='+counter+' cx="'+currX+'" cy="'+currY+'" r="0" stroke="'+colour+'" stroke-width="'+pensize+'" fill="none" />';
    svg.innerHTML += circle;
}

function circleMove() {
    let circle = document.getElementById(counter);
    circle.setAttribute("r", Math.sqrt(Math.pow(currX - circle.getAttribute('cx'), 2) + Math.pow(currY - circle.getAttribute('cy'), 2)));

}


var moveStartX = 0; // x coordinate of the start of the move
var moveStartY = 0; // y coordinate of the start of the move
var resizeFlag = false; // flag to check if the user is resizing the shape
var imageStartX = 0; // x coordinate of the start of the image
var imageStartY = 0; // y coordinate of the start of the image

let resizerX = 0; // Defines the x position of the resizer
let resizerY = 0; // Defines the y position of the resizer
let origonalwidth = 0; // Defines the original width of the current counter item
let origonalheight = 0; // Defines the original height of the current counter item


function moveStart() {
    counter--;
    if (counter < 0) {
        counter = 0;
    }
    // check if click is within 15px of resiser
    var resizer = document.getElementById("resizer");
    var resizerX = resizer.getAttribute("cx");
    var resizerY = resizer.getAttribute("cy");
    var distance = Math.sqrt(Math.pow(currX - resizerX, 2) + Math.pow(currY - resizerY, 2));
    if (distance < 15) {
        resizeFlag = true;
        moveStartX = currX;
        moveStartY = currY;
    } else {   
        moveStartX = currX;
        moveStartY = currY;
        imageStartX = document.getElementById(counter).getAttribute("x");
        imageStartY = document.getElementById(counter).getAttribute("y");
    }
    
}

function moveMove() {
    if (resizeFlag) {
        var resizer = document.getElementById("resizer");
        var resizerX = resizer.getAttribute("cx");
        var resizerY = resizer.getAttribute("cy");
        var newX = parseInt(resizerX) + (parseInt(currX) - parseInt(moveStartX));
        var newY = parseInt(resizerY) + (parseInt(currY) - parseInt(moveStartY));
        resizer.setAttribute("cx", newX);
        resizer.setAttribute("cy", newY);
        document.getElementById(counter).setAttribute("width", parseInt(origonalwidth) + (parseInt(currX) - parseInt(moveStartX)));
        document.getElementById(counter).setAttribute("height", parseInt(origonalheight) + (parseInt(currY) - parseInt(moveStartY)));
    } else {
        let item = document.getElementById(counter);
        item.setAttribute("x", parseInt(imageStartX) + (parseInt(currX) - parseInt(moveStartX)));
        item.setAttribute("y", parseInt(imageStartY) + (parseInt(currY) - parseInt(moveStartY)));
    }
    changeImageResizerPos();
}

function resizerClick() {
    var resizer = document.getElementById("resizer");
    resizerX = resizer.getAttribute("cx");
    resizerY = resizer.getAttribute("cy");
    origonalwidth = document.getElementById(counter).getAttribute("width");
    origonalheight = document.getElementById(counter).getAttribute("height");
}


function moveNoResizerStart() {
    counter--;
    if (counter < 0) {
        counter = 0;
    }
    moveStartX = currX;
    moveStartY = currY;
    imageStartX = document.getElementById(counter).getAttribute("x");
    imageStartY = document.getElementById(counter).getAttribute("y");
}

function moveNoResizerMove() {
    let item = document.getElementById(counter);
    item.setAttribute("x", parseInt(imageStartX) + (parseInt(currX) - parseInt(moveStartX)));
    item.setAttribute("y", parseInt(imageStartY) + (parseInt(currY) - parseInt(moveStartY)));
}


function rectangleStart() {
    var rect = "";
    if (fillShape) {
        var rect = "<rect id='"+counter+"' x='" + currX + "' y='" + currY + "' fill='" + colour + "' stroke='" + colour + "' stroke-width='" + pensize + "' />";
    } else {
        var rect = "<rect id='"+counter+"' x='" + currX + "' y='" + currY + "' stroke='" + colour + "' stroke-width='" + pensize + "' fill='none'/>";
    }
    svg.innerHTML += rect;
}

function rectangleMove() {
    if (event.shiftKey) {
        var rectangle = document.getElementById(counter);
        if (parseInt(currX) - parseInt(rectangle.getAttribute("x")) > 0) {
            rectangle.setAttribute("width", parseInt(currX) - parseInt(rectangle.getAttribute("x")));
            rectangle.setAttribute("height", parseInt(currX) - parseInt(rectangle.getAttribute("x")));
        } else {
            rectangle.setAttribute("width", "1");
            rectangle.setAttribute("height", "1");
        }
    } else {
        var rectangle = document.getElementById(counter);
        if (parseInt(currX) - parseInt(rectangle.getAttribute("x")) > 0) {
            rectangle.setAttribute("width", parseInt(currX) - parseInt(rectangle.getAttribute("x")));
        } else {
            rectangle.setAttribute("width", "1");
        }
        if (parseInt(currY) - parseInt(rectangle.getAttribute("y")) > 0) {
            rectangle.setAttribute("height", parseInt(currY) - parseInt(rectangle.getAttribute("y")));
        } else {
            rectangle.setAttribute("height", "1");
        }
    }
}


function textStart() {
    
    console.log("How did you get here?");

    changePenAction("pen");
}
function addText() {
    let foreignObject = "<foreignObject class='textObject' id='"+counter+"' width='10000' height='10000' x='0' y='0' style='color:"+colour+";font-size:"+(textSize)+";'>"+displayTextDiv.innerHTML.replace(/(?:\r\n|\r|\n)/g, "<br>")+"</foreignObject>" +
    counter++;
    svg.innerHTML += foreignObject;
    displayTextDiv.innerHTML = "";
    changePenAction("moveNoResizer");
}