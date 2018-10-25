import { formatMessage } from 'umi/locale';

export default {
  UserName: {
    props: {
      size: 'large',
    },
    rules: [
      {
        required: true,
        message: formatMessage({ id: 'login.rule.account' }),
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      type: 'password',
    },
    rules: [
      {
        required: true,
        message: formatMessage({ id: 'login.rule.password' }),
      },
    ],
  },
  Role: {
    props: {
      size: 'large',
      type: 'Role',
    },
    rules: [
      {
        required: true,
        message: formatMessage({ id: 'login.rule.role' }),
      },
    ],
  },
};
