/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://rcdkiroxodhmvlpuandc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1VJIGrfwRm-EioKU2XhwzQ_A1Wyen_l";

const VAPID_PUBLIC_KEY =
    "BDHltiirE_2alLUT0RW4HUP1pmCkEI8Iu2kqzmNPLYTHByvhVGlQz1BmY4MHG8U49VBjcySsDA3Gdbn3Nnxc46k";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================
   GLOBAL STATE
========================================= */

let currentConversationToken =
    localStorage.getItem(
        "lifeInProgressConversationToken"
    );

let currentConversationId = null;

let knownMessageIds = new Set();

let conversationPoller = null;


/* =========================================
   DOM READY
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =========================================
           SERVICE WORKER
        ========================================== */

        if ("serviceWorker" in navigator) {

            try {

                await navigator.serviceWorker.register(
    "/Life-in-Progress/sw.js",
    { scope: "/Life-in-Progress/" }
)

                console.log(
                    "Service worker registered."
                );

            } catch (error) {

                console.error(
                    "Service worker registration failed:",
                    error
                );

            }

        }


        /* =========================================
           HEADER SCROLL EFFECT
        ========================================== */

        const header =
            document.querySelector(
                ".site-header"
            );


        function updateHeader() {

            if (!header) return;

            if (window.scrollY > 30) {

                header.style.boxShadow =
                    "0 8px 30px rgba(40, 40, 30, 0.05)";

            } else {

                header.style.boxShadow =
                    "none";

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


        internalLinks.forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );


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

            }
        );


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


        categoryCards.forEach(
            card => {

                card.addEventListener(
                    "click",
                    event => {

                        const link =
                            card.getAttribute(
                                "href"
                            );


                        if (link === "#") {

                            event.preventDefault();


                            const categoryName =
                                card.querySelector(
                                    "h3"
                                )
                                ?.textContent
                                .trim();


                            console.log(
                                `${categoryName} section coming soon!`
                            );

                        }

                    }
                );

            }
        );


        /* =========================================
           COMING SOON TOOL INTERACTION
        ========================================== */

        const toolItems =
            document.querySelectorAll(
                ".tool-item"
            );


        toolItems.forEach(
            tool => {

                tool.style.cursor =
                    "pointer";


                tool.addEventListener(
                    "click",
                    () => {

                        const toolName =
                            tool.querySelector(
                                "span:nth-child(2)"
                            )
                            ?.textContent
                            .trim();


                        alert(
                            `${toolName} is coming soon! 🌱`
                        );

                    }
                );

            }
        );


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
           STORY FORM
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
           LOAD EXISTING CONVERSATION
        ========================================== */

        if (currentConversationToken) {

            await loadVisitorConversation();

        }


        setupNotificationButton();


        /* =========================================
           CONSOLE
        ========================================== */

        console.log(
            "%cLife in Progress 🌱",
            "font-size: 18px; font-weight: bold;"
        );


        console.log(
            "You're figuring it out. And that's okay."
        );

    }
);


/* =========================================
   STORY SUBMISSION
========================================= */

