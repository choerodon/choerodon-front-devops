import { matchSpaces } from "../../utils";
import _ from "lodash";
// let textMark = [];
// const textSplit = newValue.split(":");
// if (textSplit.length > 2) {
//   const firstSplit = newValue.indexOf(":");
//   textMark[0] = newValue.substr(0, firstSplit);
//   textMark[1] = newValue.substr(firstSplit + 1);
// } else {
//   textMark = textSplit;
// }

// const yamlDiff = new YamlDiff({
//   cm: editor,
//   initValue: this.initValueLines,
// });

class YamlDiff {
  constructor(props) {
    this.cm = props.cm;
    this.value = props.initValue;
    this.markCache = {};
  }
  addOrModifySingle(from, to, textMark) {
    const editor = this.cm;
    const ch = textMark[0].length + 2;
    const mark = [];
    const markRange = {};
    if (from.ch >= ch) {
      // 修改value
      const markEnd = _.assign({}, to, {
        ch: ch + textMark[1].length,
      });
      editor.markText({ line: from.line, ch }, markEnd, {
        className: "lastModifyLine-text",
      });
      markRange.start = ch;
      markRange.end = markEnd.ch;
    } else {
      // 修改key
      const indent = matchSpaces(textMark[0]);
      const index = indent ? indent[0].length : 0;
      const markEnd = _.assign({}, to, {
        ch: index + _.trim(textMark[0]).length,
      });

      editor.markText({ line: from.line, ch: index }, markEnd, {
        className: "lastModifyLine-text",
      });
      markRange.start = index;
      markRange.end = markEnd.ch;
    }
    mark.push(markRange);
    this.markCache[from.line] = mark;
    console.log(this.markCache);
  }
  addOrModifyMultiple() {}
  deleteValueSingle() {}
  deleteMultiple() {}
}

export default YamlDiff;
