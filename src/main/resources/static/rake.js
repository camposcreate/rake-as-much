var largeStrings; // +3 words
var mediumStrings; // 2 words
var smallStrings; // 1 words

function categorizeString(raw) {
    // iterate keyword data and categorize
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

function updateDisplay(data) {
    largeStrings = [];
    mediumStrings = [];
    smallStrings = [];

    categorizeString(data); // call function

    const display = document.getElementById('display');
    display.innerHTML = '';

    // display data
    if (data != null) {
        display.classList.add('keywords');
        display.innerHTML = `
            <p class='largeStrings'>${largeStrings.join(', ')}</p>
            <p class='mediumStrings'>${mediumStrings.join(', ')}</p>
            <p class='smallStrings'>${smallStrings.join(', ')}</p>
        `;
    }
}

function extractKeywords() {
    var input = document.getElementById('input').value.trim();
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