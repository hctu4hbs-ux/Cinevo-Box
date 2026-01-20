// TMDB API Configuration
const TMDB_API_KEY = '50b7a0444b169acb5c8f32e1fa88a7f4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Streaming Sources Configuration - Best sources used by popular apps
const STREAMING_SOURCES = {
    vidsrc: 'https://vidsrc.to/embed/movie/',
    superembed: 'https://superembed.stream/embed/',
    flixhq: 'https://flixhq.to/embed/',
    autoembed: 'https://autoembed.to/embed/',
    multiembed: 'https://multiembed.mov/?video_id='
};

// API Helper Function
async function fetchFromTMDB(endpoint, params = {}) {
    try {
        const queryParams = new URLSearchParams({
            api_key: TMDB_API_KEY,
            language: 'ar-AR',
            region: 'SA',
            ...params
        });
        
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('TMDB API Error:', error);
        return null;
    }
}

// Fetch Popular Movies
async function fetchPopularMovies(page = 1) {
    return await fetchFromTMDB('/movie/popular', { page });
}

// Fetch Popular TV Shows
async function fetchPopularTVShows(page = 1) {
    return await fetchFromTMDB('/tv/popular', { page });
}

// Fetch Trending Movies/Shows
async function fetchTrending(mediaType = 'movie', timeWindow = 'week') {
    return await fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
}

// Fetch Movies by Genre
async function fetchMoviesByGenre(genreId, page = 1) {
    if (genreId === 'all') {
        return await fetchPopularMovies(page);
    }
    return await fetchFromTMDB('/discover/movie', {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
    });
}

// Fetch Movie Details
async function fetchMovieDetails(movieId) {
    return await fetchFromTMDB(`/movie/${movieId}`, {
        append_to_response: 'credits,videos,external_ids'
    });
}

// Fetch TV Show Details
async function fetchTVShowDetails(showId) {
    return await fetchFromTMDB(`/tv/${showId}`, {
        append_to_response: 'credits,videos,external_ids,season/1'
    });
}

// Search Movies and Shows
async function searchContent(query) {
    return await fetchFromTMDB('/search/multi', { query });
}

// Get IMDB ID for streaming (needed for some sources)
function getExternalIds(data) {
    return data.external_ids || {};
}

// Generate Streaming Links - Using best sources from popular apps
function generateStreamingLinks(imdbId, title, mediaType = 'movie') {
    const links = {};
    
    if (imdbId) {
        // Ensure IMDB ID has proper format (tt followed by numbers)
        const cleanImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
        
        links.vidsrc = `${STREAMING_SOURCES.vidsrc}${cleanImdbId}`;
        links.superembed = `${STREAMING_SOURCES.superembed}${cleanImdbId}`;
        links.flixhq = `${STREAMING_SOURCES.flixhq}${cleanImdbId}`;
        links.autoembed = `${STREAMING_SOURCES.autoembed}${cleanImdbId}`;
        
        // For TV shows, append season/episode info
        if (mediaType === 'tv') {
            links.vidsrc += '?s=1&e=1';
            links.superembed += '?s=1&e=1';
            links.flixhq += '?s=1&e=1';
            links.autoembed += '?s=1&e=1';
        }
    }
    
    return links;
}

// Fetch Subtitles (OpenSubtitles API Alternative)
async function fetchSubtitles(imdbId, language = 'ar') {
    try {
        // Using SubtitleAPI as fallback
        const response = await fetch(`https://www.subtitleapi.io/api/v1/subtitles?imdbid=${imdbId}&language=${language}`);
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.log('Subtitles API error:', error);
        return null;
    }
}

// Get Arabic Subtitles using multiple sources
async function getArabicSubtitles(imdbId) {
    try {
        // Try multiple subtitle sources
        let subtitles = null;
        
        // Try VTT subtitle service
        subtitles = await fetch(`https://www.subtitleapi.io/api/v1/subtitles?imdbid=${imdbId}&language=ar`).then(r => r.json()).catch(() => null);
        
        if (subtitles) {
            return subtitles;
        }
        
        // Fallback: return null if no subtitles found
        console.log('Arabic subtitles not available for this content');
        return null;
    } catch (error) {
        console.log('Error fetching Arabic subtitles:', error);
        return null;
    }
}

