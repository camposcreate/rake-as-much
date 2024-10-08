const largeKeywordScore = document.getElementById('largeSlide');
const mediumKeywordScore = document.getElementById('mediumSlide');
const smallKeywordScore = document.getElementById('smallSlide');
const editableDiv = document.getElementById('textarea');
const charCounter = document.getElementById('character-counter');
const extractBtn = document.getElementById('extract');
const resetBtn = document.getElementById('reset');

// navigating slides
function navigateSlide(large, medium, small) {
    if (large > 0) {
        document.getElementById('slide1').checked = true;
    } else if (medium > 0) {
        document.getElementById('slide2').checked = true;
    } else if (small > 0) {
        document.getElementById('slide3').checked = true;
    } else {
        document.getElementById('slide1').checked = true;
    }
}

// focus keyword within the textarea
function scrollToKeyword(classname) {
    const textarea = document.getElementById('textarea');
    const targetSpan = textarea.querySelector(classname);
    const spanRect = targetSpan.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    const offsetTop = spanRect.top - textareaRect.top + textarea.scrollTop;
    const offsetLeft = spanRect.left - textareaRect.left + textarea.scrollLeft;
    textarea.scrollTo({
        top: offsetTop,
        left: offsetLeft,
        behavior: 'smooth'
    });
}

// highlight keywords when clicked
function addEventListenersToClick(indexValues) {
    indexValues.forEach(indexValue => {
        const elements = document.querySelectorAll(`.key-${indexValue}`);
        elements.forEach(element => {
            element.addEventListener('click', () => {
                document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
                elements.forEach(el => el.classList.add('clicked'));
                scrollToKeyword(`.key-${indexValue}`); // scroll to function
            });
        });
    });
}

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
    const displayText = document.getElementById('textarea');
    displayText.innerHTML = '';

    let index = 0;
    let builder = '';

    for (let i = 0; i < inputText.length; i++) {
        let prev = inputText[i-1];
        if ((index < indexValues.length) && (i === indexValues[index])) {
            if (builder.length > 0) {
                displayText.innerHTML += `
                    <span class='data'>${builder}</span>
                `;
                builder = '';
            }

            const keywordIndex = indexValues[index];
            const keyword = mapping.get(keywordIndex);
            const className = `key-${keywordIndex}`;
            displayText.innerHTML += `
                <span class='${className}'>${keyword}</span>
            `;
            i += (keyword.length - 1);
            index++; // proceeding keyword index
        } else if (inputText[i] === '\n' && prev !== '\n') {
            builder += '<br><br>';
        } else {
            builder += inputText[i]; // build text
        }
    }
    // appends any remaining data
    if (builder) {
        displayText.innerHTML += `
            <span class='data'>${builder}</span>
        `;
    }
    addEventListenersToHover(indexValues);
    addEventListenersToClick(indexValues);
}

function compareFunction(a, b) {
    return a - b;
}

// creates mapping of location index with its keyword
// (i.e., [index, keyword])
function findKeywordLocation(keywordArray, inputText, indexValues, keywordMap, reverseMap) {
    let processedRanges = [];
    keywordArray.forEach((word) => {
        let startIndex = 0;
        while (true) {
            let index = inputText.indexOf(word, startIndex);
            if (index === -1) break;

            let endIndex = index + word.length;
            let overlap = false;

            // check for overlap with previously processed keyword(s)
            for (let range of processedRanges) {
                if ((index >= range[0] && index < range[1]) ||
                    (endIndex > range[0] && endIndex <= range[1])) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                indexValues.push(index);
                keywordMap.set(index, word);
                reverseMap.set(word, index);
                processedRanges.push([index, endIndex]);
            }
            startIndex = index + 1;
        }
    });
}

// array type(s) given their own container
// --> keywords are assigned classes (i.e., `key-${index-parameter}`)
function createElementsForKeywords(keywordsAsArray, indexValues, keywordMap, reverseMap, arrSelector) {

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
            let index = reverseMap.get(item);
            const className = `key-${index}`;
            li.textContent = item;
            li.classList.add(className);
            keywordsContainer.appendChild(li);
        });

        if (arrSelector === 0) {
            largeKeywordScore.appendChild(keywordsContainer);
        } else if (arrSelector === 1) {
            mediumKeywordScore.appendChild(keywordsContainer);
        } else {
            smallKeywordScore.appendChild(keywordsContainer);
        }
    }
}

// iterate keywords and categorize according to word size
// i.e., large, medium, small
function categorizeString(indexValues, keywordMap, large, medium, small) {
    indexValues.forEach((index) => {
        let keyword = keywordMap.get(index);
        if (keyword.trim().split(/\s+/).length >= 5) {
            large.push(keyword);
        } else if (keyword.trim().split(/\s+/).length >= 3) {
            medium.push(keyword);
        } else {
            small.push(keyword);
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

    // initialize maps
    let keywordMap = new Map();
    let reverseMap = new Map();

    // re-assign for local scope
    let userInputText = inputRawData;

    let count = 0; // selects string array (i.e., 0 == largeStrings, etc.)

    // locate the index of each keyword --> create [key, value] pairs
    findKeywordLocation(data, userInputText, indexValues, keywordMap, reverseMap);

    // categorize based on number of words
    categorizeString(indexValues, keywordMap, largeStrings, mediumStrings, smallStrings);

    // creates headings, list elements, and class names for keywords
    createElementsForKeywords(largeStrings, indexValues, keywordMap, reverseMap, count++);
    createElementsForKeywords(mediumStrings, indexValues, keywordMap, reverseMap, count++);
    createElementsForKeywords(smallStrings, indexValues, keywordMap, reverseMap, count++);

    // navigate to non-empty slide
    navigateSlide(largeStrings.length, mediumStrings.length, smallStrings.length);

    // sorts in ascending order
    indexValues.sort(compareFunction);

    // front end
    displayTextWithMappings(keywordMap, userInputText, indexValues);
}

// listen for text
editableDiv.addEventListener('keyup', function() {
    var value = editableDiv.innerText;
    charCounter.textContent = `${0 + value.length}/10000`;
    if (value != "" && value.length <= 10000) {
        extractBtn.disabled = false;
        resetBtn.disabled = false;
        charCounter.style.color = "#121220"; // black
    } else {
        extractBtn.disabled = true;
        charCounter.style.color = "#fd353c"; // red
    }
})
extractBtn.addEventListener('click', function() {
    extractBtn.disabled = true;
});
// clear textarea
resetBtn.addEventListener('click', function() {
    let input = document.getElementById('textarea');
    input.innerHTML = '';
    charCounter.textContent = `0/10000`;
    charCounter.style.color = "#121220";

    // clear pre/existing mappings
    largeKeywordScore.innerHTML = '';
    mediumKeywordScore.innerHTML = '';
    smallKeywordScore.innerHTML = '';

    extractBtn.disabled = true;
    resetBtn.disabled = true;
    document.getElementById('slide1').checked = true;

    skeleton();
});

// fetch data
function extractKeywords() {
    // stores raw data
    let input = document.getElementById('textarea').innerText.trim();

    // clear pre/existing mappings
    largeKeywordScore.innerHTML = '';
    mediumKeywordScore.innerHTML = '';
    smallKeywordScore.innerHTML = '';

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
skeleton();