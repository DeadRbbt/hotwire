(function(){

    /* Requires Quaternion.js */


    // Canvas and setting canvas to device height and width 
    
    cC = document.getElementById("canvasCircle");
    cW = document.getElementById("canvasWire");
    var body = document.body,
        html = document.documentElement;

    var height = Math.max(body.scrollHeight, body.offsetHeight, 
                        html.clientHeight, html.scrollHeight, html.offsetHeight);
    var width = Math.max(body.scrollWidth, body.offsetWidth, 
                        html.clientWidth, html.scrollWidth, html.offsetWidth);

    document.getElementById("width").innerHTML = width;
    document.getElementById("height").innerHTML = height;

    cC.height = height;
    cW.height = height;
    cC.width = width;
    cW.width = width;
        
    // Drawing on the canvas

    var ballRad = ((width * height) / 30000);
    var ballx = width/2;
    var bally = height/2;
    var ctxcC = cC.getContext("2d");
    var ctxcW = cW.getContext("2d");

    ctxcC.beginPath();
    ctxcC.lineWidth = 10;
    ctxcC.arc(ballx, bally, ballRad, 0, 2 * Math.PI);
    ctxcC.stroke();

    var wireCoords = [];

    // Draws all hot wires and calculates coordinates along the wire for collision detection
    drawWire(width*0.1, height*0.1, width*0.5, height*0.05, width*0.851, height*0.1);
    drawWire(width*0.849, height*0.1, width*0.95, height*0.15, width*0.85, height*0.252);
    drawWire(width*0.852, height*0.25, width*0.5, height*0.3, width*0.25, height*0.23);
    drawWire(width*0.25, height*0.23, width*0.1, height*0.2, width*0.2, height*0.38);


    var collision = true;
    // Storage for the starting quaternion rotation we compare against.
    
    var _qstart = null;

    var handleDeviceOrientation = function(target) {
        var dy = rad2deg(target.y), dz = rad2deg(target.z);
        var rdy, rdz;

        if (dy < 0){
            rdy = Math.abs(dy)
        } else {
            rdy = Math.abs(dy) * -1
        }
        if (dz < 0){
            rdz = Math.abs(dz)
        } else {
            rdz = Math.abs(dz) * -1
        }

        ballx = (rdz + 35) * width / 70;
        bally = (rdy + 50) * height / 100;

        document.getElementById("posx").innerHTML = ballx;
        document.getElementById("posy").innerHTML = bally;
        document.getElementById("x").innerHTML = dz;    
        document.getElementById("y").innerHTML = dy;

        // restarts the game if the ball is at the starting point
        if (collision == true)  {
            console.log(collision);
            ctxcC.strokeStyle = '#FF0000';
            var distToStart = (Math.hypot(Math.abs(ballx-width*0.1), Math.abs(bally-height*0.1)));
            
            console.log(distToStart);
            if (distToStart < ballRad) {
                collision = false;
                ctxcC.strokeStyle = '#00FF00';
            }   
        }

        // Draw ball if inside view

        if (bally < (height - ballRad) && 
            bally > ballRad && 
            ballx < (width - ballRad) && 
            ballx > ballRad) {

            drawCircle(ballx, bally);

        } else 

        // Draw ball if outside of view (wall collision)

        if (bally > (height - ballRad) && 
            bally > ballRad && 
            ballx < (width - ballRad) && 
            ballx > ballRad) {

            drawCircle(ballx, (height - ballRad));

        } else

        if (bally < (height - ballRad) && 
            bally < ballRad && 
            ballx < (width - ballRad) && 
            ballx > ballRad) {

            drawCircle(ballx, ballRad);
            
        } else

        if (bally < (height - ballRad) && 
            bally > ballRad && 
            ballx > (width - ballRad) && 
            ballx > ballRad) {

            drawCircle((width - ballRad), bally);

        } else

        if (bally < (height - ballRad) && 
            bally > ballRad && 
            ballx < (width - ballRad) && 
            ballx < ballRad) {

            drawCircle(ballRad, bally);
        }
    }

    var drawCircle = function(x,y) {
        ctxcC.clearRect(0, 0, width, height);
        ctxcC.beginPath();
        ctxcC.lineWidth = 10;
        ctxcC.arc(x, y, ballRad, 0, 2 * Math.PI);
        ctxcC.stroke();
        detectCollision(wireCoords);
    }

    // draws wire, gets wire coordinates and safes them in array wireCoords
    function drawWire(sx, sy, cpx, cpy, x, y) {
        ctxcW.beginPath();
        ctxcW.moveTo(sx, sy);
        ctxcW.lineWidth = 10;
        ctxcW.quadraticCurveTo(cpx, cpy, x, y);
        ctxcW.stroke();
    
        //TODO store coordinates of curve after calculating coordinates
        getWireCoordinates(sx, sy, cpx, cpy, x, y);
    }

    // Gets coordinates of the wire
    function getWireCoordinates(sx, sy, cpx, cpy, x, y) {
        for (let i = 1; i < 200; i++){
            var wireCoordAtT = null;
            wireCoordAtT = getQuadraticXY(i/200, sx, sy, cpx, cpy, x, y);
            storeCoordinate(wireCoordAtT["x"], wireCoordAtT["y"], wireCoords);

            // TODO debug, transform to comment when finished
            // ctxcW.beginPath();
            // ctxcW.arc(wireCoords[i-1].x, wireCoords[i-1].y, 5, 0, 2 * Math.PI);
            // ctxcW.stroke();
        }
    }

    //Source for "getQuadraticXY": http://www.independent-software.com/determining-coordinates-on-a-html-canvas-bezier-curve.html
    function getQuadraticXY(t, sx, sy, cp1x, cp1y, ex, ey) {
        return {
            x: (1-t) * (1-t) * sx + 2 * (1-t) * t * cp1x + t * t * ex,
            y: (1-t) * (1-t) * sy + 2 * (1-t) * t * cp1y + t * t * ey
        };
    }

    function storeCoordinate(xWire, yWire, array) {
        array.push({x: xWire, y: yWire});
    }

    function detectCollision(array) {
        var minDist = 9999;
        var c;

        for (let i = 0; i < array.length; i++) {
            c = (Math.hypot(Math.abs(ballx-array[i].x), Math.abs(bally-array[i].y)));
            
            if (c < minDist){
                minDist = c;
            }
        }

        if (minDist > ballRad) {
            collision = true;
        }
        
    }

    function resetWireIfAtStart() {
        if (collision == false) {
            ctxcC.strokeStyle = '#00FF00';
            console.log(collision);
        } else {
            console.log(collision);
            ctxcC.strokeStyle = '#FF0000';
            var c = (Math.hypot(Math.abs(ballx-width*0.1), Math.abs(bally-height*0.1)));
    
            if (c < ballRad) {
                collision = false;
            }
        }
    }

    function drawDistance(c, i, array) {
        ctxcC.beginPath();
        ctxcC.lineWidth = 1;
        ctxcC.moveTo(ballx, bally);
        ctxcC.lineTo(array[i].x, array[i].y);
        if (c < ballRad){
            ctxcC.strokeStyle = '#ff0000';
        } else {
            ctxcC.strokeStyle = '#000000';
        }
        ctxcC.stroke();
        ctxcC.strokeStyle = '#000000'; 
    }

    // Regular device orientation data in relation to earth produced distorted controlls the further the phone was tiled. 
    // Solution: convert regular device orientation data in relation to earth to -> quanternions
    // The following code and quanternion.js was taken from https://github.com/njoubert/DeviceOrientationQuaternions

    var deg2rad = function(deg) {
        return deg*(Math.PI/180);
    }

    var rad2deg = function(rad) {
        return rad*(180/Math.PI);
    }

    var calculateQuaternionDifference = function(doe) {

        var qcurrent = new Quaternion(0,0,0,0);
        
        // Step: HERE WE GO FROM EULER TO QUATERNION:
        // ====================================================================
        
        var order = 'XYZ';

        // TODO: Check that the order is correct. I think it is but not sure.
        qcurrent.setFromEuler(deg2rad(doe.alpha), deg2rad(doe.beta), deg2rad(doe.gamma), order);
        qcurrent.normalize();

        // Save if we don't have a starting position yet
        if (_qstart == null) {
            _qstart = qcurrent
        }

        // Step: CALCULATE ROTATION FROM OLD TO NEW ORIENTATION
        // ====================================================================
        var qinv = qcurrent.inverse();
        var qdiff = _qstart.mult(qinv);

        var eulerdiff = new Vec3();
        qdiff.toEuler(eulerdiff, 'YZX');
        handleDeviceOrientation(eulerdiff);
    }

    window.resetQuat = function() {
        _qstart = null;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientation
    window.ondeviceorientation = function(doe) {
        calculateQuaternionDifference(doe);
    }

})();