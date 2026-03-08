'use strict';

module.exports = {
    async search(ctx) {
        try {
            const { city } = ctx.request.body || {};

            if (!city || typeof city !== 'string' || !city.trim()) {
                return ctx.badRequest('City is required.');
            }

            const result = await strapi
                .service('api::weather-search.weather-search')
                .searchAndStore(city.trim());

            ctx.body = {
                success: true,
                message: 'Weather fetched and returned successfully.',
                data: result,
            };
        } catch (error) {
            strapi.log.error('Weather search error:', error);

            ctx.status = error.status || 500;
            ctx.body = {
                success: false,
                message: error.message || 'Unable to fetch weather.',
            };
        }
    },

    async history(ctx) {
        try {
            const page = Math.max(parseInt(ctx.query.page || '1', 10), 1);
            const pageSize = Math.min(
                Math.max(parseInt(ctx.query.pageSize || '10', 10), 1),
                100
            );

            const result = await strapi
                .service('api::weather-search.weather-search')
                .getHistory({ page, pageSize });

            ctx.body = {
                success: true,
                message: 'Weather history fetched successfully.',
                ...result,
            };
        } catch (error) {
            strapi.log.error('Weather history error:', error);

            ctx.status = error.status || 500;
            ctx.body = {
                success: false,
                message: error.message || 'Unable to fetch history.',
            };
        }
    },
};