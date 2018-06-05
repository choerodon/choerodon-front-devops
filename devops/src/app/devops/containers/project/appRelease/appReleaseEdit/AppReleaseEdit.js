import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Icon, Upload, Radio, Popover } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import _ from 'lodash';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './AppReleaseEdit.scss';
import icon from './icon.png';
// import './CreateDomain.scss';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
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
const { TextArea } = Input;
const Sidebar = Modal.Sidebar;

@inject('AppState')
@observer
class AppReleaseEdit extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      id: props.match.params.id || '',
      projectId: menu.id,
      show: false,
      isClick: false,
    };
  }
  componentDidMount() {
    const { EditReleaseStore } = this.props;
    const { projectId, id } = this.state;
    if (id) {
      EditReleaseStore.loadDataById(projectId, id);
    } else {
      EditReleaseStore.loadApps(projectId);
    }
  }

  /**
   * 处理图片回显
   * @param img
   * @param callback
   */
  getBase64 =(img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  /**
   * 获取列表的table
   * @returns {*}
   */
  getTable =() => {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.getSelectData;
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      // dataIndex: 'creationDate',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: '46px',
      key: 'action',
      className: 'c7n-network-text_top',
      render: record => (
        <div>
          <Popover trigger="hover" placement="bottom" content={<div>删除</div>}>
            <Button shape="circle" funcType="flat" onClick={this.removeVersion.bind(this, record.id)}>
              <span className="icon-delete_forever" />
            </Button>
          </Popover>
        </div>
      ),
    }];
    return (<Table
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey={record => record.id}
    />);
  };


  /**
   * 获取弹出框的table
   * @returns {*}
   */
  getSidebarTable =() => {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.getVersionData || [{
      id: 1,
      appName: 'ssd',
      creationDate: '2018-05-22 11:19:41',
    }, {
      id: 2,
      appName: 'ssdeee',
      creationDate: '2018-05-22 11:19:41',
    }];
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      // dataIndex: 'creationDate',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys || [],
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows, selectedRowKeys });
      },
      // getCheckboxProps: record => ({
      //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
      //   name: record.name,
      // }),
      // selections: true,
    };
    return (<Table
      loading={EditReleaseStore.loading}
      pagination={EditReleaseStore.versionPage}
      rowSelection={rowSelection} 
      columns={columns} 
      dataSource={data}
      rowKey={record => record.id}
    />);
  };
  /**
   * 删除列表中的数据
   * @param id 版本id
   */
  removeVersion =(id) => {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.getSelectData;
    const selectedRowKeys = this.state.selectedRowKeys;
    _.remove(data, n => n.id === id);
    _.remove(selectedRowKeys, n => n === id);
    EditReleaseStore.setSelectData(data);
    this.setState({ selectedRowKeys });
  };
  /**
   * 检查域名是否符合规则
   * @type {Function}
   */
  checkDomain =_.debounce((rule, value, callback) => {
    const p = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*/;
    if (p.test(value)) {
      callback();
    } else {
      callback('域名只能包含字母，数字、"-"、"."');
    }
  }, 500);
  /**
   * 提交数据
   * @param e
   */
  handleSubmit =(e) => {
    e.preventDefault();
    const { EditReleaseStore } = this.props;
    const selectData = EditReleaseStore.getSelectData;
    const { projectId, id, img } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const postData = data;
        postData.imgUrl = img;
        postData.publishLevel = EditReleaseStore.SingleData.publishLevel;
        if (!id) {
          this.setState({ submitting: true });
          EditReleaseStore.addData(projectId, postData)
            .then((datass) => {
              this.setState({ submitting: false });
              if (datass) {
                this.handleBack();
              }
            }).catch(() => {
              this.setState({ submitting: false });
              Choerodon.prompt(err.response.data.message);
            });
        } else {
          this.setState({ submitting: true });
          postData.id = id;
          EditReleaseStore.updateData(projectId, id, postData)
            .then((datass) => {
              this.setState({ submitting: false });
              if (datass) {
                this.handleBack();
              }
            }).catch((errs) => {
              this.setState({ submitting: false });
              Choerodon.prompt(errs.response.data.message);
            });
        }
      }
    });
  };
  /**
   * 显示添加版本的侧边栏
   */
  handleShowSideBar =() => {
    const { EditReleaseStore } = this.props;
    const { projectId } = this.state;
    const SingleData = EditReleaseStore.getSingleData;
    const appId = SingleData ? SingleData.appId : this.state.appId;
    EditReleaseStore.loadAllVersion(false, projectId, appId);
    this.setState({ show: true });
  };
  /**
   * 添加选择的版本
   */
  handleAddVersion =() => {
    const data = this.state.selectedRows;
    const { EditReleaseStore } = this.props;
    EditReleaseStore.setSelectData(data);
    this.setState({ show: false });
  };
  /**
   * 关闭滑块
   */
  handleClose =() => {
    this.setState({ show: false });
  };
  /**
   * 图标的上传button显示
   */
  showBth =() => {
    this.setState({ showBtn: true });
  };
  /**
   * 图标的上传button隐藏
   */
  hideBth =() => {
    this.setState({ showBtn: false });
  };
  /**
   * 触发上传按钮
   */
  triggerFileBtn =() => {
    this.setState({ isClick: true, showBtn: true });
    const ele = document.getElementById('file');
    ele.click();
  };
  /**
   * 选择文件
   * @param e
   */
  selectFile =(e) => {
    const menu = this.props.AppState.currentMenuType;
    const { EditReleaseStore } = this.props;
    const formdata = new FormData();
    const img = e.target.files[0];
    formdata.append('file', e.target.files[0]);
    EditReleaseStore.uploadFile(menu.organizationId, 'devops-service', img.name.split('.')[0], formdata)
      .then((data) => {
        if (data) {
          this.setState({ img: data });
          this.getBase64(formdata.get('file'), (imgUrl) => {
            const ele = document.getElementById('img');
            ele.style.backgroundImage = `url(${imgUrl})`;
          });
        }
      });
    this.setState({ isClick: false, showBtn: false });
  };
  /**
   * 选择应用
   * @param value
   * @param options
   */
  selectApp =(value, options) => {
    this.setState({ appId: value, appName: options.key });
  };
  /**
   * 返回上一级
   */
  handleBack =() => {
    const menu = this.props.AppState.currentMenuType;
    const { EditReleaseStore } = this.props;
    EditReleaseStore.setSelectData([]);
    EditReleaseStore.setSingleData(null);
    this.props.history.push(`/devops/app-release?type=${menu.type}&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`);
  };
  render() {
    const { EditReleaseStore } = this.props;
    const { getFieldDecorator } = this.props.form;
    const menu = this.props.AppState.currentMenuType;
    const app = EditReleaseStore.apps;
    const SingleData = EditReleaseStore.getSingleData;
    const form = this.props.form;
    const content = '您可以在此修改应用发布的展示信息，包括贡献者、分类及应用描述。';
    const contentDom = (<div className="c7n-region c7n-domainCreate-wrapper">
      <h2 className="c7n-space-first">修改应用&quot;{SingleData && SingleData.name}&quot;的信息</h2>
      <p>
        {content}
        <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
          <span className="c7n-external-link-content">
              了解详情
          </span>
          <span className="icon-open_in_new" />
        </a>
      </p>
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          <div className="c7n-appRelease-img">
            <div
              style={{ backgroundImage: SingleData && SingleData.imgUrl !== null ? `url(${SingleData.imgUrl})` : '' }}
              className="c7n-appRelease-img-hover"
              id="img"
              onMouseLeave={this.state.isClick ? () => {} : this.hideBth}
              onMouseEnter={this.showBth}
              onClick={this.triggerFileBtn}
              role="none"
            >
              {this.state.showBtn && <div className="c7n-appRelease-img-child">
                <span className="icon-photo_camera" />
                <Input id="file" type="file" onChange={this.selectFile} style={{ display: 'none' }} />
              </div>
              }
            </div>
            <span className="c7n-appRelease-img-title">应用图标</span>
          </div>
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('contributor', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              // validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.contributor : menu.name,
          })(
            <Input
              maxLength={30}
              label={Choerodon.getMessage('贡献者', 'contributor')}
              size="default"
              // placeholder={Choerodon.getMessage('域名路径', 'domain path')}
            />,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('category', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              // validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.category : '',
          })(
            <Input
              maxLength={10}
              label={Choerodon.getMessage('分类', 'category')}
              size="default"
              // placeholder={Choerodon.getMessage('域名路径', 'domain path')}
            />,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('description', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              // validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.description : '',
          })(
            <TextArea
              maxLength={200}
              label={Choerodon.languageChange('template.description')}
              autosize={{ minRows: 2, maxRows: 6 }}
            />,
          )}
        </FormItem>
        <div className="c7n-appRelease-hr" />
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          <Permission service={['devops-service.application-market.update']}>
            <Button
              onClick={this.handleSubmit}
              type="primary"
              funcType="raised"
              className="sidebar-btn"
              style={{ marginRight: 12 }}
              loading={this.state.submitting}
            >
              {Choerodon.getMessage('保存', 'Save')}</Button>
          </Permission>
          <Button
            funcType="raised"
            disabled={this.state.submitting}
            onClick={this.handleBack}
          >
            {Choerodon.getMessage('取消', 'Cancel')}</Button>
        </FormItem>
      </Form>
    </div>);
    return (
      <div className="c7n-region page-container">
        <PageHeader title="修改应用信息" backPath={`/devops/app-release?type=${menu.type}&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`} />
        <div className="page-content c7n-appRelease-wrapper">
          {contentDom}
        </div>
      </div>
    );
  }
}

export default Form.create({})(withRouter(AppReleaseEdit));
