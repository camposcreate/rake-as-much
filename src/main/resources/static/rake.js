function updateDisplay(data) {
    const display = document.getElementById('display');
    display.innerHTML = '';

    if (data != null) {
        display.classList.add('keywords');
        display.innerHTML = `
            <p class='result'>${data.join(', ')}</p>
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