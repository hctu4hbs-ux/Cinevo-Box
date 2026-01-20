// Global State
let currentSection = 'home';
let currentPage = 1;
let currentPageTv = 1;
let currentGenre = 'all';
let currentMovies = [];
let currentTVShows = [];
let searchResults = [];
let favorites = JSON.parse(localStorage.getItem('cinevoFavorites')) || [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadSection('home');
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Load Section
function loadSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    currentSection = section;
    
    switch(section) {
        case 'home':
            document.getElementById('homeSection').classList.add('active');
            document.querySelector('.nav-link:nth-child(1)').classList.add('active');
            loadHomeSection();
            break;
        case 'movies':
            document.getElementById('moviesSection').classList.add('active');
            document.querySelector('.nav-link:nth-child(2)').classList.add('active');
            loadMoviesSection();
            break;
        case 'tv':
            document.getElementById('tvSection').classList.add('active');
            document.querySelector('.nav-link:nth-child(3)').classList.add('active');
            loadTVSection();
            break;
        case 'trending':
            document.getElementById('trendingSection').classList.add('active');
            document.querySelector('.nav-link:nth-child(4)').classList.add('active');
            loadTrendingSection();
            break;
    }
    
    window.scrollTo(0, 0);
}

// Load Home Section
async function loadHomeSection() {
    try {
        // Load trending
        await loadTrendingGrid();
        
        // Load new releases
        await loadNewReleasesGrid();
        
        // Load popular movies
        await loadMoviesGrid();
        
        // Load popular TV shows
        await loadTVGrid();
    } catch (error) {
        console.error('Error loading home section:', error);
        showNotification('حدث خطأ في تحميل البيانات', 'error');
    }
}

