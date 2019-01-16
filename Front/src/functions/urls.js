const domain = "http://localhost:7010/";
const urls = {
  login: `${domain}user/login/pwd`,
  myInfo: `${domain}user/my/info`,
  updateMyInfo: `${domain}user/update/normal`,
  updateMyPwd: `${domain}user/update/pwd`,
  syncWxInfo: `${domain}user/update/wx`,
  forumList: `${domain}forum/list`,
  threadList: (fid, page) => `${domain}thread/list/${fid}/${page}`
};
export default urls;