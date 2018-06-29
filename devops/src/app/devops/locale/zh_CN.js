// zh_CN.js
// 文档地址前缀
const docServer = 'http://v0-7.choerodon.io/zh/docs';
// 界面标题描述统一管理
const pageDetail = {

  // network
  'network.title': '项目"{name}"的网络配置',
  'network.description': '网络管理是定义了一种访问网络的策略，是指内部的负载均衡以及网络转发，会将网络流量定向转发到指定的单个或者多个实例容器组。',
  'network.link': `${docServer}/user-guide/deployment-pipeline/service/`,
  'network.create.title': '项目"{name}"中创建网络',
  'network.create.description': '请选择环境及实例，配置网络转发策略。目前支持内部和外部两种网络转发方式。\n' +
  '        转发内部网络，则只需定义端口即可，系统会自动为您分配集群内部IP；转发外部网络，则需要定义外部IP及端口。',
  'network.create.link': `${docServer}/user-guide/deployment-pipeline/service/`,
  'network.update.title': '对网络"{name}"进行修改',
  'network.update.description': '您可在此修改网络配置信息。',
  'network.update.link': `${docServer}/user-guide/deployment-pipeline/service/`,

  // 环境
  'env.title': '项目"{name}"的环境流水线',
  'env.description': '环境是指一个应用可以被部署的地方。常见环境有开发测试环境，预生产环境，生产环境等。平台自动为您的项目生成一条环境流水线，您可在下方拖拽需要调整顺序的环境至目标位置。',
  'env.link': `${docServer}/user-guide/deployment-pipeline/environment-pipeline/`,
  'env.create.title': '项目"{name}"的环境创建',
  'env.create.description': '请在下面输入环境编码、名称、描述，创建新环境。新环境默认新增在环境流水线的最后一个节点。',
  'env.create.link': `${docServer}/user-guide/deployment-pipeline/environment-pipeline/`,
  'env.update.title': '对"{name}"环境修改',
  'env.update.description': '您可在此修改环境名称及描述，也可以复制指令至Kubernetes运行，与平台建立连接。',
  'env.update.link': `${docServer}/user-guide/deployment-pipeline/environment-pipeline/`,
  'env.token.title': '复制环境"{name}"的指令',
  'env.token.description': '复制下文代码至Kubernetes运行，与平台建立链接。',
  'env.token.link': `${docServer}/user-guide/deployment-pipeline/environment-pipeline/`,
  'env.stop.title': '项目"{name}"的环境停用区',
  'env.stop.description': '您可在此查看已被停用的环境，也可以重新启用这些环境',

  // domain
  'domain.title': '项目"{name}"的域名管理',
  'domain.description': '域名管理是将您已经预定义好的域名在平台中进行配置，使外部能够通过指定的域名访问到系统内部的实例。',
  'domain.link': `${docServer}/user-guide/deployment-pipeline/ingress`,
  'domain.create.title': '在项目"{name}"中创建域名',
  'domain.create.description': '请选择环境，填写域名名称、地址、路径，并选择网络配置域名访问规则。',
  'domain.create.link': `${docServer}/user-guide/deployment-pipeline/service/`,
  'domain.update.title': '对域名"{name}"进行修改',
  'domain.update.description': '您可在此修改域名配置信息。',
  'domain.update.link': `${docServer}/user-guide/deployment-pipeline/service/`,

  // deploymentApp
  'deploy.title': '项目"{name}"的部署应用',
  'deploy.description': '应用部署是一个将某版本的应用部署至某环境的操作。您可以在此按指引分步骤完成应用部署。',
  'deploy.link': `${docServer}/user-guide/deployment-pipeline/application-deployment/`,
  'deploy.sidebar.title': '项目"{name}"的部署选择应用',
  'deploy.sidebar.description': '您可以在此灵活选择来源于本项目及应用市场的应用，且有列表式及卡片式两种展示方式可以切换。',
  'deploy.sidebar.link': `${docServer}/user-guide/deployment-pipeline/application-deployment/`,

  // appRelease
  'release.title': '项目"{name}"的应用发布',
  'release.description': '应用发布是可以将您研发的应用发布至其他项目使用，可发布的范围有本组织或全平台下的所有项目。并且可以控制发布应用版本的范围。',
  'release.link': `${docServer}/user-guide/application-market/application-release/`,
  'release.add.title': '项目"{name}"的应用发布',
  'release.add.description': '应用发布是可以将您研发的应用发布至其他项目使用，可发布的范围有本组织或全平台下的所有项目。并且可以控制发布应用版本的范围。',
  'release.edit.title': '修改应用"{name}"的信息',
  'release.edit.description': '您可以在此修改应用发布的展示信息，包括贡献者、分类及应用描述。',
  'release.editVersion.title': '查看应用"{name}"的版本',
  'release.editVersion.description': '您可以在此查看未发布及已发布的版本，且可以发布未发布的版本。',
  'release.addVersion.title': '添加应用"{name}"发布的版本',
  'release.addVersion.description': '您可以在此勾选并添加需要发布的版本。',

  // container
  'container.title': '项目"{name}"的容器管理',
  'container.description': '容器管理便于您查看和管理Kubernetes中应用实例生成的容器， 可以实时查看相关容器的地址、创建时间、状态，确定容器是否正常运行且通过健康检查，并且可以查看容器日志进行错误定位和状态监控。',
  'container.link': `${docServer}/user-guide/deployment-pipeline/container/`,
  'container.log.title': '查看容器"{name}"的日志',
  'container.log.description': '您可在此查看该容器的日志进行错误定位和状态监控。',

  // template
  'template.head': '组织\"{name}\"的应用模板',
  'template.createHead': '在组织\"{name}\"中创建应用模板',
  'template.edit': '对应用模板\"{name}\"进行修改',
  'template.editDescription': '您可在此修改应用名称及描述。',
  'template.delDescription': '确定要删除该应用模板吗？',
  'template.createDescription': '请在下面输入应用模板编码、名称、描述，创建默认空白模板。您也可以通过复制于现有模板，以便节省部分操作，提升效率。',
  'template.description': '应用模板是将同类型应用的代码库结构整理成模板，用于创建应用时能引用相应模板快速创建初始代码库。您也可以根据实际情况自定义应用模板。',
  'template.link': `${docServer}/user-guide/development-pipeline/application-template/`,

  // app
  'app.head': '项目\"{name}\"的应用管理',
  'app.createApp': '在项目\"{name}\"中创建应用',
  'app.editApp': '对应用\"{name}\"进行修改',
  'app.editDescription': '您可在此修改应用名称。',
  'app.description': '应用是满足用户某些需求的程序代码的集合，可以是某个解耦的微服务或是某个单体应用。您可在此创建应用、修改应用名称、停用应用、启用应用及分支管理。',
  'app.createDescription': '请在下面输入应用编码及名称，也可以选择某个应用模板，快速创建应用。平台会为您自动创建对应的git库以便管理该应用代码。',
  'app.link': `${docServer}/user-guide/development-pipeline/application-management/`,

  // branch
  'branch.head': '应用\"{name}\"的分支管理',
  'branch.createHead': '在应用\"{name}\"中创建分支',
  'branch.createDes': '采用Gitflow工作流模式，请在下面选择分支类型，并填写issue号或版本号，即可创建分支。',
  'branch.mergeDev': '是否将分支\"{name}\"合并到develop分支？',
  'branch.noCommitDev': '是否将分支\"{name}\"分支无提交，是否删除？',
  'branch.noCommit': '是否将分支\"{name}\"分支无提交，不生成版本号，是否删除？',
  'branch.mergeDevMas': '是否将分支\"{name}\"合并到master，develop分支，并以为\"{version}\"版本号？',
  'branch.description': '分支是将您的工作从开发主线上分离开来，以免影响开发主线。平台采用gitflow分支模型，您可以在此创建分支，然后将代码拉至本地开发后提交代码，再结束分支，平台会为您合并代码并触发相应的持续集成流水线。',
  'branch.createTip': '采用gitflow分支模型，可创建feature、release、hotfix等分支，结束分支时自动触发分支合并和特有的持续集成流水线。',
  'branch.link': `${docServer}/user-guide/development-pipeline/branch-management/`,

  // ist
  'ist.head': '项目\"{name}\"的实例',
  'ist.editHead': '对\"{name}\"进行修改',
  'ist.editDes': '对实例配置信息进行修改后重新部署。',
  'ist.isthead': '查看应用\"{name}\"的实例详情',
  'ist.istDes': '您可在此查看该实例的运行详情及部署详情。运行详情包括各资源对象的基本信息；部署详情包括配置信息及部署阶段及日志。',
  'ist.description': '您可在此用四种方式查看该项目下应用的实例情况。',
  'ist.link': `${docServer}/user-guide/development-pipeline/instance/`,

  // appstore
  'appstore.headDes': '您可以在此查看已发布的应用及其详细信息，并选择版本进行部署。',
  'appstore.exportDes': '您可以在此选择相应的应用，并选择版本进行导出。',
  'appstore.importDes': '您可以在此选择相应的应用，上传文件后并进行导入。',
  'appstore.exportStep1': '您可以在此选择想要导出的应用，您可以一次选择多个应用。',
  'appstore.exportStep2': '您可以在此选择想要导出的版本。',
  'appstore.exportStep3': '您可以在此确认应用发布的信息，如需修改请返回相应步骤。',
  'appstore.importStep1': '您可以在此选择相应的文件，并进行上传。',
  'appstore.importStep2': '您可以在此选择是否发布，如果发布还可以选择发布的范围。若本组织内所有项目均可使用，则选择本组织；若全平台下的所有项目均可使用，则选择全平台。',
  'appstore.importStep3': '您可以在此确认上传应用的信息，如需修改请返回上一步。',
  'appstore.link': `${docServer}/user-guide/application-market/application-market/`,

  // appVersion
  'appVer.head': '项目\"{name}\"的应用版本管理',
  'appVer.description': '应用版本是应用迭代升级生成的版本。您可在此查看版本号、应用编码、应用名称以及版本生成时间。',
  'appVer.link': `${docServer}/user-guide/development-pipeline/application-version/`,

  // ci-pipeline
  'ciPipeline.head': '项目\"{name}\"的持续集成',
  'ciPipeline.description': '您可在此查看各应用所有持续集成流水线的运行情况。',
  'ciPipeline.link': `${docServer}/user-guide/development-pipeline/continuous-integration/`,

};

