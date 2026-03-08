// module.exports = {
//   rest: {
//     defaultLimit: 25,
//     maxLimit: 100,
//     withCount: true,
//   },
// };


module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'id'],
  },
  rest: {
    defaultLimit: 10,
    maxLimit: 100,
    withCount: true,
  },
  documents: {
    strictParams: true,
  },
});