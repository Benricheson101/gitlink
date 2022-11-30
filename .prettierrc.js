module.exports = {
  ...require('gts/.prettierrc.json'),
  importOrder: ['^node:', '<THIRD_PARTY_MODULES>', '^gitlink[./]*', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
