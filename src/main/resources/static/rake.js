let largeStrings; // +5 words
let mediumStrings; // +3 words
let smallStrings; // <= 2 words

let globalInputData; // stores original data
let indexValues; // stores indices for keywords
let keywordMap = new Map(); // initializes map
let keywordWithinSelf;
let keywordMappingWithSelf = new Map();

// highlight keywords when hover
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

// reconstruct input data with keyword mappings
// --> give keywords event listeners and display
function displayTextWithMappings(mapping) {
    const displayText = document.getElementById('displayWithMappings');
    displayText.innerHTML = '';

    let index = 0;
    let builder = '';

    for (let i = 0; i < globalInputData.length; i++) {
        if (index < indexValues.length && i === indexValues[index]) {
            if (builder.length > 0) {
                displayText.innerHTML += `
                    <p class='data'>${builder}</p>
                `;
                builder = '';
            }

            const keywordIndex = indexValues[index];
            const keyword = mapping.get(keywordIndex);
            const className = `key-${keywordIndex}`;
            displayText.innerHTML += `
                <p class='${className}'>${keyword}</p>
            `;

            // check if one keyword shares a smaller keyword within itself
            if (i + (keyword.length - 1) > indexValues[index+1]) {
                i = indexValues[index+1] - 1;
            } else {
                i += (keyword.length - 1);
            }
            index++; // proceeding keyword index

        } else if (globalInputData[i] === '\n') {
            builder += '<br>';
        } else {
            builder += globalInputData[i]; // build text
        }
    }
    // appends any remaining data
    if (builder) {
        displayText.innerHTML += `
            <p class='data'>${builder}</p>
        `;
    }

    addEventListenersToHover();
}

// iterate keywords and categorize according to word size
// i.e., large, medium, small
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

function compareFunction(a, b) {
    return a - b;
}

// creates mapping of location index with its keyword
// (i.e., [index, keyword])
function findKeywordLocation(keywordArray) {
    keywordArray.forEach((word) => {
        let index = globalInputData.indexOf(word);
        if (index !== -1 && !indexValues.includes(index)) {
            indexValues.push(index);
            keywordMap.set(index, word);
        } else {
            // for duplicates (i.e., keywords that share same index)
            keywordWithinSelf.push(index);
            keywordMappingWithSelf.set(index, word);
        }
    });
}

// array type(s) are given their own container
// --> keywords are assigned classes (i.e., `key-${index-parameter}`)
function createElementsForKeywords(keywordsAsArray, parent, arrSelector) {

    // headings
    let h1 = document.createElement('h1');
    if (arrSelector == 0) {
        h1.textContent = 'Large Keywords';
    } else if (arrSelector == 1) {
        h1.textContent = 'Medium Keywords';
    } else {
        h1.textContent = 'Small Keywords';
    }

    // adds class to each keyword
    if (keywordsAsArray.length > 0) {
        const keywordsContainer = document.createElement('ul');
        if (arrSelector == 0) {
                keywordsContainer.classList.add('largeKeywords');
            } else if (arrSelector == 1) {
                keywordsContainer.classList.add('mediumKeywords');
            } else {
                keywordsContainer.classList.add('smallKeywords');
            }

        keywordsAsArray.forEach((item) => {
            const li = document.createElement("li");
            let index = globalInputData.indexOf(item);
            const className = `key-${index}`;
            li.textContent = item;
            li.classList.add(className);
            keywordsContainer.appendChild(li);
        });
        parent.appendChild(h1);
        parent.appendChild(keywordsContainer);
    }
}

// main function
// --> initializes methods and calls functions for front end
function keywordsDisplay(data) {

    // initialize arrays as empty
    largeStrings = [];
    mediumStrings = [];
    smallStrings = [];

    categorizeString(data); // categorize based on number of words
    indexValues = []; // initialize array
    keywordWithinSelf = [];

    let count = 0; // associates num with string array (i.e., 0 == largeStrings, etc.)

    const display = document.getElementById('displayKeywords');
    display.innerHTML = '';

    // creates headings, list elements, and class names for keywords
    createElementsForKeywords(largeStrings, display, count++);
    createElementsForKeywords(mediumStrings, display, count++);
    createElementsForKeywords(smallStrings, display, count++);

    count = 0;

    // locate the index of each keyword
    findKeywordLocation(largeStrings);
    findKeywordLocation(mediumStrings);
    findKeywordLocation(smallStrings);

    // sorts in ascending order
    indexValues.sort(compareFunction);

    displayTextWithMappings(keywordMap);
}

function extractKeywords() {

    globalInputData = '';
    globalInputData = document.getElementById('input').value.trim();

    // clear pre/existing mappings
    keywordMap.clear();
    keywordMappingWithSelf.clear();

    fetch('/api/extractKeywords', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: globalInputData })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error('Error extracting keywords: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        keywordsDisplay(data);
    })
    .catch(error => {
        console.error('Problem with fetching:', error);
    });
}