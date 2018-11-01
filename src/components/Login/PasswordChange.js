import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import modalConnect from '@/utils/modalConnect'

const FormItem = Form.Item;
class PasswordChange extends PureComponent {
  state = {
    confirmDirty: false,
  };

  handleConfirmBlur = (e) => {
    const { value } = e.target;
    const { confirmDirty } = this.state;
    this.setState({ confirmDirty: confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback(formatMessage({id: 'password-change.rule.confirm'}));
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    const { confirmDirty } = this.state;
    const reg = /[0-9A-Za-z]{6,}$/;
    if (value && !reg.test(value)){
      callback(formatMessage({id: 'password-change.rule.confirm.error'}));
    } else if (value === form.getFieldValue('oldPassword')) {
      callback(formatMessage({id: 'password-change.rule.old-new-same.error'}));
    } else if (confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { form, onSubmit } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { oldPassword, newPassword } = values
        onSubmit(oldPassword, newPassword);
      }
    });
  };

  render() {
    const { form: { getFieldDecorator }, userName } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Form onSubmit={this.onSubmit}>
        <FormItem
          {...formItemLayout}
          label={formatMessage({id: 'password-change.label.account'})}
        >
          <span className="ant-form-text">{userName}</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={formatMessage({id: 'password-change.label.old'})}
        >
          {getFieldDecorator('oldPassword', {
            rules: [{
              required: true, message: formatMessage({id: 'password-change.rule.old-password.require'}),
            }, {
              // validator: this.validateToNextPassword,
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={formatMessage({id: 'password-change.label.new'})}
        >
          {getFieldDecorator('newPassword', {
            rules: [{
              required: true, message: formatMessage({id: 'password-change.rule.new-password.require'}),
            }, {
              validator: this.validateToNextPassword,
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={formatMessage({id: 'password-change.label.confirm'})}
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: formatMessage({id: 'password-change.rule.confirm.require'}),
            }, {
              validator: this.compareToFirstPassword,
            }],
          })(
            <Input type="password" onBlur={this.handleConfirmBlur} />
          )}
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 10 }}
        >
          <Button type="primary" htmlType="submit">
            {formatMessage({id: 'password-change.button.save'})}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const FormPasswordChange = Form.create()(PasswordChange);
const ChangePassword = modalConnect({
  destroyOnClose: true,
  footer: null,
  width: 500,
})(FormPasswordChange);
export default ChangePassword;