async function handleStorySubmission(
    event
) {

    event.preventDefault();


    const storyForm =
        event.currentTarget;


    const topic =
        document.querySelector(
            "#story-topic"
        ).value;


    const message =
        document.querySelector(
            "#story-message"
        ).value.trim();


    const name =
        document.querySelector(
            "#story-name"
        ).value.trim();


    const anonymous =
        document.querySelector(
            "#story-anonymous"
        ).checked;


    const status =
        document.querySelector(
            "#story-status"
        );


    const submitButton =
        storyForm.querySelector(
            ".story-submit"
        );


    if (!topic || !message) {

        status.textContent =
            "Please choose a topic and write your story.";

        status.classList.add(
            "error"
        );

        return;
    }


    submitButton.disabled = true;


    const arrow =
        submitButton.querySelector(
            "span"
        );


    if (arrow) {

        arrow.textContent =
            "…";

    }


    status.classList.remove(
        "error"
    );


    status.textContent =
        "Sending your story...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "create_visitor_conversation",
                {
                    p_topic:
                        topic,

                    p_visitor_name:
                        name || null,

                    p_is_anonymous:
                        anonymous,

                    p_message:
                        message
                }
            );


        if (error) {

            throw error;

        }


        if (
            !data ||
            !data[0]
        ) {

            throw new Error(
                "No conversation was returned."
            );

        }


        const conversation =
            data[0];


        /* SAVE PRIVATE TOKEN */

        currentConversationToken =
            conversation.access_token;


        currentConversationId =
            conversation.conversation_id;


        localStorage.setItem(
            "lifeInProgressConversationToken",
            currentConversationToken
        );


        status.textContent =
            "It's been heard. ♡ Thanks for leaving a little piece of your story here.";


        storyForm.reset();


        const anonymousCheckbox =
            document.querySelector(
                "#story-anonymous"
            );


        if (anonymousCheckbox) {

            anonymousCheckbox.checked =
                true;

        }


        submitButton.disabled =
            false;


        if (arrow) {

            arrow.textContent =
                "→";

        }


        console.log(
            "Conversation created successfully:",
            conversation.conversation_id
        );


        console.log(
            "Private conversation token saved."
        );


        /* LOAD CONVERSATION VIEW */

        await loadVisitorConversation();

        setupNotificationButton();

    } catch (error) {

        console.error(
            "Story submission error:",
            error
        );


        status.textContent =
            "Something went wrong while sending your story. Please try again.";


        status.classList.add(
            "error"
        );


        submitButton.disabled =
            false;


        if (arrow) {

            arrow.textContent =
                "→";

        }

    }

}


/* =========================================
   LOAD VISITOR CONVERSATION
========================================= */

async function loadVisitorConversation() {

    if (!currentConversationToken) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "get_my_conversation",
            {
                p_access_token:
                    currentConversationToken
            }
        );


    if (error) {

        console.error(
            "Conversation loading error:",
            error
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        console.log(
            "No conversation found for this token."
        );

        return;

    }


    currentConversationId =
        data[0].conversation_id;


    renderVisitorConversation(
        data
    );


    /*
       Save known messages so we can detect
       newly added admin replies.
    */

    knownMessageIds =
        new Set(
            data
                .filter(
                    item =>
                        item.message_id
                )
                .map(
                    item =>
                        String(
                            item.message_id
                        )
                )
        );


    startConversationPolling();

}


/* =========================================
   RENDER VISITOR CONVERSATION
========================================= */

