let articles = []; // Global variable to store articles

async function fetchArticles() {
    try {
        const response = await fetch('../JSON/articles.json'); // Adjust the path if necessary
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const articles = await response.json();
        generateCards(articles);
        return articles;
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
}



// Function to dynamically generate cards
function generateCards(articles) {
    const container = document.querySelector('.grid');
    articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = "group relative bg-gray-900 rounded-lg shadow-lg overflow-hidden";
        card.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h2 class="text-lg font-semibold">${article.title}</h2>
                <p class="text-sm mt-2">${article.description}</p>
                <button onclick="openModal(${index})" class="mt-4 px-4 py-2 bg-[#20e2cf] text-white text-sm font-semibold rounded hover:bg-[#167d73] transition-all">
                    Leer más
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function openModal(index) {
    const article = articles[index]; // Assuming `articles` is the JSON data array

    // Set modal content
    document.getElementById('modal-title').innerText = article.title;
    document.getElementById('modal-video').src = article.videoUrl;
    document.getElementById('modal-director').innerText = article.details.director;
    document.getElementById('modal-actors').innerText = article.details.actors.join(', ');
    document.getElementById('modal-production').innerText = article.details.production;
    document.getElementById('modal-dop').innerText = article.details.dop;
    document.getElementById('modal-sound').innerText = article.details.sound;
    document.getElementById('modal-assistant').innerText = article.details.assistant;

    // Show modal
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    modal.querySelector('iframe').src = ''; // Stop video playback
}

// Initialize the cards on window load
window.addEventListener('DOMContentLoaded', async () => {
    articles = await fetchArticles();
});
