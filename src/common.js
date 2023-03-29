/** @format */

const { cloneDeep } = require("licia");
const { workspace } = require("vscode");

const CONFIG_KEY = "open_the_doc.links";

// 获取用户链接配置
const getCustomLinks = () => {
  return cloneDeep(workspace.getConfiguration().get(CONFIG_KEY)) || {};
};
// 修改用户链接配置
const updateCustomLinks = (newVal) => {
  return workspace.getConfiguration().update(CONFIG_KEY, newVal, true);
};

// 添加单条链接
const appendLinkItem = (key, value) => {
  const customLinks = getCustomLinks();
  customLinks[key] = value;
  return updateCustomLinks(customLinks);
};

// 删除单条链接
const deleteLinkItem = (key) => {
  const customLinks = getCustomLinks();
  Reflect.deleteProperty(customLinks, key);
  return updateCustomLinks(customLinks);
};

module.exports = {
  CONFIG_KEY,
  getCustomLinks,
  updateCustomLinks,
  appendLinkItem,
  deleteLinkItem,
};
