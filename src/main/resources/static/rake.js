const display = document.getElementById('displayKeywords');

// highlight keywords when hover
function addEventListenersToHover(indexValues) {
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
function displayTextWithMappings(mapping, inputText, indexValues) {
    const displayText = document.getElementById('displayWithMappings');
    displayText.innerHTML = '';

    let index = 0;
    let builder = '';

    for (let i = 0; i < inputText.length; i++) {
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

        } else if (inputText[i] === '\n') {
            builder += '<br>';
        } else {
            builder += inputText[i]; // build text
        }
    }
    // appends any remaining data
    if (builder) {
        displayText.innerHTML += `
            <p class='data'>${builder}</p>
        `;
    }

    addEventListenersToHover(indexValues);
}

function compareFunction(a, b) {
    return a - b;
}

// creates mapping of location index with its keyword
// (i.e., [index, keyword])
function findKeywordLocation(keywordArray, inputText, indexValues, keywordMap, keywordWithinSelf, keywordMappingWithSelf) {
    keywordArray.forEach((word) => {
        let index = inputText.indexOf(word);
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


// array type(s) given their own container
// --> keywords are assigned classes (i.e., `key-${index-parameter}`)
function createElementsForKeywords(keywordsAsArray, inputText, arrSelector) {

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
        let prev = 0;
        keywordsAsArray.forEach((item) => {
            const li = document.createElement("li");
            let index = inputText.indexOf(item);
            if (index !== prev) {
                const className = `key-${index}`;
                li.textContent = item;
                li.classList.add(className);
                keywordsContainer.appendChild(li);
            }
            prev = index;
        });
        display.appendChild(h1);
        display.appendChild(keywordsContainer);
    }
}

// iterate keywords and categorize according to word size
// i.e., large, medium, small
function categorizeString(keywords, large, medium, small) {
    keywords.forEach((curr) => {
        if (curr.trim().split(/\s+/).length >= 5) {
            large.push(curr);
        } else if (curr.trim().split(/\s+/).length >= 3) {
            medium.push(curr);
        } else {
            small.push(curr);
        }
    });
}

// main function
// --> initializes methods and calls functions for front end
function keywordsDisplay(data, inputRawData) {

    // initialize arrays
    let largeStrings = []; // +5 words
    let mediumStrings = []; // +3 words
    let smallStrings = []; // <= 2 words
    let indexValues = []; // stores indices for keywords
    let keywordWithinSelf = []; // stores keywords within keywords

    // initialize maps
    let keywordMap = new Map();
    let keywordMappingWithSelf = new Map();

    // re-assign for local scope
    let userInputText = inputRawData;

    // categorize based on number of words
    categorizeString(data, largeStrings, mediumStrings, smallStrings);

    let count = 0; // selects string array (i.e., 0 == largeStrings, etc.)

    // creates headings, list elements, and class names for keywords
    createElementsForKeywords(largeStrings, userInputText, count++);
    createElementsForKeywords(mediumStrings, userInputText, count++);
    createElementsForKeywords(smallStrings, userInputText, count++);

    // locate the index of each keyword --> create [key, value] pairs
    findKeywordLocation(largeStrings, userInputText, indexValues, keywordMap, keywordWithinSelf, keywordMappingWithSelf);
    findKeywordLocation(mediumStrings, userInputText, indexValues, keywordMap, keywordWithinSelf, keywordMappingWithSelf);
    findKeywordLocation(smallStrings, userInputText, indexValues, keywordMap, keywordWithinSelf, keywordMappingWithSelf);

    // sorts in ascending order
    indexValues.sort(compareFunction);

    // front end
    displayTextWithMappings(keywordMap, userInputText, indexValues);
}

function extractKeywords() {

    // stores original data
    let input = document.getElementById('input').value.trim();

    // clear pre/existing mappings
    display.innerHTML = '';

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
        keywordsDisplay(data, input);
    })
    .catch(error => {
        console.error('Problem with fetching:', error);
    });
}