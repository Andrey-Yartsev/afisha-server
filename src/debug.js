const fs = require('fs');
const a = require('./lib/events/afisha-nn');
const u = require('./lib/events/eventUpdater');

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
function stripTags(str) {
  return str.replace(/<\/?[^>]+>/gi, '');
}

// const run = async () => {
//   const r = await a.parseGroup();
//
//  // console.log(r);
//   r.forEach((v, i) => {
//     console.log(v.eventDt);
//     console.log("");
//   });
//
//   // r.forEach((v, i) => {
//   //   console.log((i+1) + ") " + stripTags(v.text).trim().substring(0, 50) + "\n------------------------\n");
//   // });
//   // console.log(r.length);
// };

// const run = async () => {
//   const r = a.parseDateStr('19, 26 октября, 2, 9 ноября в 11:00')
//   console.log(r);
// };

const run = async () => {
  const r = await a.parseGroup();
  await u.updateRecord(r[1]);
};

run();
