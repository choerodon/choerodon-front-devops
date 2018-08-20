import { observable, action } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('CertificateStore')
class CertificateStore {

}

const certificateStore = new CertificateStore();

export default certificateStore;
