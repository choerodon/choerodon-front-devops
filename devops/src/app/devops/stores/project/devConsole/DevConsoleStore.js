import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';

const orderMapping = {
  ascend: 'asc',
  descend: 'desc',
};
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@store('DevConsoleStore')
class DevConsoleStore {
  @observable repoData = [];

  @observable loading = true;

  @observable pageInfo = {
    current: 1,
    pageSize: HEIGHT <= 900 ? 10 : 15,
    total: 0,
  };
}


const devConsoleStore = new DevConsoleStore();
export default devConsoleStore;
