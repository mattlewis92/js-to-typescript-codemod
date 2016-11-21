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
      if (libName.startsWith('.')) { // only transform 3rd party libraries
        return false;
      }
      const hasDefault = !!require(libName).default; // check the 3rd party lib doesnt already have a default export
      return !hasDefault;
    })
    .replaceWith(({node}) => {
      node.type = 'ImportNamespaceSpecifier';
      return node;
    })
    .toSource();

};