self.addEventListener('install', event => {
  // console.log('V1 installing111111111111…');
  console.log('V2 installing111111111111…');
});

self.addEventListener('activate', event => {
  // console.log('V1 now ready to handle fetches!');
  console.log('V2 now ready to handle fetches!')
});

self.addEventListener('fetch', event => {
  // const url = new URL(event.request.url);
  // console.log(url);
  self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  }).then((clients) => {
    console.log('clients:', clients)
    
    if (clients && clients.length) {
      // Send a response - the clients
      // array is ordered by last focused
      clients[0].postMessage({
        type: 'version',
        count: 4,
      });
    }
  }).catch(e => {
    console.log('eee in matchAll', e)
  })
});
