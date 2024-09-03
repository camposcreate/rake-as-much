document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('textarea');
    const lines = [
        "RAKE as much?",
        "...optimize content, drive engagement, and become discoverable.",
        "",
        "Paste or begin typing here..."
    ];

    let typingContainer;

    // create typing animation
    function createTypingContainer() {
        typingContainer = document.createElement('div');
        typingContainer.className = 'typing-container';

        // line(s) each with typing animation
        function createLineElement(line, delay, isLastLine) {
            const span = document.createElement('span');
            span.textContent = line;
            span.className = 'typing-line';
            span.style.visibility = 'hidden';

            span.style.animation = `typing 2s steps(${line.length*2}), cursor .5s step-end infinite alternate`;
            span.style.animationDelay = `${delay}s`;

            setTimeout(() => {
                span.style.visibility = 'visible';
            }, delay * 1000);

            if (!isLastLine) {
                span.addEventListener('animationend', function() {
                    this.style.borderRight = 'none';
                });
            }

            typingContainer.appendChild(span);
            typingContainer.appendChild(document.createElement('br'));
        }

        lines.forEach((line, index) => {
            const delay = index * 1; // Adjust delay as needed (2.5s is just an example)
            const isLastLine = index === lines.length - 1;
            createLineElement(line, delay, isLastLine);
        });

        textarea.style.position = 'relative';
        textarea.parentElement.appendChild(typingContainer);
    }

    // reset and recreate typing animation
    function restartAnimation() {
        if (typingContainer) {
            typingContainer.remove(); // remove existing container
        }
        createTypingContainer(); // recreate typing container
        typingContainer.style.display = 'block';
    }

    // animation based on textarea events
    textarea.addEventListener('focus', function() {
        typingContainer.style.display = 'none';
    });

    textarea.addEventListener('blur', function() {
        if (!this.textContent.trim()) {
            restartAnimation(); // restart animation if no text
        }
    });

    // initialize typing animation if textarea is empty on page load
    if (!textarea.textContent.trim()) {
        createTypingContainer();
    }
});