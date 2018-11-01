import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi/locale';
import { Spin, Menu, Icon, Dropdown } from 'antd';
import NoticeIcon from '../NoticeIcon';
import SelectLang from '../SelectLang';
import { PasswordChange } from '@/components/Login';
import styles from './index.less';

export default class GlobalHeaderRight extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconType: 'down',
    };
  };

  handleMenuVisibleChange = visible => {
    this.setState({
      iconType: visible ? 'up' : 'down',
    });
  };

  // 为了处理点击menu菜单 handleMenuVisibleChange不会调用的问题
  onMenuClick = value => {
    const { onMenuClick } = this.props;
    this.setState({
      iconType: 'down',
    });
    onMenuClick(value);
  };

  render() {
    const {
      currentUser,
      onNoticeClick,
      theme,
    } = this.props;
    const { iconType } = this.state;
    const { showChangePassword, onChangePassword,onCancelPassword } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="changePassword">
          <FormattedMessage id="menu.account.change-password" defaultMessage="change password" />
        </Menu.Item>
        <Menu.Item key="logout">
          <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
        </Menu.Item>
      </Menu>
    );
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div className={className}>
        <NoticeIcon
          className={styles.action}
          count={currentUser.notifyCount}
          onClick={onNoticeClick}
        />
        {currentUser.name ? (
          <Dropdown
            overlay={menu}
            onVisibleChange={this.handleMenuVisibleChange}
          >
            <span className={`${styles.action}`}>
              <span className={styles.name}>{currentUser.name} </span>
              <Icon type={iconType} />
            </span>
          </Dropdown>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}
        <SelectLang className={styles.action} />
        <PasswordChange
          userName={currentUser.name}
          onSubmit={onChangePassword}
          visible={showChangePassword}
          onCancel={onCancelPassword}
        />
      </div>
    );
  }
}