const zhCN = {
  // public
  refresh: '刷新',
  detail: '详情',
  operate: '操作',
  save: '保存',
  active: '启用',
  edit: '修改',
  cancel: '取消',
  delete: '删除',
  'confirm.delete': '确认删除吗？',
  'confirm.delete.tip': '当你点击删除后，该条数据将被永久删除，不可恢复!',
  MicroApp: '微应用',
  MicroAppUI: 'Web前端',
  Mobile: '移动',
  Application: '普通应用',
  JavaLib: 'Java 库',
  create: '创建',
  running: '运行中',
  operating: '处理中',
  stopping: '停止中',
  deleting: '删除中',
  pending: '部署中',
  stoped: '已停止',
  failed: '创建失败',
  deleted: '已删除',
  install_failed: '创建失败',
  upgrade_failed: '更新失败',
  starting_failed: '重启失败',
  stop_failed: '停止失败',
  delete_failed: '删除失败',
  deploy_failed: '部署失败',
  rollback_failed: '回滚失败',
  null: '无',
  learnmore: '了解详情',
  required: '该字段是必输的',
  connect: '已连接',
  disconnect: '未连接',
  project: '本项目',
  market: '应用市场',
  organization: '本组织',
  public: '全平台',
  filter: '过滤表',
  stop: '停用',
  previous: '上一步',
  next: '下一步',
  finish: '结束',
  ok: '确定',
  language: 'zh_CN',

  // ist
  ist_create: '创建中',
  ist_stop: '停止中',
  ist_restart: '重启中',
  ist_delete: '删除中',
  ist_update: '更新中',
  'ist.title': '实例',
  'ist.name': '名称：',
  'ist.ctr': '贡献者：',
  'ist.des': '描述：',
  'ist.code': '编码：',
  'ist.sec': '秒',
  'ist.min': '分',
  'ist.hour': '时',
  'ist.day': '天',
  'ist.time': '时间',
  'ist.view': '查看视图：',
  'ist.instance': '部署实例',
  'ist.singleEnv': '单环境',
  'ist.singleApp': '单应用',
  'ist.multiApp': '多应用',
  'ist.detail': '查看实例详情',
  'ist.values': '修改配置信息',
  'ist.del': '删除实例',
  'ist.stop': '停止实例',
  'ist.noIst': '暂无实例',
  'ist.y': '可用',
  'ist.n': '不可用',
  'ist.noAdd': '未添加',
  'ist.noAddEnv': '未添加环境',
  'ist.run': '重启实例',
  'ist.reDeploy': '重新部署',
  'ist.nolog': '没有日志信息。',
  'ist.noApp': '暂无应用',
  'ist.runDetial': '运行详情',
  'ist.lastVer': '最新版本',
  'ist.noChoose': '请先选择应用和环境',
  'ist.more': '展开更多',
  'ist.yamlErr': '请先修改yaml格式错误',
  'ist.delDes': '删除实例将不可恢复，其配置网络同时失效，确定要删除该实例吗？',

  // network
  network_create: '网络创建中，请耐心等待',
  network_delete: '网络删除中，请耐心等待',
  network_update: '网络更新中，请耐心等待',
  'network.header.title': '网络管理',
  'network.header.create': '创建网络',
  'network.header.update': '修改网络',
  'network.column.name': '名称',
  'network.column.status': '状态',
  'network.column.env': '环境名称',
  'network.column.ip': '外部IP',
  'network.column.port': '端口',
  'network.column.targetPort': '目标端口',
  'network.column.app': '应用',
  'network.column.version': '版本',
  'network.column.instance': '部署实例',
  'network.delete': '删除网络',
  'network.delete.tooltip': '删除网络后，需要您再去修改相关的域名信息。确定要删除该网络吗',
  'network.env.tooltip': '请先连接环境',
  'network.form.name': '网络名称',
  'network.form.ip': '外部IP',
  'network.form.port': '端口',
  'network.form.targetPort': '目标端口',
  'network.form.app': '应用名称',
  'network.form.instance': '实例',
  'network.name.check.failed': '编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾',
  'network.name.check.exist': '名称已存在',
  'network.ip.check.failed': '请输入正确的ip类似 (0-255).(0-255).(0-255).(0-255)',
  'network.instance.check.failed': '请移除不可用实例',
  'network.port.check.failed': '该字段必须是数字且大小在0-65535之间',
  'network.form.version.null': '请先选择一个版本',
  'network.form.version.checked': '该应用下没有多余的可用版本',
  'network.form.app.disable': '请先选择环境',
  'network.form.version.disable': '请先选择应用',
  'network.form.instance.disable': '请先选择版本',
  'network.btn.add': '添加版本',
  'network.form.targetPort.help': '网络选择的目标实例所暴露的端口号',

  // deploymentApp
  'deploy.title': '应用部署',
  'deploy.detail': '部署详情',
  'deploy.info': '部署信息',
  'deploy.stage': '阶段及日志',
  'deploy.status': '容器状态',
  'deploy.istStatus': '实例状态',
  'deploy.appName': '应用名称',
  'deploy.instance': '实例名称',
  'deploy.envName': '环境名称',
  'deploy.app': '应用',
  'deploy.ver': '版本',
  'deploy.env': '环境',
  'deploy.cNumber': '容器数量',
  'deploy.header.title': '部署应用',
  'deploy.step.one.title': '选择应用及版本',
  'deploy.step.one.description': '您可以点击“打开应用列表”，选择本项目的应用或来自应用市场的应用，再在此界面选择需要部署的版本。',
  'deploy.app.add': '打开应用列表',
  'deploy.step.one.app': '选择应用',
  'deploy.step.one.version.title': '选择版本',
  'deploy.step.one.version': '应用版本',
  'deploy.step.two.title': '选择环境及修改配置信息',
  'deploy.step.two.description': '请在此选择需要部署的环境并修改相关配置信息，平台默认会引用该应用上次在该环境部署的信息。',
  'deploy.step.two.env.title': '选择环境',
  'deploy.step.two.env': '环境',
  'deploy.step.two.config': '配置信息',
  'deploy.step.three.title': '选择部署模式',
  'deploy.step.three.description': '平台支持两种部署模式：新建实例和替换实例。新建实例是部署生成新的实例；替换实例是等待新部署生成的副本集通过健康检查后再删除原副本集，但实例不变，只替换其相关参数。',
  'deploy.step.three.mode.title': '选择部署模式',
  'deploy.step.three.mode': '部署模式',
  'deploy.step.three.mode.new': '新建实例',
  'deploy.step.three.mode.replace': '替换实例',
  'deploy.step.three.mode.replace.label': '选择要的替换实例',
  'deploy.step.three.mode.help': '替换实例会更新该实例的镜像及配置信息，请确认要替换的实例选择无误。',
  'deploy.step.four.title': '确认信息及部署',
  'deploy.step.four.app': '应用名称',
  'deploy.step.four.version': '应用版本',
  'deploy.btn.deploy': '部署',
  'deploy.sidebar.project': '项目应用',
  'deploy.sidebar.market': '应用市场',
  'deploy.sidebar.search': '搜索应用',

  // envPipeline
  'envPl.title': '环境流水线',
  'envPl.create': '创建环境',
  'envPl.edit': '修改环境',
  'envPl.update': '修改环境',
  'envPl.form.name': '环境名称',
  'envPl.form.code': '环境编码',
  'envPl.form.description': '环境描述',
  'envPl.close': '关闭',
  'envPl.confirm.disable': '确认禁用',
  'envPl.confirm.content.hasInstance': '该环境下存在实例，不可禁用',
  'envPl.confirm.content.noInstance': '当你点击确认后，该环境将被禁用',
  'envPl.code.copy.tooltip': '复制下文代码至Kubernetes运行，与平台建立链接',
  'envPl.code.check.failed': '编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾',
  'envPl.code.check.exist': '编码已存在',
  'envPl.name.check.exist': '编码已存在',
  'envPl.token.copy.tooltip': '复制指令',
  'envPl.status.stop': '暂无停用环境',
  'envPl.status.restart': '重启环境',
  'envPl.status.stopped': '已停用',
  'envPl.description': '描述:',
  'envPl.token': '指令',
  'envPl.status.update': '版本过低，请更新',
  'envPl.active': '激活环境',
  'envPl.stop': '停用环境',
  'envPl.add': '请添加一个环境',

  // app
  'app.title': '应用管理',
  'app.appDetail': '应用详情',
  'app.id': '标识',
  'app.name': '名称',
  'app.type': '应用类型',
  'app.url': '仓库地址',
  'app.active': '状态',
  'app.delete.tip': '这将会删除gitlab代码库，请确认是否删除？',
  'app.detail': '详情',
  'app.stop': '停用',
  'app.run': '启用',
  'app.creating': '创建中',
  'app.synch': '应用同步中',
  'app.start': '请先启用应用',
  'app.create': '创建应用',
  'app.edit': '修改应用',
  'app.chooseTem': '选择应用模板',
  'app.image': '镜像',
  'app.env': '发布环境',
  'app.publish': '发布',
  'app.branchName': '分支名称',
  'app.branch': '分支',
  'app.branchManage': '分支管理',
  'app.branchType': '分支类型',
  'app.commitCode': '提交编码',
  'app.commitDescription': '提交描述',
  'app.commitUser': '提交者',
  'app.stage': '阶段',
  'app.creator': '创建者',
  'app.commitTime': '提交时间',
  'app.pipeline': '流水线',
  'app.status': '服务状态',

  // 应用版本
  'app.version': '应用版本',
  'app.appVersion': '版本',
  'app.commit': '提交',
  'app.group': '应用组',
  'app.code': '编码',
  'app.createTime': '生成时间',

  // environment
  'environment.title': '环境管理',
  'environment.name': '环境名称',
  'environment.url': '环境地址',
  'environment.token': '环境密钥',
  'environment.active': '环境状态',
  'environment.level': '环境所属',
  'environment.description': '环境描述',

  // template
  'template.title': '应用模板',
  'template.name': '名称',
  'template.des': '描述',
  'template.create': '创建应用模板',
  'template.edit': '修改应用模板',
  'template.del': '删除模板',
  'template.copy': '复制于',
  'template.url': '地址',
  'template.code': '编码',
  'template.type': '来源',
  'template.copyFrom': '复制于现有应用模板',
  'template.preDefine': '预定义',
  'template.perDefine': '自定义',
  'template.checkCode': '编码已存在',
  'template.checkName': '名称已存在',
  'template.checkCodeReg': '编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾',


  // branch
  'branch.create': '创建分支',
  'branch.title': '分支管理',
  'branch.branchType': '分支类型',
  'branch.list': '分支列表',
  'branch.tagList': '标记列表',
  'branch.name': '名称',
  'branch.type': '类型',
  'branch.code': '提交编码',
  'branch.des': '提交描述',
  'branch.owner': '提交者',
  'branch.time': '提交时间',
  'branch.tag': '标记',
  'branch.over': '结束分支',
  'branch.checkName': '名称只能包含数字和".",并且以数字开头和结尾',
  'branch.checkNameEnd': '不能以"/"、"."、".lock"结尾',
  'branch.check': '只能包含字母、数字、\'——\'、\'_\'',
  'branch.master': 'master分支',
  'branch.develop': 'develop分支',
  'branch.feature': 'feature分支',
  'branch.release': 'release分支',
  'branch.hotfix': 'hotfix分支',
  'branch.masterDes': '即主分支，用于版本持续发布。在开发的整个阶段一直存在，平时不在此分支开发，因此代码比较稳定。',
  'branch.developDes': '即开发分支，用于日常开发持续集成。在开发的整个阶段一直存在，在feature分支、release分支和hotfix分支开发后都会将代码合并到此分支上。',
  'branch.featureDes': '即特性分支，用于日常开发时切出分支进行单功能开发。基于develop分支创建，结束分支时合并至develop分支。',
  'branch.releaseDes': '即发布分支，用于产品发布、产品迭代。基于develop分支创建，结束分支时合并到develop分支和master分支。',
  'branch.hotfixDes': ' 即热修分支，用于产品发布后修复缺陷。基于master分支创建，结束分支时合并到master分支和develop分支。',
  'branch.devConflictMes': '\"{name}\"合并到develop分支冲突，请在本地查看并合并。\n' +
  '\n' +
  '步骤 1. 获取并切换到\"{name}\"分支\n' +
  'git checkout develop\n' +
  'git fetch origin \"{name}\":\"{name}\"\n' +
  'git checkout \"{name}\"\n' +
  '\n' +
  '步骤 2. 检查修改\n' +
  '\n' +
  '步骤 3. 合并\"{name}\"分支到develop，解决冲突并提交到本地仓库\n' +
  'git checkout develop\n' +
  'git pull origin develop\n' +
  'git merge --no-ff \"{name}\"\n' +
  '\n' +
  '步骤 4. 推送develop分支到远程仓库\n' +
  'git push origin develop\n' +
  '\n' +
  '点击取消关闭弹窗或解决冲突后再点击结束。',

  'branch.masterConflictMes': '\"{name}\"合并到master分支冲突，请在本地查看并合并。\n' +
  '\n' +
  '步骤 1. 获取并切换到\"{name}\"分支\n' +
  'git checkout master\n' +
  'git fetch origin \"{name}\":\"{name}\"\n' +
  'git checkout \"{name}\"\n' +
  '\n' +
  '步骤 2. 检查修改\n' +
  '\n' +
  '步骤 3. 合并\"{name}\"分支到master，解决冲突并提交到本地仓库\n' +
  'git checkout master\n' +
  'git pull origin master\n' +
  'git merge --no-ff \"{name}\"\n' +
  '\n' +
  '步骤 4. 推送master分支到远程仓库\n' +
  'git push origin master\n' +
  '\n' +
  '点击取消关闭弹窗或解决冲突后再点击结束。',

  'branch.bothConflictMes': '\"{name}\"合并到develop分支和master分支均有冲突，请在本地查看并合并。\n' +
  '\n' +
  '步骤 1. 获取并切换到\"{name}\"分支\n' +
  'git checkout develop\n' +
  'git fetch origin \"{name}\":\"{name}\"\n' +
  'git checkout \"{name}\"\n' +
  '\n' +
  '步骤 2. 检查修改\n' +
  '\n' +
  '步骤 3. 合并\"{name}\"分支到master，解决冲突并提交到本地仓库\n' +
  'git checkout master\n' +
  'git pull origin master\n' +
  'git merge --no-ff \"{name}\"\n' +
  '\n' +
  '步骤 4. 推送master分支到远程仓库\n' +
  'git push origin master\n' +
  '\n' +
  '步骤 5. 合并\"{name}\"分支到develop，解决冲突并提交到本地仓库\n' +
  'git checkout develop\n' +
  'git pull origin develop\n' +
  'git merge --no-ff \"{name}\"\n' +
  '\n' +
  '步骤 6. 推送develop分支到远程仓库\n' +
  'git push origin develop\n' +
  '\n' +
  '点击取消关闭弹窗或解决冲突后再点击结束。',

  // ciPipeline
  'ciPipeline.title': '持续集成',
  'ciPipeline.status': '状态',
  'ciPipeline.sign': '标识',
  'ciPipeline.appCode': '应用编码',
  'ciPipeline.appName': '应用名称',
  'ciPipeline.commit': '提交',
  'ciPipeline.jobs': '阶段',
  'ciPipeline.time': '时长',
  'ciPipeline.createdAt': '创建时间',

  // resource
  'resource.title': '资源管理',
  'resource.name': '资源名称',
  'resource.description': '资源描述',
  'resource.type': '资源类型',

  // container
  'container.header.title': '容器管理',
  'container.status': '状态',
  'container.name': '容器名称',
  'container.app': '应用',
  'container.ip': '容器地址',
  'container.usable': '可用',
  'container.disable': '不可用',
  'container.createTime': '已创建',
  'container.log': '容器日志',
  'container.log.header.title': '查看容器日志',

  // version feature
  'version.feature': '特性',
  'version.commit': '提交',
  'version.creator': '贡献者',
  'version.createTime': '时间',

  // domain
  'domain.header.title': '域名管理',
  'domain.header.create': '创建域名',
  'domain.header.update': '修改域名',
  'domain.header.delete': '删除域名',
  'domain.column.name': '域名名称',
  'domain.column.status': '状态',
  'domain.column.env': '环境名称',
  'domain.column.network': '网络',
  'domain.column.path': '路径',
  'domain.column.domain': '地址',
  'domain.form.domain': '域名地址',
  domain_create: '域名创建中，请耐心等待',
  domain_delete: '域名删除中，请耐心等待',
  domain_update: '域名更新中，请耐心等待',
  'domain.name.check.exist': '名称已存在',
  'domain.name.check.failed': '由小写字母、数字、\'-\'或\'.\'组成，并且必须以字母、数字开始和结束',
  'domain.path.check.exist': '路径在该域名路径下已存在，请更改路径或者域名路径',
  'domain.network.check.failed': '请移除不可用的网络',
  'domain.path.add': '添加路径',
  'domain.path.isnull': '请先填写路径',

  // appstore
  'appstore.title': '应用市场',
  'appstore.noMD': '# 暂无',
  'appstore.deploy': '部署',
  'appstore.category': '分类',
  'appstore.lastDate': '上次更新日期',
  'appstore.doc': '教程和文档',
  'appstore.name': '名称',
  'appstore.contributor': '贡献者',
  'appstore.description': '描述',
  'appstore.noReleaseApp': '暂无已发布应用',
  'appstore.noVer': '该应用下没有版本生成',
  'appstore.import': '应用导入',
  'appstore.importSucc': '导入成功',
  'appstore.export': '应用导出',
  'appstore.search': '搜索应用名称或类型',
  'appstore.exportSucc': '导出成功',
  'appstore.exportApp': '导出应用',
  'appstore.importApp': '导入应用',
  'appstore.confirm': '确认信息',
  'appstore.fileSize': '文件大小不能超过1M',
  'appstore.fileType': '文件格式错误',
  'appstore.ynRelease': '是否发布',
  'appstore.N': '否',
  'appstore.Y': '是',
  'appstore.reTip': '提示：本次不发布，之后还可以重新发布，但本次版本信息不会保留。',
  'appstore.ChooseFile': '选择文件',

  // app-release
  'release.home.header.title': '应用发布',
  'release.home.app.publish': '已发布应用',
  'release.home.app.unpublish': '未发布应用',
  'release.column.level': '发布范围',
  'release.action.version': '版本控制',
  'release.action.publish': '发布应用',
  'release.add.step.one.title': '选择应用',
  'release.add.step.one.description': '您可以在此选择需要发布的应用。',
  'release.add.step.two.title': '选择发布版本',
  'release.add.step.two.description': '您可以在此点击添加版本选择添加需要发布的版本。',
  'release.add.step.two.btn.add': '添加版本',
  'release.add.step.three.title': '选择发布范围',
  'release.add.step.three.description': '请在此选择应用发布的范围。若本组织内所有项目均可使用，则选择本组织；若全平台下的所有项目均可使用，则选择全平台。',
  'release.add.step.three.tooltip': '请注意：发布后不可修改发布范围。',
  'release.add.step.four.description': '您可以在此上传应用图标，填写贡献者、分类及应用描述，维护应用展示信息。',
  'release.add.step.four.title': '填写应用信息。',
  'release.add.step.four.tooltip': '请注意：平台将会提取发布的应用版本中Readme文件展示在应用市场的应用详情页，请先维护好对应的Readme文件后再发布。',
  'release.add.step.four.app.icon': '应用图标',
  'release.add.step.five.title': '确认信息',
  'release.add.step.five.description': '您可以在此确认应用发布的信息，如需修改请返回相应步骤。',
  'release.add.step.five.tooltip': '请注意：该版本发布后不可取消发布，且不可修改发布范围。',
  'release.add.step.five.btn.confirm': '发布',
  'release.edit.header.title': '修改应用信息',
  'release.editVersion.publishTime': '发布时间',
  'release.editVersion.header.title': '查看应用版本',
  'release.editVersion.version.publish': '已发布版本',
  'release.editVersion.version.unpublish': '未发布版本',
  'release.editVersion.modal.title': '确认发布版本',
  'release.editVersion.modal.content': '版本发布后不可取消，确定要发布吗?',
  'release.addVersion.header.title': '添加应用版本',
  'release.addVersion.btn.confirm': '添加',


  // yaml file
  'yaml.lastModify': '上次修改',
  'yaml.modify': '本次修改',
  'yaml.yaml.error': 'yaml 格式错误',
  'yaml.error.tooltip': 'Values文件yaml格式错误，请在应用代码中修改错误并重新生成正确的应用版本。',

  ...pageDetail,
};

export default zhCN;