function renderVisitorConversation(
    messages
) {

    let viewer =
        document.querySelector(
            "#visitor-conversation"
        );


    /*
       Create conversation viewer
       if it doesn't exist yet.
    */

    if (!viewer) {

        viewer =
            document.createElement(
                "section"
            );


        viewer.id =
            "visitor-conversation";


        viewer.className =
            "visitor-conversation";


        const tellSection =
            document.querySelector(
                "#tell-me"
            );


        if (tellSection) {

            tellSection.after(
                viewer
            );

        } else {

            document.body.appendChild(
                viewer
            );

        }

    }


    const conversation =
        messages[0];


    const visibleName =
        conversation.is_anonymous
            ? "Anonymous"
            : (
                conversation.visitor_name ||
                "You"
            );


    const topic =
        conversation.topic ||
        "Life";


    const messageHTML =
        messages
            .filter(
                item =>
                    item.message_id
            )
            .map(
                item => {

                    const isAdmin =
                        item.sender_type ===
                        "admin";


                    return `
                        <div class="visitor-message-item ${
                            isAdmin
                                ? "admin"
                                : "user"
                        }">

                            <div class="visitor-message-label">
                                ${
                                    isAdmin
                                        ? "Life in Progress"
                                        : visibleName
                                }
                            </div>

                            <div class="visitor-message-bubble">
                                ${escapeHTML(
                                    item.message || ""
                                )}
                            </div>

                            <div class="visitor-message-time">
                                ${formatVisitorDate(
                                    item.message_created_at
                                )}
                            </div>

                        </div>
                    `;

                }
            )
            .join("");


    viewer.innerHTML = `

        <div class="visitor-conversation-inner">

            <div class="visitor-conversation-header">

                <div>

                    <p class="eyebrow">
                        YOUR PRIVATE CONVERSATION
                    </p>

                    <h2>
                        ${escapeHTML(topic)}
                    </h2>

                    <p>
                        This conversation is private.
                    </p>

                </div>

                <span class="visitor-private-badge">
                    🔒 Private
                </span>

            </div>


            <div class="visitor-message-list">

                ${messageHTML}

            </div>


            <!-- =========================
                 REPLY AREA
            ========================== -->

            <div class="visitor-reply-area">

                <div class="visitor-reply-heading">

                    <p class="eyebrow">
                        CONTINUE THE CONVERSATION
                    </p>

                    <h3>
                        Want to say something else?
                    </h3>

                    <p>
                        You can send another message here
                        anytime.
                    </p>

                </div>


                <form
                    id="visitor-reply-form"
                    class="visitor-reply-form"
                >

                    <textarea
                        id="visitor-reply-message"
                        rows="5"
                        placeholder="Write your reply..."
                        required
                    ></textarea>


                            <button
    type="submit"
    class="primary-button"
    id="visitor-reply-button"
    aria-label="Send reply"
>
    <span>→</span>
</button>


                    <p
                        id="visitor-reply-status"
                        class="story-status"
                        aria-live="polite"
                    ></p>

                </form>

            </div>


            <div class="visitor-conversation-note">

                ✦ Your conversation is saved on this device.
                You can come back later to check for replies.

            </div>

        </div>

    `;


    /*
       Scroll to newest message.
    */

    const messageList =
        viewer.querySelector(
            ".visitor-message-list"
        );


    if (messageList) {

        messageList.scrollTop =
            messageList.scrollHeight;

    }


    /*
       Attach reply form.
    */

    const replyForm =
        document.querySelector(
            "#visitor-reply-form"
        );


    if (replyForm) {

        replyForm.addEventListener(
            "submit",
            handleVisitorReply
        );

    }

}

/* =========================================
   SEND VISITOR REPLY
========================================= */

async function handleVisitorReply(
    event
) {

    event.preventDefault();


    if (!currentConversationToken) {

        return;

    }


    const form =
        event.currentTarget;


    const textarea =
        document.querySelector(
            "#visitor-reply-message"
        );


    const button =
        document.querySelector(
            "#visitor-reply-button"
        );


    const status =
        document.querySelector(
            "#visitor-reply-status"
        );


    if (!textarea) {

        return;

    }


    const message =
        textarea.value.trim();


    if (!message) {

        status.textContent =
            "Please write a message first.";

        status.classList.add(
            "error"
        );

        return;

    }


    button.disabled =
        true;


    button.querySelector(
        "span"
    ).textContent =
        "…";


    status.classList.remove(
        "error"
    );


    status.textContent =
        "Sending...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "send_visitor_message",
                {
                    p_access_token:
                        currentConversationToken,

                    p_message:
                        message
                }
            );


        if (error) {

            throw error;

        }


        console.log(
            "Visitor reply sent:",
            data
        );


        textarea.value =
            "";


        status.textContent =
            "Message sent. ♡";


        /*
           Reload conversation so the new
           message immediately appears.
        */

        await loadVisitorConversation();


    } catch (error) {

        console.error(
            "Visitor reply error:",
            error
        );


        status.textContent =
            error.message ||
            "Something went wrong. Please try again.";

        status.classList.add(
            "error"
        );


    } finally {

        button.disabled =
            false;


        const arrow =
            button.querySelector(
                "span"
            );


        if (arrow) {

            arrow.textContent =
                "→";

        }

    }

}

