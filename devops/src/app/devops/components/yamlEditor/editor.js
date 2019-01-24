import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import CodeMirror from "react-codemirror";
import PropTypes from "prop-types";
import _ from "lodash";
import { Icon } from "choerodon-ui";
import "./index.scss";
import "./theme-chd.css";

require("./yamlMode");
require("codemirror/lib/codemirror.css");

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
      lineWrapping: false,
    };
  }

  componentDidMount() {
    const { highlightMarkers } = this.props;
    const editor = this.yamlEditor.getCodeMirror();
    editor.setOption("styleSelectedText", false);
    editor.setSize("100%", editor.getDoc().size * 21 + 18);
    if (highlightMarkers) {
      this.handleHighLight();
    }
  }

  /**
   * 显示报错行
   */
  onChange = (values, options) => {
    const editor = this.yamlEditor.getCodeMirror();
    const lines = editor.getDoc().size;
    editor.setSize("100%", lines * 21 + 18);
    const prevLineLength = this.state.lines || lines;
    const start = options.from;
    const end = options.to;
    const newValue = editor.getLine(start.line);
    const from = { line: start.line, ch: newValue.split(":")[0].length + 2 };
    const ch = 1000;
    const to = { line: end.line, ch: ch };
    const lineInfo = editor.lineInfo(from.line).bgClass;
    // 新增行
    // if (options.origin === "+input" && options.text.toString() === ",") {
    //   editor.addLineClass(start.line + 1, "background", "newLine-text");
    // } else if (
    //   options.origin === "+input" &&
    //   options.from.ch === 0 &&
    //   options.to.ch === 0
    // ) {
    //   editor.addLineClass(start.line, "background", "newLine-text");
    // } else if (lineInfo === "lastModifyLine-line") {
    //   editor.addLineClass(start.line, "background", "lastModifyLine-line");
    //   editor.markText(from, to, { className: "lastModifyLine-text" });
    // } else if (lineInfo === "newLine-text") {
    //   editor.addLineClass(start.line, "background", "newLine-text");
    // } else if (
    //   options.origin === "+delete" &&
    //   options.removed.toString() === ","
    // ) {
    //   const s = "return";
    // } else {
    //   editor.addLineClass(start.line, "background", "lastModifyLine-line");
    //   editor.markText(from, to, { className: "lastModifyLine-text" });
    // }
    this.handleModifyHighLight(values, options);
  };
  /**
   * 设置本次修改的高亮
   */
  handleModifyHighLight = _.debounce((values, options) => {
    this.props.onChange(values);
  }, 500);
  /**
   * 处理yaml格式错误显示
   */
  handleError = () => {
    const { value, errorLines, change } = this.props;
    const error = errorLines;
    if (value && this.yamlEditor && !change) {
      const editor = this.yamlEditor.getCodeMirror();
      editor.setValue(value);
    }
    if (error && error.length) {
      const eles = document.getElementsByClassName(
        "CodeMirror-linenumber CodeMirror-gutter-elt"
      );
      if (eles.length) {
        for (let i = 0; i < error.length; i += 1) {
          if (eles.length > error[i].lineNumber - 1) {
            eles[error[i].lineNumber - 1].className =
              "CodeMirror-linenumber CodeMirror-gutter-elt line_error";
            eles[error[i].lineNumber - 1].title = error[i].errorMsg;
          }
        }
      }
    } else {
      const eless = document.getElementsByClassName(
        "CodeMirror-linenumber CodeMirror-gutter-elt line_error"
      );
      if (eless.length) {
        const len = eless.length;
        for (let j = 0; j < len; j += 1) {
          eless[0].title = null;
          eless[0].className = "CodeMirror-linenumber CodeMirror-gutter-elt";
        }
      }
    }
  };

  /**
   * 设置高亮
   */
  handleHighLight = () => {
    const editor = this.yamlEditor.getCodeMirror();
    // editor.setSize("100%", editor.getDoc().size * 19 + 38);
    const sourceData = this.props.value.split("\n");
    this.setState({
      sourceData,
      modifyLines: _.map(this.props.highlightMarkers, "line"),
      newLines: this.props.newLines,
    });
    const diff = this.props.highlightMarkers;
    const newLine = this.props.newLines;
    diff &&
      diff.length &&
      diff.map(line => {
        editor.markText(
          { line: line.line, ch: line.startColumn },
          { line: line.line, ch: line.endColumn },
          {
            className: "lastModifyLine-text",
            title: "上次修改",
          }
        );
        editor.addLineClass(line.line, "background", "lastModifyLine-line");
        return diff;
      });
    newLine &&
      newLine.length &&
      newLine.map(lines => {
        editor.addLineClass(lines, "background", "newLine-text");
      });
  };

  render() {
    const {
      intl: { formatMessage },
      readOnly,
      value,
      totalLine,
      errorLines,
    } = this.props;
    this.handleError();

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
        <CodeMirror
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
