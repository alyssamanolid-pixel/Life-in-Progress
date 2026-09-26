/* =========================================
   LIFE IN PROGRESS — ADMIN
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
   ELEMENTS
========================================= */

const loginScreen =
    document.getElementById("loginScreen");

const adminDashboard =
    document.getElementById("adminDashboard");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const conversationList =
    document.getElementById("conversationList");

const conversationView =
    document.getElementById("conversationView");

const conversationCount =
    document.getElementById("conversationCount");

const filterButtons =
    document.querySelectorAll(".filter-button");


let conversations = [];
let selectedConversationId = null;
let currentFilter = "all";


/* =========================================
   CHECK LOGIN
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {

        showAdminDashboard();

    } else {

        showLogin();

    }

});


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const submitButton =
        loginForm.querySelector("button[type='submit']");

    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });


    if (error) {

        loginError.textContent =
            error.message;

        submitButton.disabled = false;
        submitButton.textContent = "Sign In";

        return;
    }


    if (data.session) {

        showAdminDashboard();

    }

    submitButton.disabled = false;
    submitButton.textContent = "Sign In";

});


/* =========================================
   SHOW LOGIN
========================================= */

function showLogin() {

    loginScreen.classList.remove("hidden");

    adminDashboard.classList.add("hidden");

}


/* =========================================
   SHOW ADMIN
========================================= */

async function showAdminDashboard() {

    loginScreen.classList.add("hidden");

    adminDashboard.classList.remove("hidden");

    await loadConversations();

}


/* =========================================
   LOAD CONVERSATIONS
========================================= */

async function loadConversations() {

    conversationList.innerHTML = `
        <div class="empty-state">
            Loading conversations...
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("conversations")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Conversation loading error:",
            error
        );

        conversationList.innerHTML = `
            <div class="empty-state">
                Unable to load conversations.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }


    conversations = data || [];

    renderConversations();

}


/* =========================================
   RENDER CONVERSATIONS
========================================= */

function renderConversations() {

    let filtered =
        conversations;


    if (currentFilter !== "all") {

        filtered =
            conversations.filter(
                conversation =>
                    conversation.topic === currentFilter
            );

    }


    conversationCount.textContent =
        filtered.length;


    if (filtered.length === 0) {

        conversationList.innerHTML = `
            <div class="empty-state">
                No conversations found.
            </div>
        `;

        return;
    }


    conversationList.innerHTML =
        filtered.map(conversation => {

            const name =
                conversation.is_anonymous
                    ? "Anonymous"
                    : (
                        conversation.visitor_name ||
                        "Visitor"
                    );


            const topic =
                conversation.topic ||
                "Life";


            const message =
                conversation.message ||
                "No message available.";


            const date =
                formatDate(
                    conversation.created_at
                );


            const selected =
                selectedConversationId ===
                conversation.id
                    ? "selected"
                    : "";


            return `
                <button
                    class="conversation-card ${selected}"
                    data-id="${escapeHTML(
                        String(conversation.id)
                    )}"
                >

                    <div class="conversation-top">

                        <span class="conversation-name">
                            🌱 ${escapeHTML(name)}
                        </span>

                        <span class="conversation-date">
                            ${escapeHTML(date)}
                        </span>

                    </div>


                    <span class="conversation-topic">
                        ${escapeHTML(topic)}
                    </span>


                    <p class="conversation-preview">
                        ${escapeHTML(message)}
                    </p>

                </button>
            `;

        }).join("");


    document
        .querySelectorAll(".conversation-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const id =
                        card.dataset.id;

                    selectConversation(id);

                }
            );

        });

}


/* =========================================
   SELECT CONVERSATION
========================================= */

function selectConversation(id) {

    selectedConversationId =
        id;


    const conversation =
        conversations.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!conversation) {
        return;
    }


    renderConversations();


    const name =
        conversation.is_anonymous
            ? "Anonymous"
            : (
                conversation.visitor_name ||
                "Visitor"
            );


    const topic =
        conversation.topic ||
        "Life";


    const message =
        conversation.message ||
        "No message available.";


    const date =
        formatDate(
            conversation.created_at
        );


    conversationView.innerHTML = `

        <div class="message-header">

            <h2>
                ${escapeHTML(name)}
            </h2>

            <p>
                ${escapeHTML(topic)}
                ·
                ${escapeHTML(date)}
            </p>

        </div>


        <div class="message-content">

            <p class="message-label">
                Visitor
            </p>

            <p class="visitor-message">
                ${escapeHTML(message)}
            </p>

        </div>


        <div class="reply-area">

            <p class="message-label">
                Your Reply
            </p>

            <textarea
                id="replyMessage"
                placeholder="Write your reply here..."
            ></textarea>


            <div class="reply-actions">

                <button
                    class="reply-button"
                    id="sendReplyButton"
                    type="button"
                >
                    Send Reply
                </button>

            </div>

        </div>

    `;


    document
        .getElementById("sendReplyButton")
        .addEventListener(
            "click",
            handleReply
        );

}


/* =========================================
   REPLY
========================================= */

async function handleReply() {

    const replyInput =
        document.getElementById(
            "replyMessage"
        );


    const reply =
        replyInput.value.trim();


    if (!reply) {

        alert(
            "Please write a reply first."
        );

        return;
    }


    /*
       Reply system will be connected
       after we confirm the conversation
       data structure in Supabase.
    */

    alert(
        "Reply box is ready. We will connect sending next."
    );

}


/* =========================================
   FILTERS
========================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.topic;


            renderConversations();

        }
    );

});


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        selectedConversationId =
            null;

        conversations = [];

        showLogin();

    }
);


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================
   SECURITY — ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}