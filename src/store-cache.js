const fs = require('fs');
const a = require('./lib/events/afisha-nn');

process.on('unhandledRejection', (reason, p) => {
  console.error(reason);
  // console.error(p)
});

// const run = async () => {
//   const r = await a.fetchText({
//     path: 'afisha_nnov',
//     method: 'POST',
//     form: {
//       own: 1
//     }
//   });
//   fs.writeFileSync('./wall2.html', r);
// };

const run = async () => {
  const r = await a.parseGroup();
  console.log(r);
};

run();
