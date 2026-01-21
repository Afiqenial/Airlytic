(function() {
    // create the loader overlay
    const overlay = document.createElement('div');
    overlay.id = 'loader-overlay';
    
    // create text
    const text = document.createElement('div');
    text.className = 'loader-text';
    text.textContent = 'Loading...';
    overlay.appendChild(text);

    // create bubbles container
    const bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'bubbles-container';
    
    // generate bubbles
    const bubbleCount = 20;
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'loader-bubble';
        
        // Randomize bubble properties
        const size = Math.random() * 40 + 10; // 10px to 50px
        const left = Math.random() * 100; // 0% to 100%
        const duration = Math.random() * 3 + 4; // 4s to 7s
        const delay = Math.random() * 5; // 0s to 5s
        const wobble = (Math.random() - 0.5) * 50; // -25px to 25px horizontal shift

        bubble.style.setProperty('--size', `${size}px`);
        bubble.style.setProperty('--left', `${left}%`);
        bubble.style.setProperty('--duration', `${duration}s`);
        bubble.style.setProperty('--delay', `${delay}s`);
        bubble.style.setProperty('--wobble', `${wobble}px`);
        
        bubblesContainer.appendChild(bubble);
    }
    
    overlay.appendChild(bubblesContainer);
    document.body.appendChild(overlay);

    // Hide loader after page load + minimum delay
    window.addEventListener('load', () => {
        const minTime = 1500; // minimum generic waiting time for effect (1.5s)
        const start = performance.now();
        
        // Ensure we wait at least minTime from now? 
        // Or actually, simplistic approach: set timeout
        
        setTimeout(() => {
            overlay.classList.add('loader-hidden');
            // Remove from DOM after transition to clean up
            setTimeout(() => {
                overlay.remove();
            }, 600); // 0.5s transition + buffer
        }, minTime); 
    });
})();
