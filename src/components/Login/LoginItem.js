import React, { Component } from 'react';
import { Form, Input, Select } from 'antd';
import { FormattedMessage } from 'umi/locale';
import ItemMap from './map';
import LoginContext from './loginContext';

const { Option } = Select;
const FormItem = Form.Item;

class WrapFormItem extends Component {
  getFormItemOptions = ({ onChange, defaultValue, customprops, rules }) => {
    const options = {
      rules: rules || customprops.rules,
    };
    if (onChange) {
      options.onChange = onChange;
    }
    if (defaultValue) {
      options.initialValue = defaultValue;
    }
    return options;
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    // 这么写是为了防止restProps中 带入 onChange, defaultValue, rules props
    /* eslint no-unused-vars: "off" */
    const { onChange, customprops, defaultValue, rules, name, type, ...restProps } = this.props;

    // get getFieldDecorator props
    const options = this.getFormItemOptions(this.props);
    const otherProps = restProps || {};
    if (type === 'Role') {
      return (
        <FormItem>
          {getFieldDecorator(name, options)(
            <Select {...customprops} {...otherProps}>
              <Option value="SystemAdmin">
                <FormattedMessage id="user.role.system-admin" />
              </Option>
              <Option value="UserAdmin">
                <FormattedMessage id="user.role.user-admin" />
              </Option>
              <Option value="Monitor">
                <FormattedMessage id="user.role.monitor" />
              </Option>
            </Select>
          )}
        </FormItem>
      );
    }
    return (
      <FormItem>
        {getFieldDecorator(name, options)(<Input {...customprops} {...otherProps} />)}
      </FormItem>
    );
  }
}

const LoginItem = {};
Object.keys(ItemMap).forEach(key => {
  const item = ItemMap[key];
  LoginItem[key] = props => (
    <LoginContext.Consumer>
      {context => (
        <WrapFormItem
          customprops={item.props}
          rules={item.rules}
          {...props}
          type={key}
          form={context.form}
        />
      )}
    </LoginContext.Consumer>
  );
});

export default LoginItem;
