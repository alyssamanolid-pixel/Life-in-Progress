


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://rcdkiroxodhmvlpuandc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1VJIGrfwRm-EioKU2XhwzQ_A1Wyen_l";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================
   DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =========================================
       HEADER SCROLL EFFECT
    ========================================== */

    const header =
        document.querySelector(".site-header");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 30) {

            header.style.boxShadow =
                "0 8px 30px rgba(40, 40, 30, 0.05)";

        } else {

            header.style.boxShadow = "none";

        }

    }

    window.addEventListener(
        "scroll",
        updateHeader
    );

    updateHeader();


    /* =========================================
       SMOOTH SCROLLING
    ========================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    internalLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    event.preventDefault();

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


    /* =========================================
       SCROLL REVEAL
    ========================================== */

    const revealElements =
        document.querySelectorAll(
            ".category-card, .article-card, .tools-box, .about-grid"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.style.opacity =
                                    "1";

                                entry.target.style.transform =
                                    "translateY(0)";

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            (element, index) => {

                element.style.opacity =
                    "0";

                element.style.transform =
                    "translateY(25px)";

                element.style.transition =
                    `opacity 0.7s ease ${index * 0.08}s,
                     transform 0.7s ease ${index * 0.08}s`;

                observer.observe(
                    element
                );

            }
        );

    }


    /* =========================================
       CATEGORY CARD PLACEHOLDER
    ========================================== */

    const categoryCards =
        document.querySelectorAll(
            ".category-card"
        );


    categoryCards.forEach(card => {

        card.addEventListener(
            "click",
            event => {

                const link =
                    card.getAttribute("href");


                if (link === "#") {

                    event.preventDefault();


                    const categoryName =
                        card.querySelector("h3")
                            ?.textContent
                            .trim();


                    console.log(
                        `${categoryName} section coming soon!`
                    );

                }

            }
        );

    });


    /* =========================================
       COMING SOON TOOL INTERACTION
    ========================================== */

    const toolItems =
        document.querySelectorAll(
            ".tool-item"
        );


    toolItems.forEach(tool => {

        tool.style.cursor =
            "pointer";


        tool.addEventListener(
            "click",
            () => {

                const toolName =
                    tool.querySelector(
                        "span:nth-child(2)"
                    )?.textContent.trim();


                alert(
                    `${toolName} is coming soon! 🌱`
                );

            }
        );

    });


    /* =========================================
       CURRENT YEAR
    ========================================== */

    const footerYear =
        document.querySelector(
            ".footer-bottom p"
        );


    if (footerYear) {

        footerYear.textContent =
            `© ${new Date().getFullYear()} Life in Progress`;

    }


    /* =========================================
       TELL ME ABOUT IT
    ========================================== */

    const storyForm =
        document.querySelector(
            "#story-form"
        );


    if (storyForm) {

        storyForm.addEventListener(
            "submit",
            handleStorySubmission
        );

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


/* =========================================
   TELL ME ABOUT IT — SUBMISSION
========================================= */

async function handleStorySubmission(event) {
    event.preventDefault();

    const storyForm = event.currentTarget;

    const topic =
        document.querySelector("#story-topic").value;

    const message =
        document.querySelector("#story-message").value.trim();

    const name =
        document.querySelector("#story-name").value.trim();

    const anonymous =
        document.querySelector("#story-anonymous").checked;

    const status =
        document.querySelector("#story-status");

    const submitButton =
        storyForm.querySelector(".story-submit");

    if (!topic || !message) {
        status.textContent =
            "Please choose a topic and write your story.";

        status.classList.add("error");
        return;
    }

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "…";

    status.classList.remove("error");
    status.textContent = "Sending your story...";

    try {
        const {
            data,
            error
        } = await supabaseClient.rpc(
            "create_visitor_conversation",
            {
                p_topic: topic,
                p_visitor_name: name || null,
                p_is_anonymous: anonymous,
                p_message: message
            }
        );

        if (error) {
            throw error;
        }

        const conversation = data[0];

        localStorage.setItem(
            "lifeInProgressConversationToken",
            conversation.access_token
        );

        status.textContent =
            "It's been heard. ♡ Thanks for leaving a little piece of your story here.";

        storyForm.reset();

        document.querySelector(
            "#story-anonymous"
        ).checked = true;

        submitButton.disabled = false;
        submitButton.querySelector("span").textContent = "→";

        console.log(
            "Conversation created successfully:",
            conversation.conversation_id
        );

        console.log(
            "Private conversation token saved."
        );

    } catch (error) {
        console.error(
            "Story submission error:",
            error
        );

        status.textContent =
            "Something went wrong while sending your story. Please try again.";

        status.classList.add("error");

        submitButton.disabled = false;
        submitButton.querySelector("span").textContent = "→";
    }
}

