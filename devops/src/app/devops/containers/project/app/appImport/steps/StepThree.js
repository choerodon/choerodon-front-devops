import React, { Component, Fragment } from 'react';
import _ from "lodash";
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Radio, Table, Tag } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import '../AppImport.scss';

const RadioGroup = Radio.Group;
const { AppState } = stores;

@observer
class StepThree extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      checked: this.props.values.isSkipCheckPermission || 'all',
      selectedTemp: [],
      selectedRowKeys: this.props.values.userIds || [],
      selected: this.props.values.membersInfo || [],
    }
  }

  componentDidMount() {
    const { store } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    store.loadPrm(projectId);
  }

  onChange = e => this.setState({ checked: e.target.value });

  onSelectChange = (keys, selected) => {
    let s = [];
    const a = this.state.selectedTemp.concat(selected);
    this.setState({ selectedTemp: a });
    _.map(keys, o => {
      if (_.filter(a, ["iamUserId", o]).length) {
        s.push(_.filter(a, ["iamUserId", o])[0]);
      }
    });
    this.setState({ selectedRowKeys: keys, selected: s });
  };

  /**
   * table 操作
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  mbrTableChange = (pagination, filters, sorter, paras) => {
    const { store } = this.props;
    const { id } = AppState.currentMenuType;
    store.setMbrInfo({ filters, sort: sorter, paras });
    let sort = { field: "", order: "desc" };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === "ascend") {
        sort.order = "asc";
      } else if (sorter.order === "descend") {
        sort.order = "desc";
      }
    }
    let searchParam = {};
    let page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    store.loadPrm(id, page, pagination.pageSize, sort, postData);
  };

  next = () => {
    const { onNext } = this.props;
    const { checked, selectedRowKeys, selected } = this.state;
    const values = {
      key: 'step2',
      isSkipCheckPermission: checked,
      userIds: selectedRowKeys,
      membersInfo: selected,
    };
    onNext(values);
  };

  render() {
    const {
      onPrevious,
      onCancel,
      store: {
        getMbrPageInfo,
        getTableLoading: tableLoading,
        getMbr,
        getMbrInfo: { filters, paras: mbrParas },
      },
      intl: { formatMessage },
    } = this.props;
    const { checked, selectedRowKeys, selected } = this.state;
    const tagDom = _.map(selected, t => (
      <Tag className="c7n-import-tag" key={t.iamUserId}>
        {t.loginName} {t.realName}
      </Tag>
    ));
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        key: "loginName",
        filters: [],
        filteredValue: filters.loginName || [],
        title: formatMessage({
          id: "envPl.loginName",
        }),
        dataIndex: "loginName",
      },
      {
        key: "realName",
        filters: [],
        filteredValue: filters.realName || [],
        title: formatMessage({
          id: "envPl.userName",
        }),
        dataIndex: "realName",
      },
    ];

    return (
      <Fragment>
        <div className="steps-content-des">
          <FormattedMessage id="app.import.step3.des" />
        </div>
        <div className="steps-content-section">
          <div className="authority-radio">
            <RadioGroup
              label={<FormattedMessage id="app.authority.label" />}
              onChange={this.onChange}
              value={checked}
            >
              <Radio value={'all'}>
                <FormattedMessage id="app.mbr.all" />
              </Radio>
              <Radio value={'part'}>
                <FormattedMessage id="app.mbr.part" />
              </Radio>
            </RadioGroup>
          </div>
          {checked === 'all' ? null : (
            <div>
              <div className="c7n-sidebar-form">
                <Table
                  className="c7n-env-noTotal"
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={getMbr}
                  filterBarPlaceholder={formatMessage({ id: "filter" })}
                  pagination={getMbrPageInfo}
                  loading={tableLoading}
                  onChange={this.mbrTableChange}
                  rowKey={record => record.iamUserId}
                  filters={mbrParas.slice()}
                />
              </div>
              <div className="tag-title">
                <FormattedMessage id="app.authority.mbr" />
              </div>
              <div className="tag-wrap">
                {tagDom}
              </div>
            </div>
          )}
        </div>
        <div className="steps-content-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.next}
          >
            <FormattedMessage id="next" />
          </Button>
          <Button
            onClick={onPrevious}
            funcType="raised"
            className="ant-btn-cancel"
          >
            <FormattedMessage id="previous" />
          </Button>
          <Button
            onClick={onCancel}
            funcType="raised"
            className="ant-btn-cancel"
          >
            <FormattedMessage id="cancel" />
          </Button>
        </div>
      </Fragment>
    )
  }
}

export default injectIntl(StepThree);
