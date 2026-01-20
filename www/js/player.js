// Video Player Module
const VideoPlayer = {
    currentSource: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isMuted: false,

    // Initialize player
    init: function(sourceUrl) {
        this.currentSource = sourceUrl;
        const iframe = document.getElementById('videoPlayer');
        if (iframe) {
            iframe.src = sourceUrl;
        }
    },

    // Play video
    play: function() {
        const iframe = document.getElementById('videoPlayer');
        if (iframe) {
            this.isPlaying = true;
        }
    },

    // Pause video
    pause: function() {
        this.isPlaying = false;
    },

    // Stop video
    stop: function() {
        const iframe = document.getElementById('videoPlayer');
        if (iframe) {
            iframe.src = '';
        }
        this.isPlaying = false;
        this.currentTime = 0;
    },

    // Set volume
    setVolume: function(volume) {
        // Volume control handled by iframe
    },

    // Toggle fullscreen
    toggleFullscreen: function() {
        const iframe = document.getElementById('videoPlayer');
        if (iframe) {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            }
        }
    }
};

// Subtitle Manager
// Subtitle Manager with API integration
const SubtitleManager = {
    currentSubtitleUrl: null,
    subtitles: [],
    isEnabled: false,
    currentLanguage: 'ar',

    // OpenSubtitles API Configuration
    opensubtitlesApiKey: '3fWCgxEk3GOR9yo7Cvgg4VH1TRjbLv79',
    
    // SubDL API Configuration
    subdlApiKey: 'KZSK8ICeSSEGmkLU4Oo7FklxGY-JtCem',

    // Load Arabic subtitles from multiple sources
    loadArabicSubtitles: async function(imdbId, title) {
        try {
            // Try OpenSubtitles first
            let subtitleUrl = await this.fetchFromOpenSubtitles(imdbId);
            
            // Fallback to SubDL if OpenSubtitles fails
            if (!subtitleUrl) {
                subtitleUrl = await this.fetchFromSubDL(title);
            }
            
            // If we found a subtitle URL, load it
            if (subtitleUrl) {
                return await this.loadSubtitles(subtitleUrl, 'ar');
            }
            
            console.log('Arabic subtitles available through video player');
            return null;
        } catch (error) {
            console.error('Error loading Arabic subtitles:', error);
            return null;
        }
    },

    // Fetch from OpenSubtitles API
    fetchFromOpenSubtitles: async function(imdbId) {
        try {
            const response = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?imdb_id=${imdbId}&language_code=ar&api_key=${this.opensubtitlesApiKey}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    // Return the first Arabic subtitle URL
                    return data.data[0].url;
                }
            }
            return null;
        } catch (error) {
            console.error('OpenSubtitles fetch error:', error);
            return null;
        }
    },

    // Fetch from SubDL API
    fetchFromSubDL: async function(title) {
        try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(`https://api.subdl.com/api/v1/subtitles/search?query=${encodedTitle}&languages=ar&api_key=${this.subdlApiKey}`);
            if (response.ok) {
                const data = await response.json();
                if (data.subtitles && data.subtitles.length > 0) {
                    // Return the first Arabic subtitle download URL
                    return data.subtitles[0].url;
                }
            }
            return null;
        } catch (error) {
            console.error('SubDL fetch error:', error);
            return null;
        }
    },

    // Load subtitle file
    loadSubtitles: async function(url, language = 'ar') {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.log('Failed to fetch subtitle file');
                return null;
            }
            
            const text = await response.text();
            this.parseSubtitles(text);
            this.isEnabled = true;
            this.currentLanguage = language;
            return this.subtitles;
        } catch (error) {
            console.error('Error loading subtitles:', error);
            return null;
        }
    },

    // Parse VTT/SRT subtitle format
    parseSubtitles: function(content) {
        this.subtitles = [];
        const lines = content.split('\n');
        let currentSubtitle = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip VTT header
            if (line.startsWith('WEBVTT')) continue;

            // Check for timestamp
            if (line.includes('-->')) {
                const [start, end] = line.split('-->').map(t => this.timeToSeconds(t.trim()));
                currentSubtitle = { start, end, text: '' };
            } else if (line && currentSubtitle) {
                currentSubtitle.text += (currentSubtitle.text ? ' ' : '') + line;
            } else if (!line && currentSubtitle && currentSubtitle.text) {
                this.subtitles.push(currentSubtitle);
                currentSubtitle = null;
            }
        }

        if (currentSubtitle && currentSubtitle.text) {
            this.subtitles.push(currentSubtitle);
        }
    },

    // Convert time string to seconds
    timeToSeconds: function(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
    },

    // Get subtitle for current time
    getSubtitleAtTime: function(time) {
        const subtitle = this.subtitles.find(s => time >= s.start && time <= s.end);
        return subtitle ? subtitle.text : '';
    },

    // Download subtitle as VTT
    downloadSubtitleFile: function(filename = 'subtitle.vtt') {
        if (this.subtitles.length === 0) return;

        let content = 'WEBVTT\n\n';
        this.subtitles.forEach(sub => {
            content += `${this.secondsToTime(sub.start)} --> ${this.secondsToTime(sub.end)}\n`;
            content += `${sub.text}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/vtt' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Convert seconds to time string
    secondsToTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    },

    // Toggle subtitles visibility
    toggleVisibility: function() {
        this.isEnabled = !this.isEnabled;
        const display = document.getElementById('subtitleDisplay');
        if (display) {
            display.style.display = this.isEnabled ? 'block' : 'none';
        }
        return this.isEnabled;
    }
};

// Streaming Source Manager
const StreamingSourceManager = {
    sources: [],
    currentSourceIndex: 0,

    // Register sources
    registerSources: function(sourceLinks) {
        this.sources = Object.entries(sourceLinks).map(([name, url]) => ({
            name: this.getSourceName(name),
            key: name,
            url: url
        }));
        return this.sources;
    },

    // Get friendly source name
    getSourceName: function(key) {
        const names = {
            'superembed': 'SuperEmbed',
            'embed2': '2Embed',
            'doodstream': 'DoodStream',
            'mixdrop': 'MixDrop',
            'streamtape': 'StreamTape',
            'rapidvideo': 'RapidVideo'
        };
        return names[key] || key;
    },

    // Get current source
    getCurrentSource: function() {
        return this.sources[this.currentSourceIndex] || null;
    },

    // Switch to next source
    switchSource: function(index) {
        if (index >= 0 && index < this.sources.length) {
            this.currentSourceIndex = index;
            const source = this.getCurrentSource();
            if (source) {
                VideoPlayer.init(source.url);
                return source;
            }
        }
        return null;
    },

    // Get source by name
    getSourceByName: function(name) {
        const source = this.sources.find(s => s.name === name);
        if (source) {
            this.currentSourceIndex = this.sources.indexOf(source);
        }
        return source;
    },

    // Check source availability
    checkSourceAvailability: async function(url) {
        try {
            const response = await fetch(url, { mode: 'no-cors' });
            return response.ok || response.type === 'opaque';
        } catch (error) {
            return false;
        }
    },

    // Get available sources only
    getAvailableSources: async function() {
        const available = [];
        for (const source of this.sources) {
            const isAvailable = await this.checkSourceAvailability(source.url);
            if (isAvailable) {
                available.push(source);
            }
        }
        return available;
    }
};

// Quality Manager
const QualityManager = {
    availableQualities: ['1080p', '720p', '480p', '360p'],
    currentQuality: '720p',

    // Set quality
    setQuality: function(quality) {
        if (this.availableQualities.includes(quality)) {
            this.currentQuality = quality;
            // Quality change will be handled by streaming source
            return true;
        }
        return false;
    },

    // Get quality options
    getQualityOptions: function() {
        return this.availableQualities;
    },

    // Detect available quality based on bandwidth
    detectAvailableQualities: function() {
        // This would use navigator.connection API in real implementation
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return this.availableQualities;

        const downlink = connection.downlink || 10;
        if (downlink > 10) return ['1080p', '720p', '480p', '360p'];
        if (downlink > 5) return ['720p', '480p', '360p'];
        return ['480p', '360p'];
    }
};

// Analytics
const Analytics = {
    watchHistory: JSON.parse(localStorage.getItem('watchHistory')) || [],

    // Record watch
    recordWatch: function(contentId, title, duration, watched) {
        const entry = {
            contentId,
            title,
            duration,
            watched,
            timestamp: new Date().toISOString()
        };

        // Check if already exists
        const existingIndex = this.watchHistory.findIndex(h => h.contentId === contentId);
        if (existingIndex !== -1) {
            this.watchHistory[existingIndex] = entry;
        } else {
            this.watchHistory.push(entry);
        }

        // Keep only last 50 entries
        if (this.watchHistory.length > 50) {
            this.watchHistory.shift();
        }

        localStorage.setItem('watchHistory', JSON.stringify(this.watchHistory));
    },

    // Get watch history
    getWatchHistory: function() {
        return this.watchHistory;
    },

    // Clear watch history
    clearWatchHistory: function() {
        this.watchHistory = [];
        localStorage.removeItem('watchHistory');
    },

    // Get most watched
    getMostWatched: function(limit = 10) {
        return this.watchHistory.slice(-limit).reverse();
    }
};

// Initialize player on source change
document.addEventListener('DOMContentLoaded', function() {
    const sourceSelect = document.getElementById('sourceSelect');
    if (sourceSelect) {
        sourceSelect.addEventListener('change', function() {
            const sourceUrl = this.value;
            if (sourceUrl) {
                VideoPlayer.init(sourceUrl);
            }
        });
    }

    // Subtitle language change
    const subtitleSelect = document.getElementById('subtitleSelect');
    if (subtitleSelect) {
        subtitleSelect.addEventListener('change', function() {
            const language = this.value;
            if (language) {
                // Load subtitles for selected language
                SubtitleManager.isEnabled = true;
            } else {
                SubtitleManager.isEnabled = false;
            }
        });
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VideoPlayer,
        SubtitleManager,
        StreamingSourceManager,
        QualityManager,
        Analytics
    };
}
