// from CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
// By ale(choerodon)

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    // CommonJS
    mod(require("codemirror/lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    // AMD
    define(["codemirror/lib/codemirror"], mod);
  else mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  // Depends on js-yaml.js from https://github.com/nodeca/js-yaml

  // declare global: jsyaml

  CodeMirror.registerHelper("lint", "yaml", function(text) {
    var jsyaml;
    var found = [];
    if (!jsyaml) {
      // if (window.console) {
      //   window.console.error(
      //     "Error: window.jsyaml not defined, CodeMirror YAML linting cannot run."
      //   );
      // }
      // return found;
      jsyaml = require("js-yaml");
    }
    try {
      jsyaml.load(text);
    } catch (e) {
      var loc = e.mark,
        // js-yaml YAMLException doesn't always provide an accurate lineno
        // e.g., when there are multiple yaml docs
        // ---
        // ---
        // foo:bar
        from = loc
          ? CodeMirror.Pos(loc.line, loc.column)
          : CodeMirror.Pos(0, 0),
        to = from;
      found.push({ from: from, to: to, message: e.message });
    }
    return found;
  });
});
