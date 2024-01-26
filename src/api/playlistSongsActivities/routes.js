const routes = (handler) => [
    {
        method: 'GET',
        path: '/playlists/{id}/activities',
        handler: (request, h) => handler.getPlaylistSongActivities(request, h),
        options: {
            auth: 'songsapp_jwt',
        },
    },
];

module.exports = routes;