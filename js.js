/* =========================================
   LIFE IN PROGRESS
   JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       HEADER SCROLL EFFECT
    ========================================== */

    const header = document.querySelector(".site-header");

    function updateHeader() {
        if (window.scrollY > 30) {
            header.style.boxShadow = "0 8px 30px rgba(40, 40, 30, 0.05)";
        } else {
            header.style.boxShadow = "none";
        }
    }

    window.addEventListener("scroll", updateHeader);

    updateHeader();


    /* =========================================
       SMOOTH SCROLLING
    ========================================== */

    const internalLinks = document.querySelectorAll(
        <a href="relationships.html" style="display: block; padding: 30px; background: pink;">
    CLICK RELATIONSHIPS
</a>
       
    );

    internalLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                event.preventDefault();
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =========================================
       SCROLL REVEAL
    ========================================== */

    const revealElements = document.querySelectorAll(
        ".category-card, .article-card, .tools-box, .about-grid"
    );

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12
        }
    );


    revealElements.forEach((element, index) => {

        element.style.opacity = "0";

        element.style.transform = "translateY(25px)";

        element.style.transition =
            `opacity 0.7s ease ${index * 0.08}s,
             transform 0.7s ease ${index * 0.08}s`;

        observer.observe(element);

    });


    /* =========================================
       CATEGORY CARD PLACEHOLDER
    ========================================== */

    const categoryCards = document.querySelectorAll(
        ".category-card"
    );

    categoryCards.forEach(card => {

        card.addEventListener("click", event => {

            const link = card.getAttribute("href");

            if (link === "#") {

                event.preventDefault();

                const categoryName =
                    card.querySelector("h3")?.textContent.trim();

                console.log(
                    `${categoryName} section coming soon!`
                );

            }

        });

    });


    /* =========================================
       COMING SOON TOOL INTERACTION
    ========================================== */

    const toolItems = document.querySelectorAll(
        ".tool-item"
    );

    toolItems.forEach(tool => {

        tool.style.cursor = "pointer";

        tool.addEventListener("click", () => {

            const toolName =
                tool.querySelector("span:nth-child(2)")
                    ?.textContent.trim();

            alert(
                `${toolName} is coming soon! 🌱`
            );

        });

    });


    /* =========================================
       CURRENT YEAR
    ========================================== */

    const footerYear =
        document.querySelector(".footer-bottom p");

    if (footerYear) {

        footerYear.textContent =
            `© ${new Date().getFullYear()} Life in Progress`;

    }


    /* =========================================
       CONSOLE MESSAGE
    ========================================== */

    console.log(
        "%cLife in Progress 🌱",
        "font-size: 18px; font-weight: bold;"
    );

    console.log(
        "You're figuring it out. And that's okay."
    );

});