const fs = require('fs');
const path = require('path');

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

  const directory = path.parse(file.path).dir;

  const j = api.jscodeshift;
  return j(file.source)
    .find(j.ImportDefaultSpecifier)
    .filter((node) => {
      const libName = node.parentPath.parentPath.node.source.value;
      if (libName.startsWith('.')) { // is a local file - bit of a rubbish check
        const libPath = path.resolve(directory, libName);
        try {
          const fullLibPath = require.resolve(libPath);
          const isJs = path.parse(fullLibPath).ext === '.js';
          return !isJs; // convert all non js file imports (for webpack) `import template from './template.html';`
        } catch (e) {
          console.warn(`File "${libPath}" does not seem to exist. Assuming no default export`);
          return true;
        }
      }

      let mainFile;
      try {
        mainFile = require.resolve(libName);
      } catch (e) {
        console.warn(`Could not analyse "${libName}" for a default export, assuming it does not have one`);
        return true;
      }

      const mainFileContents = fs.readFileSync(mainFile).toString();
      try {
        const hasDefault = j(mainFileContents).find(j.AssignmentExpression, {left: {object: {name: 'exports'}, property: {name: 'default'}}}).length > 0;
        return !hasDefault;
      } catch (e) {
        console.warn(`Could not analyse "${libName}" for a default export, assuming it does not have one`);
        return true;
      }
    })
    .replaceWith(({node}) => {
      node.type = 'ImportNamespaceSpecifier';
      return node;
    })
    .toSource();

};