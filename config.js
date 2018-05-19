const config = {
    local: true,
    clientId: 'localhost', // 必须填入响应的客户端（本地开发）
    proclientId: 'hapcloudfront', // 必须填入响应的客户端（线上）
    titlename: 'Choerodon', //项目页面的title名称
    favicon: 'a.png', //项目页面的icon图片名称
    theme: true, //是否开启主题色设定
    headerOrganzation: true, //在单个项目时候，是否显示项目名称
    menuCollapse: false, //菜单开始状态是否收缩
    mainCss: JSON.stringify('devops'), //master选择哪个项目的主题
    Masters: JSON.stringify('boot'), //master选择哪个项目模块
    Home: JSON.stringify('iam'), //Home选择哪个项目模块
    themeSetting: {
        antdTheme: {
            'primary-color': '#3F51B5', //antd的主题颜色设定
        },
        header: '#3F51B5', //头部主题颜色设定
        // 折叠主菜单按钮颜色
        toggleButtonColor: '#4a5064',
        // 左侧菜单背景
        leftMenuBackground: '#333744',
        // 左侧子菜单背景ss
        menuBackground: '#42485b',
        // 左侧菜单字体颜色
        leftMenuColor: '#e9e9e9',
        // 左侧菜单字体选中时的颜色
        leftMenuSelectColor: '#6a98ed',
        // 右侧菜单背景
        childMenuBackground: '#eaedf1',
        backgroundColor: 'white', //背景色主题颜色设定
    },
    server: 'http://api.staging.saas.hand-china.com',
    // server: 'http://api.alpha.saas.hand-china.com',
    cookieServer: 'hapcloud.e.vk.vu', //子域名token共享
};

module.exports = config;