/* =========================================
   POLLING FOR NEW ADMIN REPLIES
========================================= */

function startConversationPolling() {

    if (conversationPoller) {

        clearInterval(
            conversationPoller
        );

    }


    /*
       Check every 5 seconds.

       This remains as a fallback while
       Web Push is being configured.
    */

    conversationPoller =
        setInterval(
            checkForNewMessages,
            5000
        );

}


/* =========================================
   CHECK FOR NEW MESSAGES
========================================= */

async function checkForNewMessages() {

    if (!currentConversationToken) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "get_my_conversation",
            {
                p_access_token:
                    currentConversationToken
            }
        );


    if (error) {

        console.error(
            "Message check error:",
            error
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    const currentMessages =
        data.filter(
            item =>
                item.message_id
        );


    const newAdminMessages =
        currentMessages.filter(
            item =>
                item.sender_type ===
                    "admin" &&
                !knownMessageIds.has(
                    String(
                        item.message_id
                    )
                )
        );


    if (
        newAdminMessages.length > 0
    ) {

        /*
           Update UI first.
        */

        renderVisitorConversation(
            data
        );


        /*
           Notify visitor if page is open.
        */

        newAdminMessages.forEach(
            message => {

                showBrowserNotification(
                    message.message ||
                    "You have a new reply. 💌"
                );

            }
        );

    }


    knownMessageIds =
        new Set(
            currentMessages.map(
                item =>
                    String(
                        item.message_id
                    )
            )
        );

}


/* =========================================
   VAPID KEY HELPER
========================================= */

function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (
                4 -
                base64String.length % 4
            ) % 4
        );


    const base64 =
        (
            base64String +
            padding
        )
        .replace(
            /-/g,
            "+"
        )
        .replace(
            /_/g,
            "/"
        );


    const rawData =
        window.atob(
            base64
        );


    return Uint8Array.from(
        [...rawData].map(
            char =>
                char.charCodeAt(0)
        )
    );

}


/* =========================================
   SET UP WEB PUSH
========================================= */

async function enablePushNotifications() {

    if (
        !("Notification" in window)
    ) {

        throw new Error(
            "This browser does not support notifications."
        );

    }


    if (
        !("serviceWorker" in navigator)
    ) {

        throw new Error(
            "This browser does not support service workers."
        );

    }


    if (
        !currentConversationToken
    ) {

        throw new Error(
            "No conversation token was found."
        );

    }


    /* =========================================
       REQUEST PERMISSION
    ========================================== */

    const permission =
        await Notification.requestPermission();


    if (
        permission !==
        "granted"
    ) {

        throw new Error(
            "Notification permission was not granted."
        );

    }


    /* =========================================
       GET SERVICE WORKER
    ========================================== */

    const registration =
        await navigator.serviceWorker.ready;


    /* =========================================
       GET OR CREATE PUSH SUBSCRIPTION
    ========================================== */

    let subscription =
        await registration.pushManager.getSubscription();


    if (!subscription) {

        subscription =
            await registration.pushManager.subscribe({

                userVisibleOnly:
                    true,

                applicationServerKey:
                    urlBase64ToUint8Array(
                        VAPID_PUBLIC_KEY
                    )

            });

    }


    /* =========================================
       GET SUBSCRIPTION DATA
    ========================================== */

    const subscriptionJSON =
        subscription.toJSON();


    const endpoint =
        subscriptionJSON.endpoint;


    const p256dh =
        subscriptionJSON.keys?.p256dh;


    const auth =
        subscriptionJSON.keys?.auth;


    if (
        !endpoint ||
        !p256dh ||
        !auth
    ) {

        throw new Error(
            "Push subscription data is incomplete."
        );

    }


    /* =========================================
       SAVE TO SUPABASE
    ========================================== */

    const {
        error
    } =
        await supabaseClient.rpc(
            "save_push_subscription",
            {
                p_access_token:
                    currentConversationToken,

                p_endpoint:
                    endpoint,

                p_p256dh:
                    p256dh,

                p_auth:
                    auth
            }
        );


    if (error) {

        throw error;

    }


    console.log(
        "Push subscription saved successfully."
    );


    return subscription;

}


