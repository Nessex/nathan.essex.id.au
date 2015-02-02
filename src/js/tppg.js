/*
*   Created by Nathan Essex for DECO1400 Assessment 2
*/

(function() {
    'use strict';
    var input, //typing input element
    textOutput, //main text display area
    timeTakenCell, //time taken output element
    wordCountCell, //word count output element
    wpmCell, //Words per minute output elemnt
    bookTitle, //Book title element
    resetButton, //reset button element
    paragraph, //currently selected paragraph (array of words)
    paragraphLength, //length of the paragraph in words
    currentWord, //index of the current word
    //allows you to not start the timer until the first letter is typed
    firstKey = true, 
    startTime, //Date element created after the first key is pressed
    active = true, //states whether user is currently typing (timers running)
    paragraphs = [ //Array of paragraphs which are randomly chosen from
        ["He disappeared into his bedroom and returned in a few minutes in the character of an amiable and simple-minded Nonconformist clergyman. His broad black hat, his baggy trousers, his white tie, his sympathetic smile, and general look of peering and benevolent curiosity were such as Mr. John Hare alone could have equalled. It was not merely that Holmes changed his costume. His expression, his manner, his very soul seemed to vary with every fresh part that he assumed. The stage lost a fine actor, even as science lost an acute reasoner, when he became a specialist in crime.", "The best of Sherlock Holmes - by Sir Arthur Conan Doyle"],
        ["Cornwall, the farthest Shire of England Westwards, hath her name by diuers Authors diuersly deriued. Some (as our owne Chroniclers) draw it from Corineus, cousin to Brute, the first Conqueror of this Iland: who wrastling at Plymmouth (as they say) with a mightie Giant, called Gogmagog, threw him ouer Cliffe, brake his necke, and receiued the gift of that Countrie, in reward for his prowesse: Some, as Cerealis, (no lesse mistaken perhaps in that, then in his measures) from Cornu Galliae, a home or corner of Fraunce, whereagainst nature hath placed it: and some, from Cornu Walliae, which (in my conjecture) carrieth greatest likelyhood of truth.", "The Survey of Cornwall And an epistle concerning the excellencies of the English tongue - by Richard Carew"],
        ["So on he jogged, and all seemed now to go right with him: he had met with some misfortunes, to be sure; but he was now well repaid for all. How could it be otherwise with such a travelling companion as he had at last got?", "Grimms’ Fairy Tales - by the Brothers Grimm"],
        ["The general who advances without coveting fame and retreats without fearing disgrace, whose only thought is to protect his country and do good service for his sovereign, is the jewel of the kingdom.", "The Art of War - by Sun Tzu"],
        ["Earth comprises distances, great and small; danger and security; open ground and narrow passes; the chances of life and death.", "The Art of War - by Sun Tzu"],
        ["Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive; when we are near, we must make the enemy believe we are far away; when far away, we must make him believe we are near.", "The Art of War - by Sun Tzu"],
        ["To secure ourselves against defeat lies in our own hands, but the opportunity of defeating the enemy is provided by the enemy himself.", "The Art of War - by Sun Tzu"],
        ["But in building up this stupendous superstructure of modern civilization man has brought into being a society so intricate and complex that he now faces the new environmental problem of human relationships.", "How to Analyze People on Sight - by Elsie Lincoln Benedict and Ralph Paine Benedict"],
        ["Now our actions follow our thoughts. Every thought, however transitory, causes muscular action, which leaves its trace in that part of the physical organism which is most closely allied to it.", "How to Analyze People on Sight - by Elsie Lincoln Benedict and Ralph Paine Benedict"],
        ["The poor captain raised his eyes, and at one look the rum went out of him and left him staring sober. The expression of his face was not so much of terror as of mortal sickness. He made a movement to rise, but I do not believe he had enough force left in his body.", "Treasure Island - by Robert Louis Stevenson"],
        ["The tiger's roar filled the cave with thunder. Mother Wolf shook herself clear of the cubs and sprang forward, her eyes, like two green moons in the darkness, facing the blazing eyes of Shere Khan.", "The Jungle Book - by Rudyard Kipling"]
    ],
    getRandomParagraph = function() {
        /*
        * Return the array index of a random paragraph in the paragraphs array
        */
        return Math.round(Math.random()*(paragraphs.length - 1));
    },
    importParagraph = function() {
        /*
        * Import a random paragraph into the paragraph variable, and format it
        * with a space after each word.
        */
        
        //choose a random paragraph and split it into words
        var pIndex = getRandomParagraph(); //Paragraph index
        paragraph = paragraphs[pIndex][0].split(" ");
        paragraphLength = paragraph.length;
        for (var w = 0; w < paragraphLength - 1; w++) {
            //add a space to the end of each word
            paragraph[w] = paragraph[w] + " ";
        }
        bookTitle.innerHTML = paragraphs[pIndex][1];
    },
    generateStats = function() {
        /*
        * Update the stats around the typing area
        */
        var timeTaken = (Date.now() - startTime) / 1000, //time taken in seconds
            wpm = currentWord / (timeTaken / 60);
            
        //Set the time taken to 0.00 if undefined, or just the actual time taken
        //to 3 decimal places
        timeTakenCell.innerHTML = "Time taken: " + 
            ((timeTaken) ? timeTaken.toFixed(3) : "0.00") + " seconds";
        
        wordCountCell.innerHTML = "Words: " + paragraphLength;
        wpmCell.innerHTML = "WPM: " + ((wpm) ? wpm.toFixed(3) : "0.00");
    },
    generateOutput = function() {
        /*
        * Generate the output text including spans for highlighting text
        */
        //Anything before the current word is correct, style accordingly
        var text = "<span class='correct'>";
        for (var w = 0; w < paragraphLength; w++) {
            if (w === currentWord) {
                //we are up to the current word, highlight it differently
                text += "</span><span class='currentWord'>" + paragraph[w] +
                        "</span>";
            } else {
                //No need to change styles here, just add the words
                text += paragraph[w];
            }
        }
        
        //Place the updated text on the page
        textOutput.innerHTML = text;
    },
    checkCurrentWord = function() {
        /*
        * Check if the current word is correct, if it is, update the page
        */
        if (currentWord < paragraphLength && 
            getInput() == paragraph[currentWord]) { 
            //want it to go to one element past 
            //the last word to show the last word validated
            currentWord++;
            clearInput();
            generateOutput(); //update the text
            generateStats(); //update the stats
        }
    },
    clearResults = function() {
        /*
        * Reset the statistics
        */
        timeTakenCell.innerHTML = "";
        wordCountCell.innerHTML = "";
        wpmCell.innerHTML = "";
    },
    getInput = function() {
        return input.value;
    },
    clearInput = function() {
        input.value = "";
    },
    inputChanged = function() {
        /*
        * Called every time the input changes
        */
        if (active) {
            //If the application is active, check if the word typed is correct
            if (firstKey) {
                startTime = Date.now();
                firstKey = false;
            }
            checkCurrentWord();
        }
    },
    reset = function() {
        /*
        * Return all variables and elements back to their starting state
        */
        firstKey = true;
        currentWord = 0;
        startTime = undefined; //So that time displays 0.00
        clearInput();
        importParagraph();
        generateOutput();
        clearResults();
        generateStats();
        active = true;
    },
    init = function() {
        /*
        * Run automatically on page load.
        * Determine the elements and attach event handlers.
        */
        input = document.getElementById("typingInput");
        textOutput = document.getElementById("typingText");
        bookTitle = document.getElementById("bookTitle");
        timeTakenCell = document.getElementById("timeTaken");
        wordCountCell = document.getElementById("wordCount");
        wpmCell = document.getElementById("wpm");
        resetButton = document.getElementById("resetBtn");
        
        //Add event handlers
        if (document.addEventListener) { //Every browser other than IE
            input.addEventListener("input", inputChanged);
            resetButton.addEventListener("click", reset);
        } else { // ... IE
            input.attachEvent("oninput", inputChanged);
            resetButton.attachEvent("onclick", reset);
        }
        reset(); //Set up all variables to their initial state
    }();
}());