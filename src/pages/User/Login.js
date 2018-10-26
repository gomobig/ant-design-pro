import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Alert } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';
import { getStorage } from '../../utils/utils';

const { UserName, Password, Submit, Role } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  clearMsg = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/showErrorMsg',
      payload: '',
    });
  };

  handleSubmit = (err, values) => {
    this.clearMsg();
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
        },
      });
    }
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { submitting, login: { errMsg } } = this.props;
    return (
      <div className={styles.main}>
        <Login
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <UserName
            name="userName"
            placeholder={formatMessage({ id: 'account' })}
            onChange={this.clearMsg}
          />
          <Role
            name="role"
            defaultValue={window.localStorage.getItem('role')}
            placeholder={formatMessage({ id: 'login.role' })}
            optionFilterProp="children"
            onChange={this.clearMsg}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
          <Password
            name="password"
            placeholder={formatMessage({ id: 'password' })}
            onChange={this.clearMsg}
            onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
          />
          {!submitting && !!errMsg && this.renderMessage(errMsg)}
          <Submit loading={submitting}>
            <FormattedMessage id="app.login.login" />
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