/* =========================================
   BROWSER NOTIFICATION
========================================= */

function showBrowserNotification(
    message
) {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    try {

        new Notification(
            "Life in Progress 🌱",
            {
                body:
                    message ||
                    "You have a new reply. 💌",

                icon:
                    "/favicon.ico"
            }
        );

    } catch (error) {

        console.log(
            "Could not show notification:",
            error
        );

    }

}


/* =========================================
   DATE FORMAT
========================================= */

function formatVisitorDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString
        );


    return date.toLocaleString(
        undefined,
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    return String(
        value
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/* =========================================
   NOTIFICATION BUTTON
========================================= */

function setupNotificationButton() {

    const button =
        document.querySelector(
            "#notification-button"
        );


    const status =
        document.querySelector(
            "#notification-status"
        );


    if (
        !button ||
        !currentConversationToken
    ) {

        return;

    }


    /* =========================================
       BROWSER DOESN'T SUPPORT NOTIFICATIONS
    ========================================== */

    if (
        !("Notification" in window)
    ) {

        button.style.display =
            "none";

        return;

    }


    button.style.display =
        "block";


    /* =========================================
       ALREADY ENABLED
    ========================================== */

    if (
        Notification.permission ===
        "granted"
    ) {

        button.textContent =
            "🔔 Notifications are on";

        button.disabled =
            true;


        if (status) {

            status.textContent =
                "You'll be notified when you receive a reply.";

        }


        /*
           Make sure an existing browser
           permission also has a push
           subscription saved.
        */

        enablePushNotifications()
            .then(
                () => {

                    console.log(
                        "Existing push subscription confirmed."
                    );

                }
            )
            .catch(
                error => {

                    console.error(
                        "Could not confirm push subscription:",
                        error
                    );

                }
            );


        return;

    }


    /* =========================================
       PERMISSION DENIED
    ========================================== */

    if (
        Notification.permission ===
        "denied"
    ) {

        button.textContent =
            "🔔 Notifications blocked";

        button.disabled =
            true;


        if (status) {

            status.textContent =
                "Notifications are blocked for this site. You can allow them in your browser's site settings.";

        }


        return;

    }


    /* =========================================
       PERMISSION NOT YET REQUESTED
    ========================================== */

    button.textContent =
        "🔔 Notify me when you reply";


    button.disabled =
        false;


    if (status) {

        status.textContent =
            "";

    }


    /*
       Prevent duplicate click listeners.
    */

    if (
        button.dataset.listenerAttached ===
        "true"
    ) {

        return;

    }


    button.dataset.listenerAttached =
        "true";


    button.addEventListener(
        "click",
        async () => {

            button.disabled =
                true;


            button.textContent =
                "🔔 Setting up notifications...";


            if (status) {

                status.textContent =
                    "Please wait...";

            }


            try {

                await enablePushNotifications();


                button.textContent =
                    "🔔 Notifications are on";


                button.disabled =
                    true;


                if (status) {

                    status.textContent =
                        "You'll be notified when you receive a reply. 💌";

                }


                /*
                   Local test notification.
                */

                new Notification(
                    "Life in Progress 🌱",
                    {
                        body:
                            "Notifications are now enabled! 💌"
                    }
                );


                console.log(
                    "Web Push successfully enabled."
                );


            } catch (error) {

                console.error(
                    "Push subscription error:",
                    error
                );


                button.disabled =
                    false;


                button.textContent =
                    "🔔 Notify me when you reply";


                if (status) {

                    status.textContent =
                        error.message ||
                        "Unable to enable notifications. Please try again.";

                }

            }

        }
    );

}
