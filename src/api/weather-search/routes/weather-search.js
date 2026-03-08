module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/weather/search',
            handler: 'api::weather-search.weather-search.search',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/weather/history',
            handler: 'api::weather-search.weather-search.history',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};