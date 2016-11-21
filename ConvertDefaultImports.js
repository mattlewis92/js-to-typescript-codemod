/**
 * This transform converts stuff like:
 *
 *  import moment from 'moment';
 *
 *  to
 *
 *  import * as moment from 'moment';
 *
 */

module.exports = function(file, api) {

  const j = api.jscodeshift;
  return j(file.source)
    .find(j.ImportDefaultSpecifier)
    .filter((node) => {
      const libName = node.parentPath.parentPath.node.source.value;
      const hasDefault = !!require(libName).default;
      return !hasDefault;
    })
    .replaceWith(({node}) => {
      node.type = 'ImportNamespaceSpecifier';
      return node;
    })
    .toSource();

};