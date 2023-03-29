/** @format */
const {
  TreeItem,
  window,
  EventEmitter,
  TreeItemCollapsibleState,
} = require("vscode");
const { getCustomLinks } = require("./common");

class TreeItemNode extends TreeItem {
  constructor(label, version, collapsibleState) {
    super(label, version, collapsibleState);
  }

  // 为每项添加点击事件的命令;
  command = {
    command: "doc_open.tree_view", // 命令 ID
    arguments: [
      // 参数
      this.label,
    ],
  };

  title = this.label; // 标题
  tooltip = this.label; // 提示框
  resourceUri = this.label;
}

class TreeViewProvider {
  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    return Object.keys(getCustomLinks()).map(
      (item) => new TreeItemNode(item, TreeItemCollapsibleState.None)
    );
  }

  onDidChangeTreeData = this._onDidChangeTreeDatanew.event;

  static refresh() {
    this.prototype._onDidChangeTreeDatanew.fire();
  }

  static initTreeViewItem() {
    window.registerTreeDataProvider("link_list", new TreeViewProvider());
  }
}

TreeViewProvider.prototype._onDidChangeTreeDatanew = new EventEmitter();

module.exports = {
  TreeItemNode,
  TreeViewProvider,
};
