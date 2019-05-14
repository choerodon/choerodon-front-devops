import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Form, Select, Input, Modal, Icon, Table, Popover } from 'choerodon-ui';
import { EditableCell, EditableFormRow } from './editableTable';
import { objToYaml, yamlToObj, takeObject, ConfigNode, makePostData } from '../utils';
import YamlEditor from '../../../../components/yamlEditor';
import EnvOverviewStore from '../../../../stores/project/envOverview';
import InterceptMask from '../../../../components/interceptMask/InterceptMask';

import '../../../main.scss';
import './KeyValueSideBar.scss';

const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Option } = Select;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};

@Form.create({})
@injectIntl
@inject('AppState')
@observer
export default class KeyValueSideBar extends Component {
  static defaultProps = {
    modeSwitch: false,
  };

  state = {
    // 键值对格式
    dataSource: [new ConfigNode()],
    // yaml 格式
    dataYaml: '',
    counter: 1,
    submitting: false,
    hasItemError: false,
    warningMes: '',
    data: false,
    isYamlEdit: false,
    hasYamlError: false,
    // yaml格式的value只能是字符串或null
    hasValueError: false,
    valueErrorMsg: '',
  };

  /**
   * 检查名称唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = _.debounce((rule, value, callback) => {
    const {
      store,
      intl: {
        formatMessage,
      },
      form: {
        getFieldValue,
      },
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;

    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    const envId = getFieldValue('envId');
    if (value && !pattern.test(value)) {
      callback(formatMessage({ id: 'network.name.check.failed' }));
    } else if (value && pattern.test(value)) {
      store.checkName(projectId, envId, value)
        .then((data) => {
          if (data && data.failed) {
            callback(formatMessage({ id: 'template.checkName' }));
          } else {
            callback();
          }
        });
    } else {
      callback();
    }
  }, 1000);

  componentDidMount() {
    const {
      store,
      id,
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;

    EnvOverviewStore.loadActiveEnv(projectId);

    if (typeof id === 'number') {
      store.loadKVById(projectId, id)
        .then((data) => {
          if (data) {

            if (data.failed) {

              Choerodon.prompt(data.message);

            } else {

              let counter = 1;

              if (!_.isEmpty(data.value)) {
                const dataSource = _.map(data.value, (value, key) => new ConfigNode(key, value, counter++));

                this.setState({
                  dataSource,
                  counter,
                });
              }

              this.setState({ data });
            }
          }
        });
    }
  }

  /**
   * 环境选择
   * @param value
   */
  handleEnvSelect = (value) => {
    const {
      store,
      title,
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;

    const loadFnMap = {
      configMap: () => store.loadConfigMap(true, projectId, value),
      secret: () => store.loadSecret(true, projectId, value),
    };

    loadFnMap[title]();
    EnvOverviewStore.setTpEnvId(value);
  };

  /**
   * 删除key-value
   * @param key
   */
  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource].filter(item => item.index !== key);
    this.setState({ dataSource });
  };

  /**
   * 添加一组 key/value
   * @param data
   */
  handleAdd = (data) => {
    const { counter, dataSource } = this.state;

    let _data = data;

    if (!Array.isArray(data)) {
      _data = [[null, null]];
    }

    let _counter = counter;
    let newData = _.map(_data, ([key, value]) => new ConfigNode(key, value, ++_counter));

    if (!newData.length) {
      const initConfig = new ConfigNode();
      newData.push(initConfig);
    }

    const uniqData = _.uniqBy([...dataSource.filter(item => item.index !== ''), ...newData], 'index');
    this.setState({
      dataSource: uniqData,
      counter: _counter,
    });
  };

  /**
   * 保存输入
   * @param row
   */
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = _.findIndex(newData, ['index', row.index]);

    newData.splice(index, 1, {
      ...newData[index],
      ...row,
    });

    this.asyncCheckErrorData(newData);

    this.setState({ dataSource: newData });
  };

  /**
   * configMap 规则中value只能是字符串
   * @param data
   */
  checkConfigRuleError = (data = '') => {
    const yaml = data || this.state.dataYaml;
    const yamlObj = yamlToObj(yaml) || {};
    const values = Object.values(yamlObj);

    let error = false;
    for (let i = 0, len = values.length; i < len; i++) {
      if (typeof values[i] !== 'string' || values[i] === '') {
        error = true;
        break;
      }
    }

    this.setState({ hasValueError: error });
    return error;
  };

  asyncCheckConfigRuleError = _.debounce(this.checkConfigRuleError, 600);

  /**
   * 同步校验键值对
   * @param data
   * @returns {boolean}
   */
  checkErrorData = (data = null) => {
    const {
      intl: {
        formatMessage,
      },
    } = this.props;

    const _data = data || this.state.dataSource;
    const hasKey = _data.filter(({ key }) => !_.isEmpty(key));
    const onlyHasValue = _data.filter(({ key, value }) => _.isEmpty(key) && !_.isEmpty(value));
    const onlyHasKey = hasKey.filter(({ value }) => _.isEmpty(value));
    const hasErrorItem = onlyHasKey.length || onlyHasValue.length;
    const hasRepeatKey = hasKey.length !== _.uniqBy(hasKey, 'key').length;

    let hasErrorKey;
    for (const { key } of hasKey) {

      if (/[^0-9A-Za-z\.\-\_]/.test(key)) {
        hasErrorKey = true;
        break;
      }

    }

    if (!(hasErrorItem || hasErrorKey || hasRepeatKey)) {
      this.setState({
        warningMes: '',
        hasItemError: false,
      });
      return false;
    }

    const errorMsg = formatMessage({
      id: hasRepeatKey ? 'configMap.keyRepeat' : 'configMap.keyValueSpan',
    });

    this.setConfigError(errorMsg);

    return true;
  };

  /**
   * 校验键值对
   * @param data
   * @returns {boolean}
   */
  asyncCheckErrorData = _.debounce(this.checkErrorData, 600);

  /**
   * 设置键值对模式下的错误提示
   * @param msg
   */
  setConfigError(msg) {
    this.setState({
      warningMes: msg,
      hasItemError: true,
    });
  }

  /**
   * form提交函数
   * 添加粘贴后key-value校验
   * @param e
   */
  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      store,
      id,
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;
    const {
      dataSource,
      isYamlEdit,
      hasYamlError,
      dataYaml,
    } = this.state;

    let configData = [];
    let hasKVError = false;
    let hasConfigRuleError = false;

    if (!isYamlEdit) {
      hasKVError = this.checkErrorData();
      configData = [...dataSource.filter(item => !_.isEmpty(item.key))];
    } else {
      hasConfigRuleError = this.checkConfigRuleError();
      configData = yamlToObj(dataYaml);
    }

    if (hasYamlError || hasKVError || hasConfigRuleError) return;

    this.setState({
      submitting: true,
      hasItemError: false,
    });

    const uniqData = _.uniqBy(configData, 'index');

    form.validateFieldsAndScroll((err, { name, description, envId }) => {
      if (!err) {

        const _value = takeObject(uniqData);

        const dto = {
          name,
          description,
          envId,
          type: id ? 'update' : 'create',
          id: id || undefined,
          value: _value,
        };

        store.postKV(projectId, dto)
          .then((res) => {
            if (res) {
              if (res && res.failed) {
                this.setState({ submitting: false });
                Choerodon.prompt(res.message);
              } else {
                this.handleClose();
                this.setState({ submitting: false });
              }
            }
          })
          .catch(e => {
            this.setState({ submitting: false });
            Choerodon.handleResponseError(e);
          });
      } else {
        this.setState({ submitting: false });
      }
    });
  };

  /**
   * 关闭弹框
   */
  handleClose = (isload = true) => {
    const { onClose } = this.props;
    onClose(isload);
  };

  /**
   * 配置信息的名称描述等常规表单项
   * @returns {*}
   */
  getFormContent = () => {
    const {
      intl: { formatMessage },
      form: { getFieldDecorator },
      envId,
      id,
    } = this.props;
    const { data } = this.state;
    const envData = EnvOverviewStore.getEnvcard;

    return (<Form className="c7n-sidebar-form" layout="vertical">
      <FormItem {...formItemLayout}>
        {getFieldDecorator('envId', {
          initialValue: envData.length ? envId : null,
          rules: [
            {
              required: true,
              message: formatMessage({ id: 'required' }),
            },
          ],
        })(
          <Select
            disabled={!!id}
            className="c7n-select_512"
            label={<FormattedMessage id="ctf.envName" />}
            placeholder={formatMessage({
              id: 'ctf.env.placeholder',
            })}
            optionFilterProp="children"
            onSelect={this.handleEnvSelect}
            filterOption={(input, option) =>
              option.props.children[1]
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            filter
            showSearch
          >
            {_.map(envData, item => {
              const { id, connect, name } = item;
              return (
                <Option key={id} value={id} disabled={!connect}>
                  {connect ? (
                    <span className="c7ncd-status c7ncd-status-success" />
                  ) : (
                    <span className="c7ncd-status c7ncd-status-disconnect" />
                  )}
                  {name}
                </Option>
              );
            })}
          </Select>,
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
      >
        {getFieldDecorator('name', {
          initialValue: data ? data.name : null,
          rules: [{
            required: true,
            message: formatMessage({ id: 'required' }),
          }, {
            validator: id ? null : this.checkName,
          }],
        })(
          <Input
            autoFocus={!id}
            disabled={!!id}
            maxLength={100}
            label={<FormattedMessage id="app.name" />}
          />,
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
      >
        {getFieldDecorator('description', {
          initialValue: data ? data.description : null,
        })(
          <TextArea
            autosize={{ minRows: 2 }}
            maxLength={30}
            label={<FormattedMessage id="configMap.des" />}
          />,
        )}
      </FormItem>
    </Form>);
  };

  /**
   * 编辑 configMap 组件节点
   * 有两种模式：key/value编辑模式、YAML代码编辑模式
   * @returns {*}
   */
  getConfigMap = () => {
    const { title } = this.props;
    const {
      dataSource,
      isYamlEdit,
      hasItemError,
      warningMes,
      dataYaml,
      hasValueError,
      valueErrorMsg,
    } = this.state;

    let configMap = null;
    if (!isYamlEdit) {

      const components = {
        body: {
          row: EditableFormRow,
          cell: EditableCell,
        },
      };
      const baseColumns = [{
        title: 'key',
        dataIndex: 'key',
        width: 230,
        editable: true,
      }, {
        title: '',
        width: 60,
        className: 'icon-equal',
        align: 'center',
        dataIndex: 'temp',
      }, {
        title: title,
        width: 230,
        dataIndex: 'value',
        editable: true,
      }, {
        title: '',
        dataIndex: 'operation',
        render: (text, { index }) => (
          dataSource.length >= 1 ? (
            <Icon
              className="del-btn"
              type="delete"
              onClick={this.handleDelete.bind(this, index)}
            />
          ) : null),
      }];

      const columns = baseColumns.map((col) => {
        if (!col.editable) return col;

        return {
          ...col,
          onCell: record => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            save: this.handleSave,
            add: this.handleAdd,
          }),
        };
      });

      configMap = <Fragment>
        <Table
          filterBar={false}
          showHeader={false}
          pagination={false}
          components={components}
          className="c7n-editable-table"
          dataSource={dataSource}
          columns={columns}
          rowKey={record => record.index}
        />
        <Button icon="add" onClick={this.handleAdd} type="primary">
          <FormattedMessage id={`${title}.add`} />
        </Button>
        {hasItemError ? <div className="c7n-cm-warning">{warningMes}</div> : null}
      </Fragment>;

    } else {
      configMap = <Fragment>
        <YamlEditor
          readOnly={false}
          modeChange={false}
          value={dataYaml}
          onValueChange={this.changeYamlValue}
          handleEnableNext={this.checkYamlError}
        />
        <div className="c7ncd-config-yaml-tip">{hasValueError && (valueErrorMsg ||
          <FormattedMessage id="configMap.yaml.error" />)}</div>
      </Fragment>;
    }

    return configMap;
  };

  /**
   * yaml 值改变
   * @param value
   */
  changeYamlValue = (value) => {
    this.asyncCheckConfigRuleError(value);

    this.setState({ dataYaml: value });
  };

  /**
   * 校验yaml格式
   * @param flag
   */
  checkYamlError = (flag) => {
    this.setState({ hasYamlError: flag });
  };

  /**
   * 切换配置映射的编辑模式
   */
  changeEditMode = () => {
    const {
      dataSource,
      dataYaml,
      hasYamlError,
      isYamlEdit,
      hasValueError,
      hasItemError,
    } = this.state;

    if (hasYamlError || hasValueError || hasItemError) return;

    if (!isYamlEdit) {

      const result = this.checkErrorData(dataSource);

      if (result) return;

      const yamlValue = objToYaml(dataSource);

      this.checkConfigRuleError(yamlValue);

      this.setState({
        counter: 1,
        hasItemError: false,
        isYamlEdit: true,
        warningMes: '',
        dataSource: [],
        dataYaml: yamlValue,
      });

    } else {

      const result = this.checkConfigRuleError(dataYaml);

      if (result) return;

      try {
        const kvValue = yamlToObj(dataYaml);
        const postData = makePostData(kvValue);

        const counter = postData.length;
        this.setState({
          dataSource: postData,
          hasYamlError: false,
          isYamlEdit: false,
          dataYaml: '',
          counter,
        });
      } catch (e) {
        this.setState({
          hasValueError: true,
          valueErrorMsg: e.message,
        });
      }
    }
  };

  render() {
    const {
      intl: { formatMessage },
      visible,
      id,
      envId,
      title,
      modeSwitch,
    } = this.props;
    const {
      submitting,
      data,
      hasYamlError,
      isYamlEdit,
      hasValueError,
      hasItemError,
    } = this.state;

    const envName = (_.find(EnvOverviewStore.getEnvcard, ['id', envId]) || {}).name;
    const titleName = id ? data.name : envName;
    const titleCode = `${title}.${id ? 'edit' : 'create'}`;
    const disableBtn = hasYamlError || hasValueError || hasItemError;

    return (
      <div className="c7n-region">
        <Sidebar
          destroyOnClose
          visible={visible}
          title={<FormattedMessage id={titleCode} />}
          confirmLoading={submitting}
          footer={[
            <Button
              disabled={disableBtn}
              key="submit"
              funcType="raised"
              type="primary"
              onClick={this.handleSubmit}
              loading={submitting}
            >
              {formatMessage({ id: id ? 'save' : 'create' })}
            </Button>,
            <Button
              key="back"
              funcType="raised"
              onClick={this.handleClose.bind(this, false)}
              disabled={submitting}
            >
              {<FormattedMessage id="cancel" />}
            </Button>,
          ]}
        >
          <Content
            code={titleCode}
            values={{ name: titleName }}
            className="c7n-ctf-create sidebar-content"
          >
            {this.getFormContent()}

            <div className="c7n-sidebar-from-title">
              <FormattedMessage id={`${title}.head`} />
              {!isYamlEdit && <Popover
                overlayStyle={{ maxWidth: 350 }}
                content={formatMessage({ id: `${title}.help.tooltip` })}
              >
                <Icon type="help" />
              </Popover>}
              {modeSwitch ? <Button
                className="c7n-config-mode-btn"
                type="primary"
                funcType="flat"
                disabled={disableBtn}
                onClick={this.changeEditMode}
              >
                <FormattedMessage id={isYamlEdit ? 'configMap.mode.yaml' : 'configMap.mode.kv'} />
              </Button> : null}
            </div>

            <div className="c7n-config-editor">
              {this.getConfigMap()}
            </div>

            <InterceptMask visible={submitting} />
          </Content>
        </Sidebar>
      </div>
    );
  }
}
