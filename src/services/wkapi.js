/**
 * Created by moda/candroid@126.com on 2017/12/26
 */

import { wkrequest, userLogin, userLogout } from '../utils/wkrequest';

export async function login(params) {
  return userLogin(params);
}

export async function logout() {
  return userLogout();
}

// 查询用户管理列表
export async function queryUserManagement(params) {
  return wkrequest('systemUserService/findUser', params);
}
