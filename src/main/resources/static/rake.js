var largeStrings; // +3 words
var mediumStrings; // 2 words
var smallStrings; // 1 words

let globalUserData;
let keywordMap = new Map();
let indexValues;

function compareFunction(a, b) {
    return a - b;
}
/*
function displayTextWithMappings(text, mapping) {

}*/

// iterate keyword data and categorize (large, medium, small)
function categorizeString(raw) {
    raw.forEach((curr) => {
        if (curr.trim().split(/\s+/).length >= 3) {
            largeStrings.push(curr);
        } else if (curr.trim().split(/\s+/).length === 2) {
            mediumStrings.push(curr);
        } else {
            smallStrings.push(curr);
        }
    });
}

// map keywords with location index --> [string, int]
function findKeywordLocation(text, keywordArray) {
    keywordArray.forEach((word) => {
        let index = text.indexOf(word);
        if (index !== -1) {
            keywordMap.set(word, index);
            indexValues.push(index);
            console.log(`The location of keyword "${word}" is at index "${index}".`);
        } else {
            console.log(`The location of keyword "${word}" was not found.`);
        }
    });
}

function updateDisplay(data) {

    // initialize arrays as empty
    largeStrings = [];
    mediumStrings = [];
    smallStrings = [];

    categorizeString(data); // are keywords 1, 2, or 3+ words?
    keywordMap.clear(); // clear any pre-existing data

    indexValues = [];

    const display = document.getElementById('display');
    display.innerHTML = '';

    // large keywords list
    if (largeStrings.length > 0) {
        var h1Large = document.createElement('h1');
        h1Large.textContent = 'Large Keywords';

        const largeContainer = document.createElement('ul');
        largeContainer.classList.add('largeContainer');

        largeStrings.forEach((large) => {
            const li = document.createElement("li");
            li.textContent = large;
            li.classList.add('hoverable');
            largeContainer.appendChild(li);
        });
        display.appendChild(h1Large);
        display.appendChild(largeContainer);
    }

    // medium keywords list
    if (mediumStrings.length > 0) {
        var h1Medium = document.createElement('h1');
        h1Medium.textContent = 'Medium Keywords';

        const mediumContainer = document.createElement('ul');
        mediumContainer.classList.add('mediumContainer');

        mediumStrings.forEach((medium) => {
            const li = document.createElement("li");
            li.textContent = medium;
            li.classList.add('hoverable');
            mediumContainer.appendChild(li);
        });
        display.appendChild(h1Medium);
        display.appendChild(mediumContainer);
    }

    // small keywords list
    if (smallStrings.length > 0) {
        var h1Small = document.createElement('h1');
        h1Small.textContent = 'Small Keywords';

        const smallContainer = document.createElement('ul');
        smallContainer.classList.add('smallContainer');

        smallStrings.forEach((small) => {
            const li = document.createElement("li");
            li.textContent = small;
            li.classList.add('hoverable');
            smallContainer.appendChild(li);
        });
        display.appendChild(h1Small);
        display.appendChild(smallContainer);
    }
    findKeywordLocation(globalUserData, largeStrings);
    findKeywordLocation(globalUserData, mediumStrings);
    indexValues.sort(compareFunction);

    //displayTextWithMappings(globalUserData, keywordMap);
}

function printUserInput(userInput) {
    const userInputDisplay = document.getElementById('userDisplay');
    userInputDisplay.innerHTML = '';

    if (userInputDisplay != null) {
        userInputDisplay.innerHTML = `
            <p class='userInputData'>${userInput}</p>
        `;
    }
}

function extractKeywords() {

    var input = document.getElementById('input').value.trim();
    globalUserData = '';
    globalUserData = input;

    printUserInput(input);

    fetch('/api/extractKeywords', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: input })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error('Error extracting keywords: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        updateDisplay(data);
    })
    .catch(error => {
        console.error('Problem with fetching:', error);
    });
}