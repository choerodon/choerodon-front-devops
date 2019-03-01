import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import ReactCodeMirror from "react-codemirror";
import CodeMirror from "codemirror";
import PropTypes from "prop-types";
import _ from "lodash";
import { Icon } from "choerodon-ui";
import JsYaml from "js-yaml";
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
    readOnly: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    options: PropTypes.object,
    handleEnableNext: PropTypes.func,
    onValueChange: PropTypes.func,
  };

  static defaultProps = {
    readOnly: true,
    handleEnableNext: enable => {},
    onValueChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      errorTip: false,
    };
    this.options = {
      // chd 自定制的主题配色
      theme: "chd",
      mode: "text/chd-yaml",
      readOnly: props.readOnly,
      lineNumbers: true,
      lineWrapping: true,
      viewportMargin: Infinity,
      lint: !props.readOnly,
      gutters: !props.readOnly ? ["CodeMirror-lint-markers"] : [],
    };
    this.initValueLines = [];
    this.updateValueLine = [];
  }

  componentDidMount() {
    this.initEditor();
  }

  /**
   * 高亮背景色的添加与删除
   *
   * @param {object} editor
   * @returns
   * @memberof YamlEditor
   */
  operator(editor) {
    return {
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
  }

  /**
   * 处理编辑器添加内容
   * @param {*} editor
   * @param {*} options
   * @memberof YamlEditor
   */
  handleInputChange(editor, options) {
    const op = this.operator(editor);
    const { from, to, text, removed } = options;

    const newValue = editor.getLine(from.line);
    const lineInfo = editor.lineInfo(from.line);
    const cacheValue = _.cloneDeep(this.updateValueLine)[from.line];

    if (text.length === 1) {
      op.addModifyStyle(from.line);
      if (newValue === cacheValue) {
        op.removeModifyStyle(from.line);
      }
    } else if (_.toString(text) === ",") {
      if (_.toString(removed) !== "") {
        op.addModifyStyle(from.line);
      } else if (_.toString(_.trim(newValue)) === "") {
        op.addNewStyle(from.line);
      }
    }
  }

  /**
   * 校验Yaml格式
   * 校验规则来源 https://github.com/nodeca/js-yaml
   * @param {*} values
   */
  checkYamlFormat(values) {
    const HAS_ERROR = true;
    const NO_ERROR = false;
    // handleEnableNext 通知父组件内容格式是否有误
    const { handleEnableNext } = this.props;

    let errorTip = NO_ERROR;
    // yaml 格式校验结果
    const formatResult = parse(values);
    if (formatResult && formatResult.length) {
      errorTip = HAS_ERROR;
      handleEnableNext(HAS_ERROR);
    } else {
      errorTip = NO_ERROR;
      handleEnableNext(NO_ERROR);
    }
    this.setState({ errorTip });
  }

  onChange = (values, options) => {
    const { onValueChange } = this.props;
    onValueChange(values);

    // 获取codemirror实例
    const editor = this.yamlEditor.getCodeMirror();

    /**
     * form      开始位置坐标
     * - line    行数，从0开始，也就是实际行 - 1
     * - ch      从行首开始的字符位置（包括空格）
     * - sticky  默认为 null，但可以设置为“before”或“after”，明确该位置是与字符之前还是之后相关
     * - xRel
     * to        结束位置坐标
     * origin    输入类型
     * - +input
     * - +delete
     * - paste
     * - cut
     * - undo
     * - redo
     * 修改原有文本，则 text 和 removed 都不是空数组
     * text      改变的文本
     * removed   删除的文本
     */
    const { from, to, origin, text, removed } = options;

    // const initValue = _.cloneDeep(this.updateValueLine)[from.line];
    // const newValue = editor.getLine(from.line);
    // const lineInfo = editor.lineInfo(from.line);

    // this.updateCacheValue(editor, options, newValue);

    // const op = this.operator(editor);

    /* switch (origin) {
      case "+input":
        this.handleInputChange(editor, options);
        break;
      case "+delete":
        if (newValue === initValue) {
          op.removeModifyStyle(from.line);
        } else {
          op.addModifyStyle(from.line);
        }
        break;
      case "paste":
        if (_.toString(removed) === "") {
          if (_.trim(newValue) === text[0]) {
            for (let line = from.line; line < from.line + text.length; line++) {
              op.addNewStyle(line);
            }
          } else {
            op.addModifyStyle(from.line);

            for (
              let line = from.line + 1;
              line < from.line + text.length;
              line++
            ) {
              op.addNewStyle(line);
            }
          }
        } else {
          if (removed.length >= text.length) {
            for (let line = from.line; line < from.line + text.length; line++) {
              op.addModifyStyle(line);
            }
          } else {
            for (let line = from.line; line <= to.line; line++) {
              op.addModifyStyle(line);
            }
            for (
              let line = to.line;
              line <= to.line + text.length - removed.length;
              line++
            ) {
              op.addNewStyle(line);
            }
          }
        }
        break;
      case "cut":
        if (!_.isEmpty(newValue)) {
          op.addModifyStyle(from.line);
        }
        break;
      case "redo":
        break;
      case "undo":
        if (_.trim(newValue) === "") {
          op.removeNewStyle(from.line);
        }
        break;
      default:
        break;
    } */
    this.checkYamlFormat(values);
  };

  /**
   * 缓存yaml初始数据
   * @memberof YamlEditor
   */
  initCacheValue(editor) {
    const initLines = editor.getDoc().size;
    const value = [];
    for (let i = 0; i < initLines; i++) {
      const line = editor.getLine(i);
      value.push(line);
    }
    this.initValueLines.push(...value);
    this.updateValueLine.push(...value);
  }

  /**
   * 更新value缓存
   * @param {*} editor
   * @param {*} options
   * @memberof YamlEditor
   */
  updateCacheValue(editor, options, value) {
    const { from, to, origin, text, removed } = options;

    const cacheLength = this.updateValueLine.length;
    const initLength = this.initValueLines.length;
    const newLength = editor.getDoc().size;

    // 行数增加，更新缓存
    if (newLength > cacheLength) {
      // 单行增加
      if (_.toString(text) === "," && removed.length < 2) {
        // console.log("单行增加");
        Array.prototype.splice.call(this.updateValueLine, from.line, 0, "");
      } else if (text.length > 2) {
        if (!_.toString(_.trim(removed))) {
          // console.log("多行增加");
          Array.prototype.splice.call(
            this.updateValueLine,
            from.line,
            0,
            ...text
          );
        } else {
          // console.log("有增有减");
          const input = _.slice(text, removed.length);
          Array.prototype.splice.call(
            this.updateValueLine,
            to.line,
            0,
            ...input
          );
        }
      }
    } else if (newLength <= initLength) {
      // console.log("恢复初始");
      this.updateValueLine = _.cloneDeep(this.initValueLines);
    }
  }

  initEditor() {
    const { onValueChange, value } = this.props;
    const editor = this.yamlEditor.getCodeMirror();
    editor.setOption("styleSelectedText", false);
    this.initCacheValue(editor);
    this.checkYamlFormat(value);
    onValueChange(value);
  }

  render() {
    // const LEGEND_TYPE = ["new", "modify", "error"];

    const {
      intl: { formatMessage },
      readOnly,
      value,
    } = this.props;

    const { errorTip } = this.state;

    // const legendDom = _.map(LEGEND_TYPE, item => (
    //   <span
    //     key={item}
    //     className={`c7ncd-yaml-legend-item c7ncd-yaml-legend_${item}`}
    //   >
    //     {formatMessage({ id: `yaml.legend.${item}` })}
    //   </span>
    // ));

    return (
      <Fragment>
        {/* !readOnly ? (
          <div className="c7ncd-yaml-legend">{legendDom}</div>
        ) : null */}
        <div className="c7ncd-yaml-wrapper">
          <ReactCodeMirror
            options={this.options}
            value={value}
            onChange={this.onChange}
            ref={instance => {
              this.yamlEditor = instance;
            }}
          />
        </div>
        {errorTip ? (
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
