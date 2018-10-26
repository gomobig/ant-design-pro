import React, { PureComponent } from 'react';
import { Popover, Icon, Tabs, Badge, Spin } from 'antd';
import classNames from 'classnames';

import styles from './index.less';



export default class NoticeIcon extends PureComponent {

  static defaultProps = {
    onClick: () => {},
    loading: false,
  };

  render() {
    const { className, count, onClick } = this.props;
    const noticeButtonClass = classNames(className, styles.noticeButton);
    return (
      <span className={noticeButtonClass} onClick={onClick}>
        <Badge count={count} style={{ boxShadow: 'none' }} className={styles.badge}>
          <Icon type="bell" className={styles.icon} />
        </Badge>
      </span>
    );
  }
}
