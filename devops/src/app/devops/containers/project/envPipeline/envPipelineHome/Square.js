import React, { Component } from 'react';

export default class Square extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
