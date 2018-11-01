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

// 修改用户密码
export async function changePassword(params) {
  return wkrequest('systemUserService/updatePassword', params)
}

// 人员查找服务  根据姓名找人
export async function findPersonByName(params) {
  return wkrequest('monitorService/findPersonByName', params)
}

// 人员查找服务  根据图片找人
export async function findPersonByPhoto(params) {
  return wkrequest('monitorService/findPersonByPhoto', params)
}
