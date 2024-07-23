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
    // clear arrays if re-submit
    largeStrings = [];
    mediumStrings = [];
    smallStrings = [];

    categorizeString(data); // are keywords 1, 2, or 3+ words
    //addClasses(); // add class to each keyword

    const display = document.getElementById('display');
    display.innerHTML = '';

    // display data
    if (data != null) {
        display.classList.add('keywords');
            const largeContainer = document.createElement('ul');
            largeContainer.classList.add('largeContainer');

            largeStrings.forEach((large) => {
                const li = document.createElement("li");
                li.textContent = large;
                li.classList.add('hoverable');
                largeContainer.appendChild(li);
            });

            // medium keywords list
            const mediumContainer = document.createElement('ul');
            mediumContainer.classList.add('mediumContainer');

            mediumStrings.forEach((medium) => {
                const li = document.createElement("li");
                li.textContent = medium;
                li.classList.add('hoverable');
                largeContainer.appendChild(li);
            });

        display.appendChild(largeContainer, mediumContainer);
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