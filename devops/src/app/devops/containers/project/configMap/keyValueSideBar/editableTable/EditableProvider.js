import React from 'react';
import { Form } from 'choerodon-ui';
import { Provider } from './EditableContext';

const EditableRow = ({ form, index, ...props }) => (
  <Provider value={form}>
    <tr {...props} />
  </Provider>
);

export const EditableFormRow = Form.create()(EditableRow);
