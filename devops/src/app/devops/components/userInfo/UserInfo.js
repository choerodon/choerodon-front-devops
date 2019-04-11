import React, { PureComponent } from 'react';
import jsa from '../../assets/images/jsa-128.jpg';

import './UserInfo.scss';

class UserInfo extends PureComponent {
  render() {
    const { avatar, name, id } = this.props;
    return (
      <div className="c7ncd-userinfo-wrap">
        <img src={avatar || jsa} alt="avatar" className="c7ncd-userinfo-avatar" />
        <div className="c7ncd-userinfo-name">
          {id || ''}
          {name}
        </div>
      </div>
    );
  };
}

export default UserInfo;
