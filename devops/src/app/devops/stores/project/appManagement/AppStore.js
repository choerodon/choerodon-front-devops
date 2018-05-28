import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('AppStore')
class AppStore {

}
const appStore = new AppStore();
export default appStore;
