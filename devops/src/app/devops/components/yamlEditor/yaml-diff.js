import { matchSpaces } from "../../utils";
import _ from "lodash";

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
  }
  addOrModifyMultiple() {}
  deleteValueSingle() {}
  deleteMultiple() {}
}

export default YamlDiff;
