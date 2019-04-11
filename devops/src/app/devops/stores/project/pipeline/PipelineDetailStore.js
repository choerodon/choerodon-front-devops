import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';
import { HEIGHT } from '../../../common/Constants';

@store('PipelineDetailStore')
class PipelineDetailStore {

}

const pipelineDetailStore = new PipelineDetailStore();

export default pipelineDetailStore;
