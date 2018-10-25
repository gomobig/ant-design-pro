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
  clearMsg = () => {};

  handleSubmit = (err, values) => {
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
    const { login, submitting, errMsg } = this.props;
    // const { errMsg } = this.state;
    return (
      <div className={styles.main}>
        <Login
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <UserName name="userName" placeholder={formatMessage({ id: 'account' })} />
          <Role
            name="role"
            defaultValue={getStorage('role') ? getStorage('role').result : ''}
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
            onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
          />
          {login.status !== 0 && !login.submitting && errMsg !== '' && this.renderMessage(errMsg)}
          <Submit loading={submitting}>
            <FormattedMessage id="app.login.login" />
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
