import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import ReactCodeMirror from "react-codemirror";
import CodeMirror from "codemirror";
import PropTypes from "prop-types";
import _ from "lodash";
import { Icon } from "choerodon-ui";
import JsYaml from "js-yaml";
import YamlDiff from "./yaml-diff";
import "./index.scss";
import "./theme-chd.css";

require("./yaml-mode");
require("codemirror/addon/lint/lint.js");
require("codemirror/addon/lint/yaml-lint");
require("./yaml-lint.js");
require("codemirror/lib/codemirror.css");
require("codemirror/addon/lint/lint.css");

function parse(values) {
  let result = [];
  try {
    JsYaml.load(values);
  } catch (e) {
    let loc = e.mark,
      from = loc ? CodeMirror.Pos(loc.line, loc.column) : CodeMirror.Pos(0, 0),
      to = from;
    result.push({ from, to, message: e.message });
  }
  return result;
}

class YamlEditor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    readOnly: PropTypes.bool,
    options: PropTypes.object,
    errorLines: PropTypes.array,
    highlightMarkers: PropTypes.array,
  };
  static defaultProps = {
    readOnly: false,
    errorLines: [],
    highlightMarkers: [],
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.options = {
      // chd 自定制的主题配色
      theme: "chd",
      mode: "text/chd-yaml",
      readOnly: props.readOnly,
      lineNumbers: true,
      lineWrapping: true,
      viewportMargin: Infinity,
      lint: true,
      gutters: ["CodeMirror-lint-markers"],
    };
    this.initValueLines = [];
  }

  componentDidMount() {
    this.initEditor();
  }

  onChange = (values, options) => {
    // 获取codemirror实例
    const editor = this.yamlEditor.getCodeMirror();
    const currentLines = editor.getDoc().size;
    // yaml 格式校验结果
    const formatResult = parse(values);
    /**
     * form      开始位置坐标
     * - line    行数，从0开始，也就是实际行 - 1
     * - ch      从行首开始的字符位置（包括空格）
     * - sticky
     * - xRel
     * to        结束位置坐标
     * origin    输入类型
     * - +input
     * - +delete
     * - paste
     * - cut
     * - undo
     * - redo
     * 修改文本，则 text 和 removed 都不是空数组
     * text      改变的文本
     * removed   删除的文本
     */
    const { from, to, origin, text, removed } = options;
    const newValue = editor.getLine(from.line);
    const lineInfo = editor.lineInfo(from.line);
    const isComment = _.startsWith(_.trim(newValue), "#");
    const initValue = _.cloneDeep(this.initValueLines)[from.line];

    const operator = {
      addModifyStyle(line) {
        editor.addLineClass(line, "background", "lastModifyLine-line");
      },
      removeModifyStyle(line) {
        editor.removeLineClass(line, "background", "lastModifyLine-line");
      },
      addNewStyle(line) {
        editor.addLineClass(line, "background", "newLine-line");
      },
      removeNewStyle(line) {
        editor.removeLineClass(line, "background", "newLine-line");
      },
    };

    switch (origin) {
      case "+input":
        if (text.length === 1) {
          if (
            _.toString(_.trim(newValue)) !== "" &&
            lineInfo.bgClass !== "newLine-line"
          ) {
            // 单行新增和单行修改
            operator.addModifyStyle();
            if (newValue === initValue) {
              operator.removeModifyStyle(from.line);
            }
          } else {
            operator.addNewStyle(from.line);
          }
        } else if (_.toString(text) === ",") {
          if (_.toString(removed) !== "") {
            operator.addModifyStyle(from.line);
          } else if (_.toString(_.trim(newValue)) === "") {
            operator.addNewStyle(from.line);
          }
        }
        break;
      case "+delete":
        if (newValue === initValue) {
          operator.removeModifyStyle(from.line);
        }
        break;
      case "paste":
        if (_.toString(removed) === "") {
          if (_.trim(newValue) === text[0]) {
            for (let line = from.line; line < from.line + text.length; line++) {
              operator.addNewStyle(line);
            }
          } else {
            operator.addModifyStyle(from.line);

            for (
              let line = from.line + 1;
              line < from.line + text.length;
              line++
            ) {
              operator.addNewStyle(line);
            }
          }
        } else {
          if (removed.length >= text.length) {
            for (let line = from.line; line < from.line + text.length; line++) {
              operator.addModifyStyle(line);
            }
          } else {
            for (let line = from.line; line <= to.line; line++) {
              operator.addModifyStyle(line);
            }
            for (
              let line = to.line;
              line <= to.line + text.length - removed.length;
              line++
            ) {
              operator.addNewStyle(line);
            }
          }
        }
        break;
      case "cut":
        if (!_.isEmpty(newValue)) {
          operator.addModifyStyle(from.line);
        }
        break;
      case "redo":
        break;
      case "undo":
        if (_.trim(newValue) === "") {
          operator.removeNewStyle(from.line);
        }
        break;
      default:
        break;
    }
  };

  /**
   * 缓存yaml初始数据
   * @memberof YamlEditor
   */
  saveInitValue() {
    const editor = this.yamlEditor.getCodeMirror();
    const initLines = editor.getDoc().size;
    const value = [];
    for (let i = 0; i < initLines; i++) {
      const line = editor.getLine(i);
      value.push(line);
    }
    this.initValueLines = value;
  }

  initEditor() {
    const { highlightMarkers } = this.props;
    const editor = this.yamlEditor.getCodeMirror();

    editor.setOption("styleSelectedText", false);
    this.saveInitValue();
  }

  render() {
    const {
      intl: { formatMessage },
      readOnly,
      value,
      totalLine,
      errorLines,
    } = this.props;

    const LEGEND_TYPE = ["new", "modify", "error"];

    const legendDom = _.map(LEGEND_TYPE, item => (
      <span
        key={item}
        className={`c7ncd-yaml-legend-item c7ncd-yaml-legend_${item}`}
      >
        {formatMessage({ id: `yaml.legend.${item}` })}
      </span>
    ));

    return (
      <Fragment>
        {!readOnly ? (
          <div className="c7ncd-yaml-legend">{legendDom}</div>
        ) : null}
        <ReactCodeMirror
          options={this.options}
          value={value}
          onChange={this.onChange}
          ref={instance => {
            this.yamlEditor = instance;
          }}
        />
        {errorLines && errorLines.length ? (
          <div className="c7ncd-yaml-error">
            <Icon type="error" className="c7ncd-yaml-error-icon" />
            <span className="c7ncd-yaml-error-msg">
              {formatMessage({ id: "yaml.error.tooltip" })}
            </span>
          </div>
        ) : null}
      </Fragment>
    );
  }
}

export default injectIntl(YamlEditor);
