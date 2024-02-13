const routes = (handler) => [
    
    {
        method: 'POST',
        path: '/export/playlists/{playlistId}',
        handler: handler.postExportPlaylistHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    
    
    
    
    
    
    
    
    
    
    
    
    
    // {
    //     method: 'POST',
    //     path: '/export/playlists/{playlistId}',
    //     handler: handler.postExportPlaylistHandler,
    //     options: {
    //         auth: 'songsapp_jwt',
    //     },
    // },
];
    
module.exports = routes;