import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import classNames from 'classnames';
import LoginItem from './LoginItem';
import LoginSubmit from './LoginSubmit';
import styles from './index.less';
import LoginContext from './loginContext';
import PasswordChange from './PasswordChange';

class Login extends Component {
  static propTypes = {
    className: PropTypes.string,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    onSubmit: () => {},
  };

  getContext = () => {
    const { form } = this.props;
    return {
      form,
    };
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, onSubmit } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      onSubmit(err, values);
    });
  };

  render() {
    const { className, children } = this.props;
    return (
      <LoginContext.Provider value={this.getContext()}>
        <div className={classNames(className, styles.login)}>
          <Form onSubmit={this.handleSubmit}>{[...children]}</Form>
        </div>
      </LoginContext.Provider>
    );
  }
}

Login.Submit = LoginSubmit;
Object.keys(LoginItem).forEach(item => {
  Login[item] = LoginItem[item];
});

export default Form.create()(Login);
export { PasswordChange };
