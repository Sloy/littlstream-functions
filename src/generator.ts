const RSS = require('rss-generator');

const warningVideo = {
  mp4Link : "",
  quality : "",
  title : "Foo",
  description : "Stay tunned in littlstream.com",
  duration : 1,
  type : "string | number",
  layout : "string",
  thumb : "https://png.pngtree.com/element_origin_min_pic/16/08/11/1557ac253ebb0e2.jpg"
}
function videoToRssItem(video) {
  return {
    title: video.title,
    description: video.description,
    url: video.mp4Link,
    categories: [
      'VR'
    ],
    custom_elements: [
      {
        'ls:duration': video.duration
      }, {
        'ls:image': video.thumb
      }, {
        'ls:content-type': video.type
      }, {
        'ls:content-layout': video.layout
      }
    ]
  }
}

function generateRss(info, videos) {
  const feed = new RSS({
    title: `${info.title} (${videos.length} videos)`,
    description: info.title,
    categories: info.categories,
    image_url: info.image,
    custom_namespaces: {
      'ls': 'https://www.littlstar.com'
    }
  });

  //videos.unshift(warningVideo)
  videos
    .map(videoToRssItem)
    .forEach(item => feed.item(item))

  return feed.xml({ indent: true })
}

exports.generateRss = (feed) => generateRss(feed.info, feed.videos)