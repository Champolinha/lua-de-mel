/**
 * Centralized utility for resolving hero/background images based on location names
 * (cities, countries, or regions).
 */

const DEFAULT_FLIGHT_HERO = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';
const DEFAULT_HOTEL_HERO = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

// Pre-defined mapping for location keywords to Unsplash URLs
const LOCATION_IMAGES = [
    {
        keywords: ['singapura', 'singapore'],
        url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80'
    },
    {
        keywords: ['krabi', 'phi phi', 'railay'],
        url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80'
    },
    {
        keywords: ['bangkok', 'tailândia', 'thailand'],
        url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80'
    },
    {
        keywords: ['coron', 'filipinas', 'philippines'],
        url: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80'
    },
    {
        keywords: ['hong kong'],
        url: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80'
    },
    {
        keywords: ['macau'],
        url: 'https://images.unsplash.com/photo-1563789031959-4c02bcb0b1c1?w=800&q=80'
    },
    {
        keywords: ['pequim', 'beijing', 'china'],
        url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7c?w=800&q=80' // Using the GuideTab one which is better
    },
    {
        keywords: ['seul', 'seoul', 'coreia', 'korea'],
        url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80'
    },
    {
        keywords: ['tóquio', 'tokyo', 'toquio', 'japão', 'japan'],
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80'
    },
    {
        keywords: ['osaka'],
        url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80'
    },
    {
        keywords: ['kyoto', 'quioto'],
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' // Reused Tokyo link from previous code, consider changing later
    },
    {
        keywords: ['dubai', 'eau', 'uae'],
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'
    },
    {
        keywords: ['abu dhabi'],
        url: 'https://images.unsplash.com/photo-1551041218-f393f95c4b97?w=800&q=80' // This is missing an id, but using exact old string: 1551041218-f393f95c4b97
    },
    {
        keywords: ['doha', 'catar', 'qatar'],
        url: 'https://images.unsplash.com/photo-1549944850-84e00be4203b?w=800&q=80'
    }
];

/**
 * Gets an image URL for a given location string.
 * It matches the location string (lowercased) against a set of keywords.
 */
export const getCityImage = (locationName, defaultImage = DEFAULT_FLIGHT_HERO) => {
    if (!locationName) return defaultImage;
    const lowerName = String(locationName).toLowerCase();

    for (const item of LOCATION_IMAGES) {
        if (item.keywords.some(kw => lowerName.includes(kw))) {
            return item.url;
        }
    }

    return defaultImage;
};

export const getHotelImage = (locationName) => {
    return getCityImage(locationName, DEFAULT_HOTEL_HERO);
};