// Format movie/show data for display
function formatContentData(item, mediaType = 'movie') {
    const isMovie = mediaType === 'movie';
    return {
        id: item.id,
        title: isMovie ? item.title : item.name,
        description: item.overview,
        poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'https://via.placeholder.com/500x750',
        backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}${item.backdrop_path}` : 'https://via.placeholder.com/1200x600',
        rating: (item.vote_average || 0).toFixed(1),
        voteCount: item.vote_count || 0,
        releaseDate: isMovie ? item.release_date : item.first_air_date,
        mediaType: mediaType,
        genreIds: item.genre_ids || [],
        popularity: item.popularity
    };
}

// Cache for storing fetched data
const cache = {
    movies: [],
    shows: [],
    trending: [],
    details: {}
};

// Get Genre Names
const GENRE_NAMES = {
    28: 'أكشن',
    35: 'كوميديا',
    18: 'درامـا',
    27: 'رعب',
    10749: 'رومانسي',
    16: 'رسوم متحركة',
    36: 'تاريخي',
    12: 'مغامرة',
    14: 'خيال',
    878: 'خيال علمي',
    9648: 'غموض',
    10402: 'موسيقى',
    37: 'غرب',
    53: 'إثارة',
    10751: 'عائلي',
    10752: 'حرب'
};

// Get Genre Names by IDs
function getGenreNames(genreIds) {
    if (!Array.isArray(genreIds)) return '';
    return genreIds
        .map(id => GENRE_NAMES[id] || '')
        .filter(Boolean)
        .join(', ');
}

// Fetch Complete Movie Data
async function getCompleteMovieData(movieId) {
    try {
        const data = await fetchMovieDetails(movieId);
        if (!data) return null;
        
        const formatted = {
            ...formatContentData(data, 'movie'),
            genres: data.genres,
            runtime: data.runtime,
            budget: data.budget,
            revenue: data.revenue,
            status: data.status,
            productionCountries: data.production_countries,
            spokenLanguages: data.spoken_languages,
            cast: data.credits?.cast?.slice(0, 5) || [],
            imdbId: data.external_ids?.imdb_id || '',
            videos: data.videos?.results || [],
            productionCompanies: data.production_companies || []
        };
        
        // Add streaming links
        formatted.streamingLinks = generateStreamingLinks(
            formatted.imdbId,
            formatted.title,
            'movie'
        );
        
        cache.details[movieId] = formatted;
        return formatted;
    } catch (error) {
        console.error('Error fetching complete movie data:', error);
        return null;
    }
}

// Fetch Complete TV Show Data
async function getCompleteTVShowData(showId) {
    try {
        const data = await fetchTVShowDetails(showId);
        if (!data) return null;
        
        const formatted = {
            ...formatContentData(data, 'tv'),
            genres: data.genres,
            numberOfSeasons: data.number_of_seasons,
            numberOfEpisodes: data.number_of_episodes,
            status: data.status,
            networks: data.networks,
            productionCountries: data.production_countries,
            spokenLanguages: data.spoken_languages,
            cast: data.credits?.cast?.slice(0, 5) || [],
            imdbId: data.external_ids?.imdb_id || '',
            videos: data.videos?.results || [],
            firstSeason: data.seasons?.[1] || null,
            inProduction: data.in_production
        };
        
        // Add streaming links
        formatted.streamingLinks = generateStreamingLinks(
            formatted.imdbId,
            formatted.title,
            'tv'
        );
        
        cache.details[showId] = formatted;
        return formatted;
    } catch (error) {
        console.error('Error fetching complete TV show data:', error);
        return null;
    }
}

// Get Cached Data or Fetch
async function getOrFetchMovies(page = 1) {
    if (cache.movies.length === 0) {
        const data = await fetchPopularMovies(page);
        if (data?.results) {
            cache.movies = data.results.map(item => formatContentData(item, 'movie'));
        }
    }
    return cache.movies;
}

// Get Cached Data or Fetch TV
async function getOrFetchTVShows(page = 1) {
    if (cache.shows.length === 0) {
        const data = await fetchPopularTVShows(page);
        if (data?.results) {
            cache.shows = data.results.map(item => formatContentData(item, 'tv'));
        }
    }
    return cache.shows;
}

// Get Cached Data or Fetch Trending
async function getOrFetchTrending() {
    if (cache.trending.length === 0) {
        const data = await fetchTrending('movie');
        if (data?.results) {
            cache.trending = data.results.map(item => formatContentData(item, 'movie'));
        }
    }
    return cache.trending;
}
