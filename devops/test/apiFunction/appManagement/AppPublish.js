const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');
const fs = require('fs');
const path = require('path');

const { expect } = chai;

chai.use(chaiHttp);

class AppPublish {
    getUnPublishList({project, page = 0, size = 10, type = 'id', sort = 'asc', data = { searchParam: {}, param: '' }}){
        return chai.request(oauth.gateway)
        .post(`/devops/v1/projects/${project}/apps/list_unpublish?page=${page}&size=${size}&sort=${type},${sort}`)
        .set('Authorization', global.user_token.token)
        .set('Content-type', 'application/json')
        .send(data)
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.content).to.be.an.instanceOf(Array);
          expect(res.body.number).to.be.equal(page);
          expect(res.body.size).to.be.equal(size);
        });
    }

    getApplicationDetail({project,data}){
        return chai.request(oauth.gateway)
        .get(`/devops/v1/projects/${project}/apps_market/${data.id}/detail`)
        .set('Authorization', global.user_token.token)
        .set('Content-type', 'application/json')
        .then((res)=>{
            const {id,appId} = data;
            expect(res).to.have.status(200);
            expect(res.body.id).to.be.equal(id);
            expect(res.body.appId).to.be.equal(appId);
        })
    }

    updateApplicationDetail({project, data = { id,appId,publishLevel,contributor :'',category:'',description:''}}){
        return chai.request(oauth.gateway)
        .put(`/devops/v1/projects/${project}/apps_market/${data.id}`)
        .set('Authorization', global.user_token.token)
        .set('Content-type', 'application/json')
        .send(data)
        .then((res)=>{
            expect(res).to.have.status(200);
        })
    }

    getApplicationVersions({project, page = 0, size = 10, is_publish = true, sort = 'asc',id = 87,data = { searchParam: {}, param: '' }}){
        return chai.request(oauth.gateway)
        .post(`/devops/v1/projects/${project}/apps_market/${id}/versions?is_publish=${is_publish}&page=${page}&size=${size}&sort=updatedDate,${sort}`)
        .set('Authorization', global.user_token.token)
        .set('Content-type', 'application/json')
        .send(data)
        .then((res)=>{
            expect(res).to.have.status(200);
            expect(res.body.content).to.be.an.instanceOf(Array);
            expect(res.body.number).to.be.equal(page);
            expect(res.body.size).to.be.equal(size);
        })
    }

    publishApplication({project,appVersions,data}){
        return chai.request(oauth.gateway)
        .post(`/devops/v1/projects/${project}/apps_market`)
        .set('Authorization', global.user_token.token)
        .set('Content-type', 'application/json')
        .send({...appVersions,...data})
        .then((res)=>{
            expect(res).to.have.status(200);
        })
    }

    publishApplicationVersion({project,id = 87, appVersions}){
        return chai.request(oauth.gateway)
        .put(`/devops/v1/projects/${project}/apps_market/${id}/versions`)
        .set('Authorization', global.user_token.token)
        .set('Content-type', 'application/json')
        .send(appVersions)
        .then((res)=>{
            expect(res).to.have.status(204);
        })
    }

    sendApplicationIcon({filePath,file_name,bucket_name='devops-service'}){
        return chai.request(oauth.gateway)
        .post(`/file/v1/files?bucket_name=${bucket_name}&file_name=${file_name}`)
        .set('Authorization', global.user_token.token)
        .attach('file',fs.readFileSync(filePath),file_name)
        .then((res)=>{
            expect(res).to.have.status(200);
            expect(res.text).to.contain(`http://minio.staging.saas.hand-china.com/${bucket_name}`)
        })
    }


}

const appPublish = new AppPublish();
module.exports = appPublish;
