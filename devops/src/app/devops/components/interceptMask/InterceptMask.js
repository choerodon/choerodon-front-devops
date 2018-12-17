import React, { Component } from "react";

import "./InterceptMask.scss";

export default function InterceptMask(props) {
  const { visible } = props;
  const classNames = `c7n-sidebar-mask c7n-sidebar-mask_${
    visible ? "visible" : "hide"
  }`;
  return <div className={classNames} />;
}
