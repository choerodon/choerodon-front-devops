import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Select, Steps, Table } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, message, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import '../Importexport.scss';
import '../../../main.scss';

const Option = Select.Option;
const Step = Steps.Step;

const { AppState } = stores;

@observer
class ExportChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
      projectId: AppState.currentMenuType.id,
      0: { versions: [] },
      upDown: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    const { ExportChartStore } = this.props;
    ExportChartStore.loadApps({ projectId: this.state.projectId });
  }

  /**
   * 获取步骤条状态
   * @param index
   * @returns {string}
   */
  getStatus = (index) => {
    const { current } = this.state;
    let status = 'process';
    if (index === current) {
      status = 'process';
    } else if (index > current) {
      status = 'wait';
    } else {
      status = 'finish';
    }
    return status;
  };

  /**
   * 改变步骤条
   * @param index
   */
  changeStep = (index) => {
    const { ExportChartStore } = this.props;
    if (index === 2) {
      const selectedRows = this.state.selectedRows;
      selectedRows.map((app, indexs) => {
        selectedRows[indexs].versions = ('versions' in selectedRows[indexs]) ? selectedRows[indexs].versions : [this.state[indexs].versions[0]];
        this.setState({ selectedRows });
        return index;
      });
    }
    this.setState({ current: index });
  };
  /**
   * table app表格搜索
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  appTableChange =(pagination, filters, sorter, paras) => {
    const { ExportChartStore } = this.props;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      // sort = sorter;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
      }
    }
    let searchParam = {};
    const page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
      // page = 0;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    ExportChartStore
      .loadApps({
        projectId: organizationId,
        sorter: sort,
        datas: postData,
        page,
        size: pagination.pageSize,
      });
  };
  /**
   * 加载应用版本
   * @param appId 应用id
   * @param index 索引号
   */
  loadVersion = (appId, index) => {
    const { ExportChartStore } = this.props;
    ExportChartStore.loadVersionsByAppId(appId, this.state.projectId)
      .then((data) => {
        if (data) {
          this.setState({ [index]: { versions: data.reverse() } });
        }
      });
  };
  /**
   * 选择版本
   * @param index
   * @param value
   */
  handleSelectVersion = (index, value) => {
    const selectedRows = this.state.selectedRows;
    const version = selectedRows[index].versions || [];
    const versionArr = _.map(version, 'id');
    if (!versionArr.includes(parseInt(value, 10))) {
      const { versions, app } = this.state[index];
      const selectedVersion = _.filter(versions, v => v.id === parseInt(value, 10));
      selectedRows[index].versions = version.concat(selectedVersion);
    }
    this.setState({ selectedRows });
  };
  /**
   * 取消选择版本
   * @param index
   */
  clearVersions =(index, value) => {
    const selectedRows = this.state.selectedRows;
    const version = selectedRows[index].versions;
    _.remove(version, v => v.id === parseInt(value, 10));
    selectedRows[index].versions = version;
    this.setState({ selectedRows });
  };
  /**
   * 展开/收起实例
   */
  handleChangeStatus = (id, length) => {
    const { upDown } = this.state;
    const cols = document.getElementsByClassName(`col-${id}`);
    if (_.indexOf(upDown, id) === -1) {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = `${Math.ceil(length / 4) * 31}px`;
      }
      upDown.push(id);
      this.setState({
        upDown,
      });
    } else {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = '31px';
      }
      _.pull(upDown, id);
      this.setState({
        upDown,
      });
    }
  };
  /**
   * 取消
   */
  handleBack = () => {
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    this.props.history.push(`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
  };
  /**
   * 判断第二步是否可点击下一步
   * @returns {boolean}
   */
  checkDisable =() => {
    const selectedRows = this.state.selectedRows;
    let disabled = false;
    for (let i = 0; i < selectedRows.length; i += 1) {
      if ('versions' in selectedRows[i] && selectedRows[i].versions.length === 0) {
        disabled = true;
        return disabled;
      }
    }
    return disabled;
  };
  /**
   * 导出文件
   */
  handleOk =() => {
    const { ExportChartStore, intl } = this.props;
    const selectedRows = this.state.selectedRows;
    const data = [];
    selectedRows.map((s, index) => {
      data.push({ appMarketId: s.id, appVersionIds: _.map(s.versions, 'id') });
      return data;
    });
    this.setState({ submitting: true });
    ExportChartStore.exportChart(this.state.projectId, data)
      .then((res) => {
        const blob = new Blob([res], { type: 'application/zip;charset=utf-8' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.click();
        this.setState({ submitting: false });
        Choerodon.prompt(intl.formatMessage({ id: 'appstore.exportSucc' }));
        this.handleBack();
      });
  };
  /**
   * 取所有的版本
   */
  handleLoadAllVersion = () => {
    const { ExportChartStore } = this.props;
    const selectedRowKeys = this.state.selectedRowKeys;
    selectedRowKeys.map((s, indexs) => {
      ExportChartStore.loadVersionsByAppId(s, this.state.projectId)
        .then((datas) => {
          if (datas) {
            this.setState({ [indexs]: { versions: datas.reverse() } });
          }
          if (indexs === selectedRowKeys.length - 1) {
            this.changeStep(2);
          }
        });
      return indexs;
    });
  };
  /**
   * 渲染第一步
   */
  renderStepOne = () => {
    const { ExportChartStore, intl } = this.props;
    const data = ExportChartStore.app.slice();
    const column = [{
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="appstore.contributor" />,
      dataIndex: 'contributor',
      key: 'contributor',
    }, {
      title: <FormattedMessage id="appstore.category" />,
      dataIndex: 'category',
      key: 'category',
    }, {
      title: <FormattedMessage id="appstore.description" />,
      dataIndex: 'description',
      key: 'description',
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys || [],
      onChange: (selectedRowKeys, selectedRows) => {
        let rows = this.state.selectedRows || [];
        let selectRow = [];
        let key = [];
        rows = rows.concat(selectedRows);
        if (selectedRowKeys.length && data.length) {
          key = selectedRowKeys;
          selectedRowKeys.map((s, indexs) => {
            const ids = _.map(selectRow, 'id');
            if (!ids.includes(s)) {
              selectRow.push(_.filter(rows, v => v.id === s)[0]);// 取消勾选
            }
            return indexs;
          });
        } else {
          key = [];
          rows = [];
          selectRow = [];
        }
        this.setState({ selectedRows: selectRow, selectedRowKeys: key });
      },
    };
    const selectedRows = this.state.selectedRowKeys || [];

    return (
      <div className="c7n-step-section-wrap">
        <p>
          <FormattedMessage id="appstore.exportDes" />
        </p>
        <div className="c7n-step-section">
          <Table
            filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
            loading={ExportChartStore.isLoading}
            pagination={ExportChartStore.pageInfo}
            rowSelection={rowSelection}
            columns={column}
            dataSource={data}
            rowKey={record => record.id}
            onChange={this.appTableChange}
          />
        </div>
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            disabled={selectedRows.length === 0}
            onClick={this.handleLoadAllVersion}
          >
            {intl.formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.handleBack}>取消</Button>
        </div>
      </div>
    );
  };


  /**
   * 渲染第二步
   */
  renderStepTwo = () => {
    const selectedRows = this.state.selectedRows;
    const { ExportChartStore, intl } = this.props;
    return (
      <div className="c7n-step-section-wrap">
        <p>
          <FormattedMessage id="appstore.exportStep2" />
        </p>
        {selectedRows.map((app, index) => (
          <React.Fragment key={app.id}>
            <div className="c7n-step-section">
              <div className="c7n-step-label"><FormattedMessage id="app.name" /></div>
              <span>{app.name}</span>
            </div>
            <div className="c7n-step-section" key={app.id}>
              <Select
                onDeselect={this.clearVersions.bind(this, index)}
                defaultValue={_.map(_.map(this.state.selectedRows[index].versions, 'id'), v => v.toString())}
                onSelect={this.handleSelectVersion.bind(this, index)}
                className={'c7n-step-select'}
                loading={ExportChartStore.isLoading}
                onFocus={this.loadVersion.bind(this, app.id, index)}
                filter
                label={intl.formatMessage({ id: 'app.version' })}
                showSearch
                mode="tags"
                dropdownMatchSelectWidth
                size="default"
                optionFilterProp="children"
                optionLabelProp="children"
                notFoundContent={intl.formatMessage({ id: 'appstore.noVer' })}
                filterOption={
                  (input, option) =>
                    option.props.children
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                { this.state[index].versions.map(v => (
                  <Option key={v.version} value={v.id.toString()}>
                    {v.version}
                  </Option>
                ))}
              </Select>
            </div>
          </React.Fragment>

        ))
        }
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            disabled={this.checkDisable()}
            onClick={this.changeStep.bind(this, 3)}
          >
            {intl.formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" className="c7n-step-clear c7n-step-button" onClick={this.changeStep.bind(this, 1)}>
            {intl.formatMessage({ id: 'previous' })}
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.handleBack}>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
        </div>
      </div>
    );
  }
  /**
   * 渲染第三步
   * @returns {*}
   */
  renderStepThree = () => {
    const { intl } = this.props;
    const { upDown } = this.state;
    const column = [{
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'name',
      key: 'name',
      width: 150,
    }, {
      title: intl.formatMessage({ id: 'app.version' }),
      key: 'version',
      render: record => (<div>
        <div role={'none'} className={`c7n-step-table-column col-${record.id}`} onClick={this.handleChangeStatus.bind(this, record.id, record.versions.length)}>
          {record.versions && document.getElementsByClassName(`${record.id}-col-parents`)[0] && parseInt(window.getComputedStyle(document.getElementsByClassName(`${record.id}-col-parents`)[0]).height, 10) > 31
          && <span className={_.indexOf(upDown, record.id) !== -1
            ? 'icon icon-keyboard_arrow_up c7n-step-table-icon' : 'icon icon-keyboard_arrow_down c7n-step-table-icon'}
          />
          }
          <div className={`${record.id}-col-parents`}>
            {_.map(record.versions, v => <div key={v.id} className="c7n-step-col-circle">{v.version}</div>)}
          </div>
        </div>
      </div>),
    }];
    return (
      <div className="c7n-step-section-wrap">
        <p>
          <FormattedMessage id="appstore.exportStep3" />
        </p>
        <div className="c7n-step-section">
          <Table
            filterBar={false}
            pagination={false}
            columns={column}
            dataSource={this.state.selectedRows}
            rowKey={record => record.id}
          />
        </div>
        <div className="c7n-step-section">
          <Permission service={['devops-service.application-market.importApps']}>
            <Button
              loading={this.state.submitting}
              type="primary"
              funcType="raised"
              className="c7n-step-button"
              // disabled={selectedRows.length === 0}
              onClick={this.handleOk}
            >
              <FormattedMessage id="appstore.export" />
            </Button>
          </Permission>
          <Button funcType="raised" className="c7n-step-clear c7n-step-button" onClick={this.changeStep.bind(this, 2)}>
            {intl.formatMessage({ id: 'previous' })}
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.handleBack}>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
        </div>
      </div>
    );
  }
  

  render() {
    const { intl } = this.props;
    const { current } = this.state;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;

    return (
      <Page
        service={[
          'devops-service.application-market.listAllApp',
          'devops-service.application-market.queryAppVersionsInProject',
          'devops-service.application-market.exportFile',
        ]}
        className="c7n-region"
      >
        <Header title={intl.formatMessage({ id: 'appstore.export' })} backPath={`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`} />
        <Content>
          <h2 className="c7n-space-first">
            <FormattedMessage id="appstore.exportApp" />
          </h2>
          <p>
            <FormattedMessage id="appstore.exportDes" />
            <a href={intl.formatMessage({ id: 'appstore.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <div className="c7n-store-card-wrap" style={{ minHeight: window.innerHeight - 277 }}>
            <Steps current={current}>
              <Step
                title={<span className={current === 1 ? 'c7n-step-active' : ''}>
                  {intl.formatMessage({ id: 'deploy.step.one.app' })}
                </span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                className={`${this.state.selectedRows.length ? '' : 'c7n-step-disabled'}`}
                title={<span className={current === 2 ? 'c7n-step-active' : ''}>
                  {intl.formatMessage({ id: 'deploy.step.one.version.title' })}
                </span>}
                onClick={this.changeStep.bind(this, 2)}
                status={this.getStatus(2)}
              />
              <Step
                className={`${this.checkDisable() ? 'c7n-step-disabled' : ''}`}
                title={<span className={current === 3 ? 'c7n-step-active' : ''}>
                  {intl.formatMessage({ id: 'appstore.confirm' })}
                </span>}
                onClick={this.changeStep.bind(this, 3)}
                status={this.getStatus(3)}
              />
            </Steps>
            {current === 1 && this.renderStepOne()}
            {current === 2 && this.renderStepTwo()}
            {current === 3 && this.renderStepThree()}
          </div>
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(ExportChart));
