// Cinevo Box Configuration File
// تخصيص الموقع حسب احتياجاتك

const CinevoConfig = {
    // === إعدادات TMDB API ===
    tmdb: {
        // مفتاح API الخاص بـ TMDB
        apiKey: '50b7a0444b169acb5c8f32e1fa88a7f4',
        baseUrl: 'https://api.themoviedb.org/3',
        imageBase: 'https://image.tmdb.org/t/p/w500',
        language: 'ar-AR',
        region: 'SA'
    },

    // === إعدادات الموقع ===
    site: {
        title: 'Cinevo Box',
        description: 'منصة البث المتكاملة للأفلام والمسلسلات',
        developer: 'eyad al-juhani',
        version: '1.0.0',
        language: 'ar',
        direction: 'rtl'
    },

    // === إعدادات الألوان ===
    theme: {
        primary: '#0f0f0f',
        secondary: '#1a1a2e',
        accent: '#00d4ff',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        border: '#2a2a3e',
        success: '#4CAF50',
        warning: '#FFC107',
        danger: '#f44336'
    },

    // === إعدادات مصادر البث ===
    streamingSources: {
        enabled: true,
        default: 'vidsrc',
        sources: {
            vidsrc: {
                name: 'VidSrc',
                url: 'https://vidsrc.to/embed/movie/',
                quality: '1080p',
                enabled: true,
                reliability: 'high'
            },
            superembed: {
                name: 'SuperEmbed',
                url: 'https://superembed.stream/embed/',
                quality: '1080p',
                enabled: true,
                reliability: 'high'
            },
            flixhq: {
                name: 'FlixHQ',
                url: 'https://flixhq.to/embed/',
                quality: '1080p',
                enabled: true,
                reliability: 'high'
            },
            autoembed: {
                name: 'AutoEmbed',
                url: 'https://autoembed.to/embed/',
                quality: '1080p',
                enabled: true,
                reliability: 'high'
            }
        }
    },

    // === إعدادات الترجمات ===
    subtitles: {
        enabled: true,
        languages: [
            { code: 'ar', name: 'العربية', default: true },
            { code: 'en', name: 'الإنجليزية', default: false },
            { code: 'es', name: 'الإسبانية', default: false },
            { code: 'fr', name: 'الفرنسية', default: false }
        ],
        autoLoad: true,
        defaultLanguage: 'ar'
    },

    // === إعدادات الأداء ===
    performance: {
        cacheEnabled: true,
        cacheDuration: 3600000, // ساعة واحدة بالميلي ثانية
        lazyLoadEnabled: true,
        imageOptimization: true,
        minifyAssets: true
    },

    // === إعدادات المحتوى ===
    content: {
        itemsPerPage: 20,
        postersPerGrid: 6,
        descriptionMaxLength: 200,
        ratingsMin: 0,
        ratingsMax: 10,
        defaultPoster: 'https://via.placeholder.com/500x750'
    },

    // === إعدادات البحث ===
    search: {
        minCharacters: 1,
        debounceDelay: 300,
        maxResults: 50,
        searchFields: ['title', 'description']
    },

    // === إعدادات الفلترة ===
    filters: {
        genresEnabled: true,
        sortingEnabled: true,
        ratingFilterEnabled: true,
        yearFilterEnabled: true
    },

    // === إعدادات المفضلة ===
    favorites: {
        enabled: true,
        maxFavorites: 999,
        persistLocally: true,
        storageKey: 'cinevoFavorites'
    },

    // === إعدادات التحليلات ===
    analytics: {
        trackViewHistory: true,
        trackSearchQueries: true,
        trackUserInteractions: false,
        maxHistorySize: 50,
        storageKey: 'watchHistory'
    },

    // === إعدادات الأمان ===
    security: {
        validateInputs: true,
        sanitizeHTML: true,
        enableCSP: true,
        blockExternalScripts: false
    },

    // === إعدادات الإخطارات ===
    notifications: {
        enabled: true,
        duration: 3000,
        position: 'top-right',
        types: {
            success: { duration: 2000 },
            error: { duration: 4000 },
            warning: { duration: 3000 },
            info: { duration: 3000 }
        }
    },

    // === إعدادات الاستجابة ===
    responsive: {
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            wide: 1400
        }
    },

    // === إعدادات الأنواع ===
    genres: {
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
    },

    // === وظائف مساعدة ===
    // الحصول على إعدادات البث
    getStreamingSource: function(sourceKey) {
        return this.streamingSources.sources[sourceKey]
    },

    // التحقق من تفعيل مصدر
    isSourceEnabled: function(sourceKey) {
        const source = this.getStreamingSource(sourceKey)
        return source && source.enabled
    },

    // الحصول على اسم الجنس
    getGenreName: function(genreId) {
        return this.genres[genreId] || 'غير محدد'
    },

    // تطبيق الإعدادات على الموقع
    apply: function() {
        // تطبيق الألوان
        const root = document.documentElement
        for (const [key, value] of Object.entries(this.theme)) {
            root.style.setProperty(`--${this.camelToKebab(key)}`, value)
        }

        // تطبيق اللغة
        document.documentElement.lang = this.site.language
        document.documentElement.dir = this.site.direction
    },

    // تحويل camelCase إلى kebab-case
    camelToKebab: function(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }
}

// تطبيق الإعدادات عند التحميل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CinevoConfig.apply())
} else {
    CinevoConfig.apply()
}

// تصدير الإعدادات للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CinevoConfig
}
