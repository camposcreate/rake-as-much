var largeStrings; // +5 words
var mediumStrings; // +3 words
var smallStrings; // <= 2 words

let globalUserData; // stores original data
let globalUpdatedData; // updated data
let indexValues; // stores indices for keywords
let keywordMap = new Map(); // initializes map
let keywordWithinSelf;
let keywordMappingWithSelf = new Map();

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

function displayTextWithMappings(text, mapping) {
    const updatedDisplay = document.getElementById('updatedData');
    updatedDisplay.innerHTML = '';

    let index = 0;
    let builder = '';

    for (let i = 0; i < text.length; i++) {
        if (index < indexValues.length && i === indexValues[index]) {
            if (builder.length > 0) {
                updatedDisplay.innerHTML += `
                    <p class='data'>${builder}</p>
                `;
                builder = '';
            }

            const keywordIndex = indexValues[index];
            const keyword = mapping.get(keywordIndex);
            const className = `key-${keywordIndex}`;
            updatedDisplay.innerHTML += `
                <p class='${className}'>${keyword}</p>
            `;

            // check if one keyword shares a smaller keyword within itself
            if (i + (keyword.length - 1) > indexValues[index+1]) {
                i = indexValues[index+1] - 1;
            } else {
                i += (keyword.length - 1);
            }
            index++; // proceeding keyword index
        } else if (text[i] === '\n') {
            builder += '<br>';
        } else {
            builder += text[i]; // build text
        }
    }
    // appends any remaining data
    if (builder) {
        updatedDisplay.innerHTML += `
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
function findKeywordLocation(text, keywordArray) {
    keywordArray.forEach((word) => {
        let index = text.indexOf(word);
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

    if (keywordsAsArray.length > 0) {
        const keywordsContainer = document.createElement('ul');
        keywordsContainer.classList.add('keywordsContainer');

        keywordsAsArray.forEach((item) => {
            const li = document.createElement("li");
            let index = globalUserData.indexOf(item);
            const className = `key-${index}`;
            li.textContent = item;
            li.classList.add(className);
            keywordsContainer.appendChild(li);
        });
        parent.appendChild(h1);
        parent.appendChild(keywordsContainer);
    }
}

function updateDisplay(data) {

    // initialize arrays as empty
    largeStrings = [];
    mediumStrings = [];
    smallStrings = [];

    categorizeString(data); // categorize based on number of words
    indexValues = []; // initialize array
    keywordWithinSelf = [];

    let count = 0; // associates num with string array (i.e., 0 == largeStrings, etc.)

    const display = document.getElementById('display');
    display.innerHTML = '';

    // creates headings, list elements, and class names for keywords
    createElementsForKeywords(largeStrings, display, count++);
    createElementsForKeywords(mediumStrings, display, count++);
    createElementsForKeywords(smallStrings, display, count++);

    count = 0;

    // locate the index of each keyword
    findKeywordLocation(globalUserData, largeStrings);
    findKeywordLocation(globalUserData, mediumStrings);
    findKeywordLocation(globalUserData, smallStrings);

    // sorts in ascending order
    indexValues.sort(compareFunction);

    displayTextWithMappings(globalUserData, keywordMap);
}

function extractKeywords() {

    let input = document.getElementById('input').value.trim();
    globalUserData = '';
    globalUserData = input;

    // clear any pre/existing data
    keywordMap.clear();
    keywordMappingWithSelf.clear();

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