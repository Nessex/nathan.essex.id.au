/*
*   Created by Nathan Essex for DECO1400 Assessment 2
*/

(function() {
    'use strict';
    var mapArea, //div which contains all the game objects (snake and fruits)
    config = {
        startX: 20, //Initial x position of the head of the snake
        startY: 20, //Initial y position
        initialSpeed: 3, //Starting speed (ticks/second)
        maxSpeed: 8, //Maximum speed(ticks/second)
        startingSegments: 4, //How many segments the snake starts with in total
        fruitValue: 3, //How many segments/points a fruit is worth
        fruitSpawnChance: 0.05, //chance per tick of spawning a fruit
        minTicksWithoutFruit: 12, //don't allow fruit to spawn too fast
        maxTicksWithoutFruit: 20, //conversely, don't allow it to spawn too slow
        keyUp: 38, //104 for num8, 190 for ., 38 for up-arrow
        keyRight: 39, //102 for num6, 85 for u, 39 for right-arrow
        keyDown: 40, //101 for num5, 69 for e, 40 for down-arrow
        keyLeft: 37 //100 for num4, 79 for o, 37 for left-arrow
    },
    Point = function(x, y) {
        /*
        * An object which holds a pair of 2D coordinates, (x, y)
        * Arguments:
        *   x - Either an integer for the x coordinate, or a Point() object to
        *       duplicate. If not supplied, x = 0;
        *   y - Optional integer for the y coordinate, if not supplied y = 0
        */
        if (x.hasOwnProperty("x") && x.hasOwnProperty("y")) {
            //Object passed in is a Point (probably) so clone it.
            y = x.y();
            x = x.x();
        } else {
            x = x || 0;
            y = y || 0;
        }
        
        var getX = function() {
            return x;
        },
        getY = function() {
            return y;
        },
        equals = function(point2) {
            return (x === point2.x() && y === point2.y());
        },
        toString = function() {
            return x + ", " + y;
        };
        return {
            x: getX,
            y: getY,
            equals: equals,
            toString: toString
        };
    },
    snake = function() {
        /*
        * Contains all things to do with the snake itself.
        *
        */
        var direction = 0,
        lastDirection = 0,
        segmentsToAdd = 0,
        segments = [],
        segmentDivs = [],
        
        setDirection = function(dir) {
            /*
            * Set the snake's direction
            * 
            * Arguments:
            *   dir - Either an integer or string representing the direction you
            *         want the snake to be facing.
            */
            
            var directions = {
                "up" : 0,
                "right": 1,
                "down": 2,
                "left": 3
            };
            
            if (directions.hasOwnProperty(dir))
                dir = directions[dir];
            
            
            // //Wrap dir between 0 and 3: 
            // var wrap = function (x, min, max) {
            //     return (x<0) ? ((x+1)%(max-min+1))+max : (x%(max-min+1)+min);
            // };
            //
            // dir = wrap(dir, 0, 3);
            //
            // //OR
            //
            // dir = (function wrap(x, min, max) {
            //     if (x < min) {
            //         return wrap(x + (max + 1 - min), min, max);
            //     } else if (x > max) {
            //        return wrap(x - (max + 1 - min), min, max);
            //     } else {
            //        return x;
            //     }
            // }(dir, 0, 3));
            //
            // eg.    dir = -4 -3 -2 -1 0 1 2 3 4 5 6 7
            //     newDir =  0  1  2  3 0 1 2 3 0 1 2 3
            //
            
            //Wrap dir between 0 and 3 (see above)
            dir = (dir<0) ? (dir+1)%4+3 : dir%4;
            
            //Only allow a change of direction if the new direction 
            //isn't parallel to the old direction
            if (dir%2 !== direction%2) { 
                lastDirection = direction;
                direction = dir;
                gameLoop.manualTick(); //Make input feel more responsive
            }
            
            return direction;
        },
        
        checkForSegment = function(x, y) {
            /*
            * Check if a segment exists at Point(x, y)
            * Return:
            *   true | false
            */
            var p = new Point(x, y);
            for (var s = 0, sl = segments.length; s < sl; s++) {
                if (segments[s].equals(p))
                    return true;
            }
            return false;
        },
        
        getSegments = function() {
            return segments;
        },
        addSegment = function(x, y) {
            /*
            * Add a new segment to the snake
            * Arguments:
            *   x - Either the new segments x coordinate, 
            *       or a point corresponding to the new segment location. 
            *       If neither are provided, x = 0
            *   y - Optional, either the new y coordinate, or 0 if not provided.
            */
            var p = new Point(x, y),
            d = document.createElement("div"),
            ms = map.scale();
            
            //Define the corresponding div
            d.className = "snakeBody";
            d.style.width = ms + "px";
            d.style.height = ms + "px";
            d.style.top = p.y() * ms + "px";
            d.style.left = p.x() * ms + "px";
            
            //Add the new segment
            segments.push(p);
            segmentDivs.push(d);
            
            //Add it to the document
            mapArea.appendChild(d);
        },
        removeLastSegment = function() {
            /*
            * Remove the last "tail" segment of the snake
            */
            if (segmentDivs.length > 0) {
                var d = segmentDivs.shift();
                d.parentNode.removeChild(d);
            }
            segments.shift();
        },
        removeAllSegments = function() {
            /*
            * Clear all segments, and remove all segment divs
            */
            for (var s in segmentDivs) {
                segmentDivs[s].parentNode.removeChild(segmentDivs[s]);
            }
            segmentDivs = [];
            segments = [];
        },
        length = function() {
            return segments.length;
        },
        addBonusSegments = function(count) {
            segmentsToAdd += count;
        },
        tick = function() {
            var head = segments[segments.length - 1],
            nextHead;
            
            //Determine the location of the next "head" segment
            if (direction === 0)
                nextHead = new Point(head.x(), head.y() - 1);
            else if (direction === 1)
                nextHead = new Point(head.x() + 1, head.y());
            else if (direction === 2)
                nextHead = new Point(head.x(), head.y() + 1);
            else if (direction === 3)
                nextHead = new Point(head.x() - 1, head.y());
                
            
            //Check if you are within bounds
            if (nextHead.x() < 0 || 
                nextHead.x() >= map.width() ||
                nextHead.y() < 0 ||
                nextHead.y() >= map.height()) {
                    
                gameOver(); //out of bounds
                return;
            
            }
            
            //Remove last tail segment unless there is a segment to add
            if (segmentsToAdd === 0) {
                removeLastSegment();
            } else {
                segmentsToAdd--;
            }
            
            //Check for collision with self
            if (checkForSegment(nextHead)) {
                gameOver();
                return;
            } else {
                //Check for fruit
                var fruitAtDestination = fruits.checkForFruit(nextHead);
                if (fruitAtDestination) {
                    addBonusSegments(config.fruitValue);
                    fruits.remove(nextHead);
                }    
                
                //"Move" the snake by adding the new head segment
                addSegment(nextHead);
            }
            if (length() === map.width() * map.height())
                gameOver(); //Snake is the maximum length, you win!
        },
        init = function() {
            /*
            * Initialise/reset the snake
            */
            removeAllSegments();
            direction = 0;
            lastDirection = 0;
            segmentsToAdd = 0;
            addSegment(config.startX, config.startY);
            addBonusSegments(config.startingSegments - 1);
        };
        return {
            tick: tick,
            checkForSegment: checkForSegment,
            segments: getSegments,
            length: length,
            direction: setDirection,
            init: init
        };
    }(),
    map = function() {
        /*
        * width/height - map width and height in tiles
        * scale - tile size in pixels
        */
        var width, height, scale,
        
        randomEmptyTile = function() {
            /*
            * Return a random tile that has neither a fruit nor a snake segment
            *
            */
            
            //Create a 2D array of booleans representing each tile in the map
            //true represents an empty tile
            var allTiles = [];
            for (var y = 0; y < height; y++) {
                var row = [];
                for (var x = 0; x < width; x++) {
                    row.push(true);
                }
                allTiles.push(row);
            }
            
            //set all segment tiles to false (not empty)
            var seg = snake.segments();
            for (var s in seg) {
                allTiles[seg[s].y()][seg[s].x()] = false;
            }
            
            //set all fruit tiles to false (not empty)
            var fr = fruits.points();
            for (var f in fr) {
                allTiles[fr[f].y()][fr[f].x()] = false;
            }
            
            
            //New array of points containing only the remaining empty tiles, 1D
            var emptyTiles = [];
            
            for (var y2 = 0; y2 < height; y2++) {
                for (var x2 = 0; x2 < width; x2++) {
                    if (allTiles[y2][x2] === true)
                        emptyTiles.push(new Point(x2, y2));
                }
            }
            
            //Return a random point from the array of empty tiles
            return emptyTiles[Math.round(Math.random()*(emptyTiles.length-1))];
        },
        getScale = function() {
            return scale;
        },
        getWidth = function() {
            return width;
        },
        getHeight = function() {
            return height;
        },
        calculateDimensions = function() {
            /*
            * Calculate the width, height and scale of the map based on the size
            *   of the containing div.
            */
            var wrapper = document.getElementById("snakeWrapper"),
                wWidth = wrapper.offsetWidth, wHeight = wrapper.offsetHeight;
            
            //Containing div should be at least 40x40
            if (wWidth >= 40 && wHeight >= 40) {
                //Base the scale on the smallest dimension
                var reference = Math.min(wWidth, wHeight); 
                
                scale = Math.floor(reference / 40);
                
                width = Math.floor(wWidth / scale);
                height = Math.floor(wHeight / scale);
            
            } else {
                console.log("Snake wrapper div not large enough, " +
                            "make sure it is at least 40x40");
            } 
        };
        return {
            scale: getScale,
            width: getWidth,
            height: getHeight,
            randomEmptyTile: randomEmptyTile,
            calculateDimensions: calculateDimensions
        };
    }(),
    fruits = function() {
        /*
        * Object to handle everything to do with the fruits
        *
        */
        var fruit = [], //List of Point()s which correspond to fruit locations
        fruitDivs = [], //Divs associated with the above Point()s
        ticksWithoutFruit = 0, //Time since last fruit spawn
        
        addFruit = function(x, y) {
            /*
            * Add a new fruit at (x, y)
            * Arguments:
            *   x - Either the x coordinate, or a point containing both 
            *       coordinates. Defaults to 0.
            *   y - Optional y coordinate, defaults to 0.
            */
            var p = new Point(x, y), 
            d = document.createElement("div"),
            ms = map.scale(),
            ds = Math.ceil(ms/2); //div scale
            
            //Define the fruit's div
            d.className = "fruit";
            d.style.width = ds + "px";
            d.style.height = ds + "px";
            d.style.top = p.y() * ms + ds/2 + "px";
            d.style.left = p.x() * ms + ds/2 + "px";
            
            //Add the div to the document
            mapArea.appendChild(d);
            
            //Add it to both arrays
            fruit.push(p);
            fruitDivs.push(d);
            
            ticksWithoutFruit = 0;
        },
        removeFruit = function(x, y) {
            /*
            * Remove a fruit at a given coordinate
            *
            */
            var p = new Point(x, y);
            for (var f = 0, fl = fruit.length; f < fl; f++) {
                if (p.equals(fruit[f])) {
                    //Remove the div from the document
                    fruitDivs[f].parentNode.removeChild(fruitDivs[f]);
                    //Remove the fruit from both arrays
                    fruitDivs.splice(f, 1);
                    fruit.splice(f, 1);
                    return;
                }
            }
        },
        removeAllFruit = function() {
            for (var f in fruitDivs) {
                fruitDivs[f].parentNode.removeChild(fruitDivs[f]);
            }
            fruitDivs = [];
            fruit = [];
        },
        checkForFruit = function(x, y) {
            /*
            * Check if a fruit exists at a given coordinate
            * Arguments:
            *   Accepts either a point or a pair of (x, y) coordinates
            * Returns true | false
            */
            for (var f = 0, fl = fruit.length; f < fl; f++) {
                if (fruit[f].equals(new Point(x, y)))
                    return true;
            }
            return false;
        },
        listPoints = function() {
            //Return a list of all points containing fruit
            return fruit;
        },
        tick = function() {
            /*
            * All per-tick actions performed here
            *
            */
            ticksWithoutFruit++;
            if(ticksWithoutFruit > config.minTicksWithoutFruit && Math.random() > 1 - config.fruitSpawnChance)
                addFruit(map.randomEmptyTile());
            
            if (ticksWithoutFruit === config.maxTicksWithoutFruit)
                addFruit(map.randomEmptyTile());
        },
        init = function() {
            /*
            * Initialise/reset the fruit object
            *
            */
            removeAllFruit();
            ticksWithoutFruit = 0;
            addFruit(map.randomEmptyTile());
        };
        return {
            add: addFruit,
            remove: removeFruit,
            points: listPoints,
            tick: tick,
            checkForFruit: checkForFruit,
            init: init
        };
    }(),
    input = function() {
        /*
        * Handles all keyboard input
        *
        */
        var keyDown = function(e) {
            /*
            * Run each time a key is pressed
            *
            */
            if (gameLoop.running()) {
                e.preventDefault();
                switch (e.keyCode) {
                    case config.keyUp:
                        snake.direction("up");
                        break;
                    case config.keyRight:
                        snake.direction("right");
                        break;
                    case config.keyDown:
                        snake.direction("down");
                        break;
                    case config.keyLeft:
                        snake.direction("left");
                        break;
                }
            }
        },
        init = function() {
            if (document.addEventListener) {
                document.addEventListener('keydown', keyDown, true);
            } else if (document.attachEvent) { 
                document.attachEvent('onkeydown', keyDown);
            }
        }();
    }(),
    gameLoop = function() {
        /*
        * Controls the main game logic loop
        */
        var running = false, //Boolean game state
        speed = config.initialSpeed, //Speed in ticks/second
        gameTickTimer, //timeout object which calls the game logic loop
        loop = function() {
            /*
            * Game logic loop
            */
            if (running) {
                //Set up the timer for the next loop at the start of this loop
                //to increase the accuracy of the game ticks
                gameTickTimer = setTimeout(loop, (1000 / speed));
                
                //Perform per-tick operations
                fruits.tick();
                snake.tick();
                
                //Increase the game speed!
                var newSpeed = snake.length()/config.startingSegments + 
                                    config.startingSegments;
                
                if (newSpeed < config.maxSpeed)
                    speed = newSpeed;
            }
        },
        manualTick = function() {
            /*
            * Manually force the game to 'tick' and reset the tick timer
            */
            clearTimeout(gameTickTimer);
            loop();
        },
        
        start = function() {
            /*
            * Start the game logic loop
            */
            running = true;
            loop();
        },
        stop = function() {
            running = false; //Game will stop in the next tick
        },
        getRunning = function() {
            return running;
        };
        return {
            start: start,
            stop: stop,
            running: getRunning,
            manualTick: manualTick
        };
    }(),
    gameOver = function() {
        /*
        * Game is over, stop the game and display the game over screen
        */
        gameLoop.stop();
        
        var heading = document.getElementById("snakeFinalScoreHeading"),
        scoreText = document.getElementById("snakeFinalScoreText");
        
        if (snake.length() === map.width() * map.height())
            heading.innerHTML = "You Win!";
        else
            heading.innerHTML = "Game Over.";
            
        scoreText.innerHTML = "Final Score: " + 
                Math.max(0, (snake.length() - config.startingSegments));
        
        document.getElementById("snakeGameOver").style.display = "block";
    },
    restart = function() {
        /*
        * Game is starting/restarting, hide all menus and show the game screen
        *
        */
        document.getElementById("snakeMenu").style.display = "none";
        document.getElementById("snakeGameOver").style.display = "none";
        
        //Set everything back to its initial state and start the game loop
        snake.init();
        fruits.init();
        gameLoop.start();
    },
    init = function() {   
        //Set up the event listeners for the Start and Retry buttons
        if (document.addEventListener) {
            document.getElementById("snakeStartButton").addEventListener('click', restart);
            document.getElementById("snakeResetButton").addEventListener('click', restart);
        } else if (document.attachEvent) { 
            document.getElementById("snakeStartButton").attachEvent('onclick', restart);
            document.getElementById("snakeResetButton").attachEvent('onclick', restart);
        }
        
        //Make the menu visible
        document.getElementById("snakeMenu").style.display = "block";
        
        //Calculate the grid you will be working with
        map.calculateDimensions();
        
        
        //Create the game space which will contain the snake and fruits
        mapArea = document.createElement("div");
        mapArea.id = "map";
        
        mapArea.style.width = map.width() * map.scale() + "px";
        mapArea.style.height = map.height() * map.scale() + "px";
        
        //Add the map area to the document
        document.getElementById("snakeWrapper").appendChild(mapArea);
    }();
}());