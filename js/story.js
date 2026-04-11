const storyData = [
    {
        shortText: "Eliza Is An Online Coffee Store That Offers The Widest Selection Of Specially Coffees And Teas From Around The World. From Medium-Dark Roast Single Origin To Flavored Espresso Beans, They Offer A Variety Of Ethically Sourced Products To Tantalize Any Customer's Palate. We are dedicated to providing the ultimate coffee experience through rigorous selection and expert roasting techniques that honor the bean's unique heritage.",
        fullText: "Eliza Is An Online Coffee Store That Offers The Widest Selection Of Specially Coffees And Teas From Around The World. From Medium-Dark Roast Single Origin To Flavored Espresso Beans, They Offer A Variety Of Ethically Sourced Products To Tantalize Any Customer's Palate. We believe that every bean has a story, and we are dedicated to bringing that story to your cup. Our journey began with a simple passion for the perfect roast, leading us to partner with sustainable farms across the globe. Today, we continue to innovate and refine our processes, ensuring that every sip of Eliza Coffee is a testament to quality, ethical sourcing, and the rich heritage of coffee making. From the high altitudes of Ethiopia to the volcanic soils of Colombia, we bring you the world's finest flavors.",
        link: "#"
    },
    {
        shortText: "For Those Looking For Unique Brewing Equipment, Eliza Also Carries A Full Range Of Quality Espresso Makers, Grinders, Brewers, And Accessories. Our Mission Is To Provide Every Coffee Enthusiast With The Perfect Tools To Create A Masterpiece At Home. We curate only the most durable and high-performing equipment to empower your daily brewing ritual.",
        fullText: "For Those Looking For Unique Brewing Equipment, Eliza Also Carries A Full Range Of Quality Espresso Makers, Grinders, Brewers, And Accessories. Our Mission Is To Provide Every Coffee Enthusiast With The Perfect Tools To Create A Masterpiece At Home. We understand that brewing the perfect cup is an art form, and every artist needs the right tools. That's why we meticulously curate our collection of equipment, testing every machine and accessory to ensure it meets our rigorous standards for performance and durability. Whether you're a seasoned barista or a curious beginner, Eliza provides the educational resources and expert support to help you master your craft.",
        link: "#"
    },
    {
        shortText: "Sustainability Is At The Heart Of Everything We Do. We Work Directly With Small-Scale Farmers To Ensure Fair Wages And Environmentally Friendly Practices. Every Cup Of Eliza Coffee Supports A Healthier Planet And A Stronger Global Coffee Community. We're committed to transparency and ethical practices that benefit both the producer and the planet.",
        fullText: "Sustainability Is At The Heart Of Everything We Do. We Work Directly With Small-Scale Farmers To Ensure Fair Wages And Environmentally Friendly Practices. Every Cup Of Eliza Coffee Supports A Healthier Planet And A Stronger Global Coffee Community. Our commitment to the earth goes beyond just fair trade. We invest in reforestation projects, minimize our carbon footprint through eco-friendly packaging, and support clean water initiatives in the coffee-growing regions. By choosing Eliza, you are participating in a cycle of respect and renewal. We believe that deep, rich flavors should never come at the cost of our environment. Together, we are roasting for a better future, one bean and one cup at a time.",
        link: "#"
    }
];

function initStorySlider() {
    const textElement = document.querySelector('.story-text');
    const dots = document.querySelectorAll('.story-dots .dot');
    const moreLink = document.querySelector('.story-more');
    if (!textElement || !dots.length) return;

    let currentIndex = 0;
    let timer = null;
    let isExpanded = false;

    function updateSlide(index) {
        if (timer) clearInterval(timer);
        
        dots.forEach(d => d.classList.remove('active'));
        if(dots[index]) dots[index].classList.add('active');

        if (window.gsap) {
            gsap.to(textElement, {
                opacity: 0,
                x: 10,
                duration: 0.3,
                onComplete: () => {
                    textElement.textContent = isExpanded ? storyData[index].fullText : storyData[index].shortText;
                    gsap.to(textElement, { opacity: 1, x: 0, duration: 0.3 });
                }
            });
        }

        currentIndex = index;
        if (!isExpanded) startTimer();
    }

    function startTimer() {
        if (isExpanded) return;
        timer = setInterval(() => {
            let nextIndex = (currentIndex + 1) % storyData.length;
            updateSlide(nextIndex);
        }, 5000);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index === currentIndex) return;
            updateSlide(index);
        });
    });

    if (moreLink) {
        moreLink.addEventListener('click', (e) => {
            e.preventDefault();
            const card = document.querySelector('.story-card');
            const title = document.querySelector('.story-title');
            const content = document.querySelector('.story-content');
            const imgWrap = document.querySelector('.story-image-wrap');

            if (!isExpanded) {
                isExpanded = true;
                if (timer) clearInterval(timer);

                // EXPAND
                gsap.to(card, { height: 550, width: "70%", justifyContent: "center", paddingRight: "0", duration: 0.8, ease: "expo.out" });
                gsap.to(title, { right: "50%", x: "50%", fontSize: "4.5rem", duration: 0.8, ease: "expo.out" });
                gsap.to(content, { alignItems: "center", maxWidth: "900px", duration: 0.8, ease: "expo.out" });
                gsap.to(textElement, { fontSize: "1.2rem", maxWidth: "900px", textAlign: "center", duration: 0.8, ease: "expo.out" });
                
                // Swap Text
                gsap.to(textElement, { opacity: 0, duration: 0.2, onComplete: () => {
                    textElement.textContent = storyData[currentIndex].fullText;
                    gsap.to(textElement, { opacity: 1, duration: 0.3 });
                }});

                gsap.to(imgWrap, { left: "50%", x: "-50%", opacity: 0.1, scale: 1.2, duration: 0.8, ease: "expo.out" });
                gsap.to(moreLink, { alignSelf: "center", marginTop: "1rem", marginBottom: "1rem", duration: 0.8 });
                
                moreLink.textContent = "Close";
            } else {
                isExpanded = false;

                // COLLAPSE back to CSS defaults
                gsap.to(card, { height: 320, width: "85%", justifyContent: "flex-end", paddingRight: "80px", duration: 0.8, ease: "expo.out" });
                gsap.to(title, { right: "80px", x: "0%", fontSize: "4rem", duration: 0.8, ease: "expo.out" });
                gsap.to(content, { alignItems: "flex-end", maxWidth: "600px", duration: 0.8, ease: "expo.out" });
                gsap.to(textElement, { fontSize: "1.05rem", maxWidth: "600px", textAlign: "justify", duration: 0.8, ease: "expo.out" });

                // Swap Back Text
                gsap.to(textElement, { opacity: 0, duration: 0.2, onComplete: () => {
                    textElement.textContent = storyData[currentIndex].shortText;
                    gsap.to(textElement, { opacity: 1, duration: 0.3 });
                }});

                gsap.to(imgWrap, { left: 20, x: 0, opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" });
                gsap.to(moreLink, { alignSelf: "flex-end", marginTop: "-2.5rem", marginBottom: "0", duration: 0.8 });
                
                moreLink.textContent = "More";
                startTimer();
            }
        });
    }

    startTimer();
}

window.initStorySlider = initStorySlider;
