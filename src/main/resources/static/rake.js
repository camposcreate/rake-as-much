var largeStrings; // +5 words
var mediumStrings; // +3 words
var smallStrings; // <= 2 words

let globalUserData; // original data
let globalUpdatedData; // updated data
let indexValues; // keyword index
let keywordMap = new Map();

function compareFunction(a, b) {
    return a - b;
}

function addEventListenersToHover() {
    indexValues.forEach(indexValue => {
        const elements = document.querySelectorAll(`.key-${indexValue}`);
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                elements.forEach(el => el.classList.add('highlight'));
            });
            element.addEventListener('mouseleave', () => {
                elements.forEach(el => el.classList.remove('highlight'));
            });
        });
    });
}

function displayTextWithMappings(text, values, mapping) {
    const updatedDisplay = document.getElementById('updatedData');
    updatedDisplay.innerHTML = '';

    let index = 0;
    let builder = '';

    for (let i = 0; i < text.length; i++) {
        console.log('Are they equal: ', i);
        console.log('to: ', values[index]);
        if (index < values.length && i === values[index]) {

            if (builder.length > 0) {
                updatedDisplay.innerHTML += `
                    <p class='data'>${builder}</p>
                `;
                builder = ''; // clear builder
            }

            const keywordIndex = values[index];
            const keyword = mapping.get(keywordIndex);
            const className = `key-${keywordIndex}`;
            updatedDisplay.innerHTML += `
                <p class='${className}'>${keyword}</p>
            `;
            console.log('Length of keyword: ', keyword.length)

            // check if one keyword shares a smaller keyword within
            if (i + (keyword.length - 1) > values[index+1]) {
                i = values[index+1] - 1;
            } else {
                i += (keyword.length - 1);
            }

            console.log('This is the calculated index for next position: ', i);
            index++; // increment proceeding keyword index
        } else if (text[i] === '\n') {
            builder += '<br>';
        } else {
            builder += text[i]; // build
            console.log('Incrementing counter: ', i);
        }
    }
    if (builder) {
        updatedDisplay.innerHTML += `
            <p class='data'>${builder}</p>
        `;
    }
    addEventListenersToHover();
}

// iterate keyword data and categorize (large, medium, small)
function categorizeString(raw) {
    raw.forEach((curr) => {
        if (curr.trim().split(/\s+/).length >= 5) {
            largeStrings.push(curr);
        } else if (curr.trim().split(/\s+/).length >= 3) {
            mediumStrings.push(curr);
        } else {
            smallStrings.push(curr);
        }
    });
}

// map keywords with location index --> [keyword, index]
function findKeywordLocation(text, keywordArray) {
    keywordArray.forEach((word) => {
        let index = text.indexOf(word);
        if (index !== -1 && !indexValues.includes(index)) {
            indexValues.push(index);
            keywordMap.set(index, word);
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

    categorizeString(data); // categorize based on number of words
    keywordMap.clear(); // clear any pre/existing data
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
            let index = globalUserData.indexOf(large);
            const className = `key-${index}`;
            li.textContent = large;
            li.classList.add(className);
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
            let index = globalUserData.indexOf(medium);
            const className = `key-${index}`;
            li.textContent = medium;
            li.classList.add(className);
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
            let index = globalUserData.indexOf(small);
            const className = `key-${index}`;
            li.textContent = small;
            li.classList.add(className);
            smallContainer.appendChild(li);
        });
        display.appendChild(h1Small);
        display.appendChild(smallContainer);
    }
    findKeywordLocation(globalUserData, largeStrings);
    findKeywordLocation(globalUserData, mediumStrings);
    findKeywordLocation(globalUserData, smallStrings);

    indexValues.sort(compareFunction);

    displayTextWithMappings(globalUserData, indexValues, keywordMap);
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

    //printUserInput(input);

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