// Load Trending Grid
async function loadTrendingGrid() {
    const grid = document.getElementById('trendingGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await fetchTrending('movie', 'week');
        if (!data?.results) throw new Error('No data');
        
        const items = data.results.slice(0, 6).map(item => formatContentData(item, 'movie'));
        grid.innerHTML = items.map(item => createContentCard(item)).join('');
    } catch (error) {
        console.error('Error loading trending:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Load New Releases Grid
async function loadNewReleasesGrid() {
    const grid = document.getElementById('newReleasesGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await fetchPopularMovies(1);
        if (!data?.results) throw new Error('No data');
        
        const items = data.results.slice(0, 6).map(item => formatContentData(item, 'movie'));
        grid.innerHTML = items.map(item => createContentCard(item)).join('');
    } catch (error) {
        console.error('Error loading new releases:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Load Movies Grid
async function loadMoviesGrid() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await fetchPopularMovies(1);
        if (!data?.results) throw new Error('No data');
        
        const items = data.results.slice(0, 6).map(item => formatContentData(item, 'movie'));
        currentMovies = items;
        grid.innerHTML = items.map(item => createContentCard(item)).join('');
    } catch (error) {
        console.error('Error loading movies:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Load TV Grid
async function loadTVGrid() {
    const grid = document.getElementById('tvGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await fetchPopularTVShows(1);
        if (!data?.results) throw new Error('No data');
        
        const items = data.results.slice(0, 6).map(item => formatContentData(item, 'tv'));
        currentTVShows = items;
        grid.innerHTML = items.map(item => createContentCard(item)).join('');
    } catch (error) {
        console.error('Error loading TV shows:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Load Movies Section
async function loadMoviesSection() {
    currentPage = 1;
    currentGenre = 'all';
    await applyFilters();
}

// Load TV Section
async function loadTVSection() {
    currentPageTv = 1;
    
    const grid = document.getElementById('allTvGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await fetchPopularTVShows(currentPageTv);
        if (!data?.results) throw new Error('No data');
        
        currentTVShows = data.results.map(item => formatContentData(item, 'tv'));
        grid.innerHTML = currentTVShows.map(item => createContentCard(item)).join('');
        document.getElementById('pageInfoTv').textContent = `الصفحة ${currentPageTv}`;
    } catch (error) {
        console.error('Error loading TV:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Load Trending Section
async function loadTrendingSection() {
    const grid = document.getElementById('allTrendingGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await fetchTrending('movie', 'week');
        if (!data?.results) throw new Error('No data');
        
        const items = data.results.map(item => formatContentData(item, 'movie'));
        grid.innerHTML = items.map(item => createContentCard(item)).join('');
    } catch (error) {
        console.error('Error loading trending:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Create Content Card HTML
function createContentCard(item) {
    const isFavorite = favorites.some(fav => fav.id === item.id);
    return `
        <div class="content-card" onclick="showDetails(${item.id}, '${item.mediaType}')">
            <img src="${item.poster}" alt="${item.title}" class="card-poster" onerror="this.src='https://via.placeholder.com/500x750'">
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-meta">
                    <span class="card-year">${new Date(item.releaseDate).getFullYear() || 'N/A'}</span>
                    <span class="card-rating">⭐ ${item.rating}</span>
                </div>
                <p class="card-description">${item.description.substring(0, 100)}...</p>
            </div>
        </div>
    `;
}

// Apply Filters
async function applyFilters() {
    const genre = document.getElementById('genreFilter').value;
    const sort = document.getElementById('sortFilter').value;
    
    currentGenre = genre || 'all';
    currentPage = 1;
    
    const grid = document.getElementById('allMoviesGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        let data;
        if (currentGenre === 'all') {
            data = await fetchPopularMovies(currentPage);
        } else {
            data = await fetchMoviesByGenre(currentGenre, currentPage);
        }
        
        if (!data?.results) throw new Error('No data');
        
        currentMovies = data.results.map(item => formatContentData(item, 'movie'));
        grid.innerHTML = currentMovies.map(item => createContentCard(item)).join('');
        document.getElementById('pageInfo').textContent = `الصفحة ${currentPage}`;
    } catch (error) {
        console.error('Error applying filters:', error);
        grid.innerHTML = '<p class="text-center">فشل تحميل البيانات</p>';
    }
}

// Load Movies by Genre
async function loadMoviesByGenre(genreId) {
    currentGenre = genreId;
    currentPage = 1;
    await applyFilters();
}

// Pagination
function nextPage(type = 'movie') {
    if (type === 'movie') {
        currentPage++;
    } else {
        currentPageTv++;
    }
    applyFilters();
}

function previousPage(type = 'movie') {
    if (type === 'movie') {
        if (currentPage > 1) currentPage--;
    } else {
        if (currentPageTv > 1) currentPageTv--;
    }
    applyFilters();
}

// Search
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showNotification('الرجاء إدخال كلمة البحث', 'warning');
        return;
    }
    
    const grid = document.getElementById('searchResultsGrid');
    grid.innerHTML = '<div class="loading"></div>';
    
    try {
        const data = await searchContent(query);
        if (!data?.results) throw new Error('No results');
        
        const results = data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => formatContentData(item, item.media_type))
            .filter(item => item.poster !== 'https://via.placeholder.com/500x750');
        
        if (results.length === 0) {
            grid.innerHTML = '<p class="text-center">لم يتم العثور على نتائج</p>';
        } else {
            searchResults = results;
            grid.innerHTML = results.map(item => createContentCard(item)).join('');
        }
    } catch (error) {
        console.error('Error searching:', error);
        grid.innerHTML = '<p class="text-center">فشل البحث</p>';
    }
    
    document.getElementById('searchSection').classList.add('active');
    document.querySelectorAll('.section').forEach(s => {
        if (s.id !== 'searchSection') s.classList.remove('active');
    });
    window.scrollTo(0, 0);
}

// Show Details
async function showDetails(contentId, mediaType) {
    const grid = document.querySelector('.section.active');
    if (grid) grid.classList.remove('active');
    
    document.getElementById('detailsSection').classList.add('active');
    
    try {
        let details;
        if (mediaType === 'movie') {
            details = await getCompleteMovieData(contentId);
        } else {
            details = await getCompleteTVShowData(contentId);
        }
        
        if (!details) throw new Error('Failed to load details');
        
        // Update details page
        updateDetailsPage(details);
        
        // Populate streaming sources
        populateStreamingSources(details.streamingLinks);
        
        // Load Arabic subtitles
        loadArabicSubtitles(details.imdbId);
        
    } catch (error) {
        console.error('Error loading details:', error);
        showNotification('فشل تحميل التفاصيل', 'error');
    }
    
    window.scrollTo(0, 0);
}

// Update Details Page
function updateDetailsPage(details) {
    document.getElementById('detailsPoster').src = details.poster;
    document.getElementById('detailsTitle').textContent = details.title;
    document.getElementById('detailsRating').textContent = `⭐ ${details.rating}`;
    document.getElementById('detailsVotes').textContent = `(${details.voteCount.toLocaleString('ar-SA')})`;
    
    const releaseYear = new Date(details.releaseDate).getFullYear() || 'N/A';
    document.getElementById('releaseInfo').textContent = `سنة الإصدار: ${releaseYear}`;
    
    const genresText = details.genres?.map(g => g.name).join(', ') || 'غير محدد';
    document.getElementById('genresList').textContent = `النوع: ${genresText}`;
    
    document.getElementById('detailsDescription').textContent = details.description;
    
    // Update additional info
    document.getElementById('yearInfo').textContent = releaseYear;
    
    if (details.mediaType === 'movie') {
        document.getElementById('durationInfo').textContent = details.runtime ? `${details.runtime} دقيقة` : 'N/A';
        document.getElementById('countryInfo').textContent = 
            details.productionCountries?.map(c => c.name).join(', ') || 'N/A';
    } else {
        document.getElementById('durationInfo').textContent = 
            `${details.numberOfSeasons} موسم - ${details.numberOfEpisodes} حلقة`;
        document.getElementById('countryInfo').textContent = 
            details.productionCountries?.map(c => c.name).join(', ') || 'N/A';
    }
    
    document.getElementById('languageInfo').textContent = 
        details.spokenLanguages?.map(l => l.name).join(', ') || 'N/A';
    
    // Update favorite button
    const favoriteBtn = document.querySelector('.favorite-button');
    const isFavorite = favorites.some(fav => fav.id === details.id);
    if (isFavorite) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }
    
    // Store current details for use in other functions
    window.currentDetails = details;
}

// Populate Streaming Sources
function populateStreamingSources(links) {
    const select = document.getElementById('sourceSelect');
    select.innerHTML = '';
    
    const sources = [
        { name: 'VidSrc', key: 'vidsrc' },
        { name: 'Embed.su', key: 'embed_su' },
        { name: 'Upstream', key: 'upstream' },
        { name: 'FileMoon', key: 'filemoon' },
        { name: 'StreamWish', key: 'streamwish' },
        { name: 'Voe', key: 'voe' }
    ];
    
    sources.forEach(source => {
        if (links[source.key]) {
            const option = document.createElement('option');
            option.value = links[source.key];
            option.textContent = source.name;
            select.appendChild(option);
        }
    });
    
    if (select.children.length > 0) {
        select.selectedIndex = 0;
        changeSource();
    }
}

// Change Source
function changeSource() {
    const sourceUrl = document.getElementById('sourceSelect').value;
    const iframe = document.getElementById('videoPlayer');
    
    if (sourceUrl) {
        iframe.src = sourceUrl;
    }
}

// Load Arabic Subtitles
function loadArabicSubtitles(imdbId) {
    // Simulating subtitle loading
    const display = document.getElementById('subtitleDisplay');
    display.innerHTML = '<p style="color: var(--text-secondary);">جاري البحث عن ترجمات عربية...</p>';
    
    setTimeout(() => {
        display.innerHTML = '<p style="color: var(--text-secondary);">الترجمات العربية متوفرة للتحميل</p>';
    }, 1000);
}

// Load Subtitle
function loadSubtitle() {
    const selectedLang = document.getElementById('subtitleSelect').value;
    const display = document.getElementById('subtitleDisplay');
    
    if (!selectedLang) {
        display.innerHTML = '';
        return;
    }
    
    display.innerHTML = '<p style="color: var(--text-secondary);">جاري تحميل الترجمة...</p>';
    
    setTimeout(() => {
        if (selectedLang === 'ar') {
            display.innerHTML = `
                <div>
                    <p>00:00:00 --> 00:00:05</p>
                    <p>أهلا بك في Cinevo Box</p>
                    <p style="color: var(--text-secondary); margin-top: 1rem;">الترجمات العربية الكاملة ستظهر هنا</p>
                </div>
            `;
        } else {
            display.innerHTML = '<p>English subtitles will appear here</p>';
        }
    }, 500);
}

// Download Subtitle
function downloadSubtitle() {
    const selectedLang = document.getElementById('subtitleSelect').value;
    
    if (!selectedLang) {
        showNotification('الرجاء اختيار لغة الترجمة', 'warning');
        return;
    }
    
    // Create and download subtitle file
    const content = `WEBVTT

00:00:00.000 --> 00:00:05.000
عنوان الفيديو

00:00:05.000 --> 00:00:10.000
مرحبا بك في Cinevo Box
    `;
    
    const blob = new Blob([content], { type: 'text/vtt' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${window.currentDetails.title || 'subtitle'}.vtt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('تم تحميل الترجمة بنجاح', 'success');
}

// Toggle Favorite
function toggleFavorite() {
    if (!window.currentDetails) return;
    
    const index = favorites.findIndex(fav => fav.id === window.currentDetails.id);
    
    if (index === -1) {
        favorites.push({
            id: window.currentDetails.id,
            title: window.currentDetails.title,
            poster: window.currentDetails.poster,
            mediaType: window.currentDetails.mediaType
        });
        showNotification('تمت الإضافة للمفضلة', 'success');
    } else {
        favorites.splice(index, 1);
        showNotification('تم الحذف من المفضلة', 'success');
    }
    
    localStorage.setItem('cinevoFavorites', JSON.stringify(favorites));
    
    const favoriteBtn = document.querySelector('.favorite-button');
    favoriteBtn.classList.toggle('active');
}

// Scroll to Player
function scrollToPlayer() {
    const playerSection = document.getElementById('playerSection');
    playerSection.scrollIntoView({ behavior: 'smooth' });
}

// Go Back
function goBack() {
    loadSection('home');
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        color: white;
        z-index: 9999;
        font-weight: 600;
        animation: slideIn 0.3s ease-in;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--success-color)';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'var(--danger-color)';
    } else if (type === 'warning') {
        notification.style.backgroundColor = 'var(--warning-color)';
        notification.style.color = '#000';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
