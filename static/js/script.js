
// ==========================================================
// Global State
// ==========================================================

let coffees = [];
let filteredCoffees = [];

// ==========================================================
// DOM Elements
// ==========================================================

const coffeeContainer = document.getElementById("coffee-container");

const searchInput = document.getElementById("search");

const sortSelect = document.getElementById("sort");

const resetButton = document.getElementById("reset");

const totalCoffeeElement = document.getElementById("total-coffees");

const totalVotesElement = document.getElementById("total-votes");

const topCoffeeElement = document.getElementById("top-coffee");

const leaderboardElement = document.getElementById("leaderboard-list");

const spinner = document.getElementById("loading-spinner");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toast-message");

// ==========================================================
// Initialize App
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeEvents();

    loadCoffees();

});

// ==========================================================
// Load Coffee Data
// ==========================================================

async function loadCoffees() {

    showSpinner();

    try {

        const response = await fetch("/api/coffees");

        if (!response.ok) {

            throw new Error("Unable to fetch coffee data.");

        }

        coffees = await response.json();

        filteredCoffees = [...coffees];

        renderCoffees(filteredCoffees);

    }

    catch (error) {

        console.error(error);

        coffeeContainer.innerHTML = `

            <div class="empty">

                <h2>⚠ Error</h2>

                <p>Unable to load coffees.</p>

            </div>

        `;

    }

    finally {

        hideSpinner();

    }

}

// ==========================================================
// Render Coffee Cards
// ==========================================================

function renderCoffees(data) {

    coffeeContainer.innerHTML = "";

    if (data.length === 0) {

        coffeeContainer.innerHTML = `

            <div class="empty">

                <h2>☕</h2>

                <p>No coffees found.</p>

            </div>

        `;

        return;

    }

    const maxVotes = Math.max(...data.map(c => c.votes));
    refreshDashboard(data);

data.forEach((coffee, index) => {

    const card = createCoffeeCard(

        coffee,

        maxVotes,

        index === 0

    );

    coffeeContainer.appendChild(card);

});


}


// ==========================================================
// Create Coffee Card
// ==========================================================

function createCoffeeCard(coffee, maxVotes, isTopCoffee) {

    const percentage = Math.round((coffee.votes / maxVotes) * 100);

    const card = document.createElement("div");

    card.className = "card fade-in";

    card.innerHTML = `

        <div class="card-image">

            <img
                src="${coffee.image}"
                alt="${coffee.name}">

            ${isTopCoffee ? `
                <div class="top-badge">
                    🏆 Top Rated
                </div>
            ` : ""}

        </div>

        <div class="card-body">

            <h2>${coffee.name}</h2>

            <p>${coffee.description}</p>

            <div class="vote">

                <span>Votes</span>

                <span>${coffee.votes}</span>

            </div>

            <div class="progress">

                <div
                    class="progress-fill"
                    style="width:${percentage}%">
                </div>

            </div>

            <button
                class="vote-btn"
                data-id="${coffee.id}">
                Vote
            </button>

        </div>

    `;

    card.querySelector(".vote-btn")
        .addEventListener("click", () => {

            voteCoffee(coffee.id);

        });

    return card;

}

// ==========================================================
// Vote Coffee
// ==========================================================

async function voteCoffee(id) {

    const button = document.querySelector(
        `[data-id="${id}"]`
    );

    button.disabled = true;

    button.textContent = "Voting...";

    try {

        const response = await fetch(

            `/api/vote/${id}`,

            {
                method: "POST"
            }

        );

        const result = await response.json();

        if (!result.success) {

            throw new Error(result.message);

        }

        showToast("✔ Vote Added Successfully");

        await loadCoffees();

    }

    catch (error) {

        console.error(error);

        showToast("❌ Unable to vote.");

    }

}

// ==========================================================
// Update Dashboard Statistics
// ==========================================================

function updateStatistics(data) {

    totalCoffeeElement.textContent = data.length;

    const totalVotes = data.reduce(

        (sum, coffee) => sum + coffee.votes,

        0

    );

    totalVotesElement.textContent = totalVotes;

    if (data.length > 0) {

        topCoffeeElement.textContent = data[0].name;

    }

    else {

        topCoffeeElement.textContent = "-";

    }

}

// ==========================================================
// Leaderboard
// ==========================================================

function updateLeaderboard(data) {

    leaderboardElement.innerHTML = "";

    const medals = [

        "🥇",

        "🥈",

        "🥉"

    ];

    const topThree = [...data]

        .sort((a, b) => b.votes - a.votes)

        .slice(0, 3);

    topThree.forEach((coffee, index) => {

        const leader = document.createElement("div");

        leader.className = "leader";

        leader.innerHTML = `

            <div class="leader-name">

                ${medals[index]}

                ${coffee.name}

            </div>

            <div class="leader-votes">

                ${coffee.votes} votes

            </div>

        `;

        leaderboardElement.appendChild(leader);

    });

}

// ==========================================================
// Refresh Dashboard
// ==========================================================

function refreshDashboard(data) {

    updateStatistics(data);

    updateLeaderboard(data);

}


// ==========================================================
// Search Coffee
// ==========================================================

function searchCoffee() {

    const keyword = searchInput.value
        .toLowerCase()
        .trim();

    filteredCoffees = coffees.filter(coffee =>

        coffee.name
            .toLowerCase()
            .includes(keyword)

    );

    sortCoffee(false);

}

// ==========================================================
// Sort Coffee
// ==========================================================

function sortCoffee(render = true) {

    switch (sortSelect.value) {

        case "high":

            filteredCoffees.sort(
                (a, b) => b.votes - a.votes
            );

            break;

        case "low":

            filteredCoffees.sort(
                (a, b) => a.votes - b.votes
            );

            break;

        case "az":

            filteredCoffees.sort(
                (a, b) => a.name.localeCompare(b.name)
            );

            break;

        default:

            filteredCoffees = [...filteredCoffees];

    }

    if (render) {

        renderCoffees(filteredCoffees);

    }

    else {

        renderCoffees(filteredCoffees);

    }

}

// ==========================================================
// Reset Filters
// ==========================================================

function resetFilters() {

    searchInput.value = "";

    sortSelect.value = "default";

    filteredCoffees = [...coffees];

    renderCoffees(filteredCoffees);

}

// ==========================================================
// Toast Notification
// ==========================================================

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

// ==========================================================
// Spinner
// ==========================================================

function showSpinner() {

    spinner.classList.remove("hidden");

}

function hideSpinner() {

    spinner.classList.add("hidden");

}

// ==========================================================
// Event Listeners
// ==========================================================

function initializeEvents() {

    searchInput.addEventListener(

        "input",

        searchCoffee

    );

    sortSelect.addEventListener(

        "change",

        sortCoffee

    );

    resetButton.addEventListener(

        "click",

        resetFilters

    );

}

// ==========================================================
// Helper Functions
// ==========================================================

function getCoffeeById(id) {

    return coffees.find(

        coffee => coffee.id === id

    );

}

function totalVotes() {

    return coffees.reduce(

        (sum, coffee) => sum + coffee.votes,

        0

    );

}

// ==========================================================
// Console Log
// ==========================================================

console.log(

    "Coffee Rating Dashboard Loaded Successfully"

);