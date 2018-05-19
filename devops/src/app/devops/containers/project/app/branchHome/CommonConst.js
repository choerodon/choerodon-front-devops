/* eslint-disable */
export const devConflictMessage = name =>
  (Choerodon.getMessage(`${name}合并到develop分支冲突，请在本地查看并合并。

步骤 1. 获取并切换到${name}分支
git checkout develop
git fetch origin ${name}:${name}
git checkout ${name}

步骤 2. 检查修改

步骤 3. 合并${name}分支到develop，解决冲突并提交到本地仓库
git checkout develop
git pull origin develop
git merge --no-ff ${name}

步骤 4. 推送develop分支到远程仓库
git push origin develop

点击取消关闭弹窗或解决冲突后再点击确定。`, `${name} merge develop branch conflicts, please check in the local and merge.

Step 1. Get and checkout branch ${name}
git checkout develop
git fetch origin ${name}:${name}
git checkout ${name}

Step 2. Review changes

Step 3. Merge branch ${name} into develop, fix conflicts and commit
git checkout develop
git merge --no-ff ${name}

Step 4. Push branch develop to remote repository
git push origin develop

Click cancel to close the modal or resolve the conflict and then click Confirm.`));

export const masterConflictMessage = name =>
  Choerodon.getMessage(`${name}合并到master分支冲突，请在本地查看并合并。

步骤 1. 获取并切换到${name}分支
git checkout master
git fetch origin ${name}:${name}
git checkout ${name}

步骤 2. 检查修改

步骤 3. 合并${name}分支到master，解决冲突并提交到本地仓库
git checkout master
git pull origin master
git merge --no-ff ${name}

步骤 4. 推送master分支到远程仓库
git push origin master

点击取消关闭弹窗或解决冲突后再点击确定。`, `${name} merge master branch conflicts, please check in the local and merge.

Step 1. Get and checkout branch ${name}
git checkout master
git fetch origin ${name}:${name}
git checkout ${name}

Step 2. Review changes

Step 3. Merge branch ${name} into develop, fix conflicts and commit
git checkout master
git merge --no-ff ${name}

Step 4. Push branch master to remote repository
git push origin master

Click cancel to close the modal or resolve the conflict and then click Confirm.`);

export const bothConflictMessage = name =>
  Choerodon.getMessage(`${name}合并到develop分支和master分支均有冲突，请在本地查看并合并。

步骤 1. 获取并切换到${name}分支
git checkout develop
git fetch origin ${name}:${name}
git checkout ${name}

步骤 2. 检查修改

步骤 3. 合并${name}分支到master，解决冲突并提交到本地仓库
git checkout master
git pull origin master
git merge --no-ff ${name}

步骤 4. 推送master分支到远程仓库
git push origin master

步骤 5. 合并${name}分支到develop，解决冲突并提交到本地仓库
git checkout develop
git pull origin develop
git merge --no-ff ${name}

步骤 6. 推送develop分支到远程仓库
git push origin develop

点击取消关闭弹窗或解决冲突后再点击确定。`, `${name} merged to develop branches and master all have conflicts, please check in the local and merge.

Step 1. Get and checkout branch ${name}
git checkout develop
git fetch origin ${name}:${name}
git checkout ${name}

Step 2. Review changes

Step 3. Merge branch ${name} into master, fix conflicts and commit
git checkout master
git pull origin master
git merge --no-ff ${name}

Step 4. Push branch master to remote repository
git push origin master

Step 3. Merge branch ${name} into develop, fix conflicts and commit
git checkout develop
git pull origin develop
git merge --no-ff ${name}

Step 4. Push branch develop to remote repository
git push origin develop

Click cancel to close the modal or resolve the conflict and then click Confirm.`);

