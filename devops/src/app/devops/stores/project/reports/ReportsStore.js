import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';

@store('ReportsStore')
class ReportsStore {

}

const reportsStore = new ReportsStore();

export default reportsStore;
