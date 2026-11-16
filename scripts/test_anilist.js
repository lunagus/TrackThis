const query = `
query {
  Page(page: 1, perPage: 3) {
    media(type: ANIME, sort: POPULARITY_DESC) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      format
      seasonYear
      season
      episodes
      duration
      description
      genres
      tags {
        name
        category
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
      averageScore
      popularity
      coverImage {
        large
        extraLarge
      }
      bannerImage
    }
  }
}
`;

fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({ query })
})
  .then(r => r.json())
  .then(data => {
    const item = data.data.Page.media[0];
    console.log('Sample item fetched:');
    console.log('Title:', item.title);
    console.log('Cover:', item.coverImage);
    console.log('Banner:', item.bannerImage);
    console.log('Studios:', item.studios.nodes.map(n => n.name));
    console.log('Tags:', item.tags.filter(t => t.category === 'Demographic' || ['Shounen', 'Seinen', 'Shoujo', 'Josei', 'Kids'].includes(t.name)));
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });
