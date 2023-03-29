/** @format */

const { isUrl, Url } = require("licia");
const { window, ViewColumn, commands, workspace } = require("vscode");
const {
  CONFIG_KEY,
  getCustomLinks,
  appendLinkItem,
  deleteLinkItem,
} = require("./common");
const { TreeViewProvider } = require("./TreeDataProvider");

// 生成网页
const createHtml = (uri) => {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <style>
          body, html {
            margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #fff;
          }
        </style>
      </head>
      <body>
        <iframe width="100%" height="100%" frameborder="0" src="${uri}">
          <p>can't display ${uri}</p>
        </iframe>
      </body>
    </html>
  `;
};

// 打开窗口
const openWebviewPanel = (link, title) => {
  if (!link) {
    return false;
  }

  // 判断url是否正确
  if (!isUrl(link)) {
    return window.showWarningMessage(`[${link}] is not a usable link`);
  }

  // 没有title,用origin代替
  if (!title) {
    const url = new Url(link);
    title = url.hostname;
  }

  const panel = window.createWebviewPanel("webDocs", title, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });

  panel.webview.html = createHtml(link);
};

// 链接编辑
const editLinkHandler = async (urlPreset, labelPreset) => {
  try {
    const url = await window.showInputBox({
      title: "Link",
      value: urlPreset,
      placeHolder: "Please enter the link",
      ignoreFocusOut: true,
      validateInput: (input) => {
        return isUrl(input)
          ? null
          : "Please enter the link in the correct format!";
      },
    });

    // 用户取消退出
    if (!url) return;

    const label = await window.showInputBox({
      title: "Label",
      value: labelPreset,
      placeHolder: "Please enter the label",
      ignoreFocusOut: true,
      validateInput: (input) => {
        return input.trim()
          ? null
          : "Please enter the label in the correct format!";
      },
    });
    await appendLinkItem(label, url);
  } catch (error) {
    window.showWarningMessage(error.message);
  }
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const activate = (context) => {
  /* 初始化树视图 */
  TreeViewProvider.initTreeViewItem();

  /* 监听配置变化 */
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(CONFIG_KEY)) {
        TreeViewProvider.refresh();
      }
    })
  );

  /**
   * 1、列表打开
   */
  context.subscriptions.push(
    commands.registerCommand("doc_open.tree_view", (key) => {
      const customLinks = getCustomLinks();
      openWebviewPanel(customLinks[key], key);
    })
  );

  /**
   * 2、右键打开
   */
  context.subscriptions.push(
    commands.registerTextEditorCommand(
      "doc_open.contextMenus",
      (textEditor, edit) => {
        const link = textEditor.document.getText(textEditor.selection);
        openWebviewPanel(link);
      }
    )
  );

  /**
   * 3、命令选项打开
   */
  context.subscriptions.push(
    commands.registerCommand("doc_open.picker", () => {
      const customLinks = getCustomLinks();
      window.showQuickPick(Object.keys(customLinks)).then((option) => {
        openWebviewPanel(customLinks[option], option);
      });
    })
  );

  /* 刷新 */
  context.subscriptions.push(
    commands.registerCommand("link_list.refresh", () => {
      TreeViewProvider.refresh();
    })
  );

  /* 添加 */
  context.subscriptions.push(
    commands.registerCommand("link_list.append", async () => {
      editLinkHandler();
    })
  );

  /* 编辑 */
  context.subscriptions.push(
    commands.registerCommand("link_list.edit", async (item) => {
      const customLinks = getCustomLinks();
      editLinkHandler(customLinks[item.label], item.label);
    })
  );

  /* 删除 */
  context.subscriptions.push(
    commands.registerCommand("link_list.delete", async (item) => {
      try {
        await deleteLinkItem(item.label);
      } catch (error) {
        window.showWarningMessage(error.message);
      }
    })
  );
};

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
