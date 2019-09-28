const request = require('request');
const iconv = require('iconv-lite');
const parser = require('node-html-parser');
const fs = require('fs');

const fetchText = ({path, method, form}) => {
  let config = {
    url: 'https://vk.com/' + path,
    encoding: null,
    method: method || "GET",
    form
  };

  console.log(config);

  return new Promise((accept) => {
    request(config, (err, response, body) => {
      const c = iconv.encode(iconv.decode(body, 'cp1251'), 'utf8').toString();
      accept(c);
    })
  });
};

const fetchMeta = async (name) => {
  let c = await fetchText({path: name});
  // console.log(c);

  const root = parser.parse(c);
  const node = root.querySelector('.post__anchor.anchor');
  const _name = node.attributes.name;

  const [, fixed, owner_id] = _name.match(/post(.+)_(.+)/);
  return {fixed, owner_id};
};

const parseText = text => {
  console.log(text);
  // text.match.
};

const parsePost = post => {
  const author = post.querySelector('.post_author .author').innerHTML;
  // console.log({ author });

  const content = post.querySelector('.post_content');
  const text = content.querySelector('.wall_post_text').innerHTML;

  parseText(text);

  const images = [];
  const imageEls = content.querySelectorAll('.page_post_sized_thumbs');
  imageEls.forEach(v => {
    const m = v.outerHTML.match(new RegExp("background-image: url\\((.+?)\\)"));
    images.push(m[1]);
  });

  return {
    author,
    text,
    images
  };
};

const parseWall = (html) => {
  html = fs.readFileSync("./wall.html").toString();
  const root = parser.parse(html);
  const postContainers = root.querySelectorAll("._post_content");

  parsePost(postContainers[0]);
  // postContainers.forEach(v => {
  //   parsePost(v);
  // });
};

const fetchWall = async ({ fixed, owner_id }) => {
  return await fetchText({
    path: 'al_wall.php',
    method: 'POST',
    form: {
      act: 'get_wall',
      al: 1,
      fixed,
      offset: 9,
      onlyCache: false,
      owner_id,
      type: 'own',
      wall_start_from: 10
    }
  });
};

const parseGroup = async () => {
  const meta = fetchMeta();
  const wallHtml = fetchWall(meta);
  fs.writeFileSync("./wall2.html", wallHtml);
  // parseWall(wallHtml);
};

const run = async () => {

  parseWall();

  // await fetchMeta();

  // const fixed = 139833;
  // const owner_id = -40583748;
  //

  //
  // fs.writeFileSync("./wall.html", c);
  // console.log(c);
};

run();
