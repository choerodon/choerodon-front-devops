import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import CodeMirror from 'react-codemirror';
import ReactMarkdown from 'react-markdown';
import { Tabs } from 'choerodon-ui';
import 'codemirror/lib/codemirror.css';
import './MdEditor.scss';
import './default.css';

require('codemirror/mode/markdown/markdown');

const { TabPane } = Tabs;

function MdEditor(props) {
  const { intl: { formatMessage }, value, onChange } = props;
  const options = {
    lineNumbers: false,
    readOnly: false,
    mode: 'markdown',
  };

  let tabKey = 'write';

  const handleTabChange = (e) => {
    tabKey = e;
  };

  return (
    <div className="c7n-mdeditor-wrap">
      <Tabs
        animated={false}
        defaultActiveKey="write"
        onChange={handleTabChange}
      >
        <TabPane tab={formatMessage({ id: 'write' })} key="write">
          <CodeMirror
            options={options}
            value={value}
            onChange={onChange}
          />
        </TabPane>
        <TabPane tab={formatMessage({ id: 'preview' })} key="preview">
          <div className="c7n-md-parse c7n-md-preview">
            <ReactMarkdown
              source={value}
              skipHtml={false}
              escapeHtml={false}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}

MdEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

MdEditor.defaultProps = {
  value: '',
};

export default injectIntl(MdEditor);
