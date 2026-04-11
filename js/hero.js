// Register Plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

function initHero() {
    const el = document.querySelector('.hero-title');
    if (!el) return;
    
    // Configuration adapted from your request
    const config = {
        delay: 50,
        duration: 1.25,
        ease: "power3.out",
        from: { opacity: 0, y: 80, filter: "blur(15px)" }, 
        to: { opacity: 1, y: 0, filter: "blur(0px)" },
        threshold: 0.1,
        rootMargin: "-100px"
    };

    // Create the SplitText instance
    const splitInstance = new SplitText(el, {
        type: "chars",
        charsClass: "split-char"
    });

    // Execute the Animation immediately for Hero
    gsap.fromTo(splitInstance.chars, 
        { 
            ...config.from 
        }, 
        {
            ...config.to,
            duration: config.duration,
            ease: config.ease,
            stagger: config.delay / 1000,
            onComplete: () => {
                console.log('Hero text animation complete!');
            }
        }
    );
}

// Global initialization
window.initHero = initHero;
