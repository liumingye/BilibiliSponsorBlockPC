/**
 * UI模块 - 处理UI相关的功能
 */

import { createElement } from "./utils.js";
import { categoryStyles, previewBarStyles } from "./config.js";

// 存储UI元素引用
const uiElements = {
  previewBar: null,
  skipButton: null,
  settingsButton: null,
  settingsPanel: null,
};

/**
 * 初始化UI
 */
export function initUI() {
  // 添加样式
  addStyles();
}

/**
 * 添加样式
 */
function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
    ${categoryStyles}
    ${previewBarStyles}
    
    .sponsorblock-button {
      cursor: pointer;
      margin-left: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.1);
      transition: background-color 0.2s;
    }
    
    .sponsorblock-button:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
    
    .sponsorblock-settings-panel {
      position: absolute;
      bottom: 50px;
      right: 10px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      padding: 16px;
      z-index: 100;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .sponsorblock-settings-panel h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
    }
    
    .sponsorblock-settings-group {
      margin-bottom: 16px;
    }
    
    .sponsorblock-settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .sponsorblock-settings-item label {
      flex-grow: 1;
      margin-right: 8px;
    }
    
    .sponsorblock-settings-item select {
      width: 100px;
    }
    
    .sponsorblock-notice {
      position: absolute;
      bottom: 60px;
      left: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 100;
      font-size: 14px;
      transition: opacity 0.3s;
    }
  `;

  document.head.appendChild(style);
}

/**
 * 创建进度条预览
 * @param {HTMLElement} progressBar 进度条元素
 * @param {Array} segments 片段数组
 * @returns {HTMLElement} 预览条元素
 */
export function createPreviewBar(progressBar, segments) {
  // 如果已存在，则移除
  if (uiElements.previewBar) {
    uiElements.previewBar.remove();
  }

  // 创建预览条容器
  const previewBar = createElement("div", { id: "previewbar" });
  progressBar.appendChild(previewBar);
  uiElements.previewBar = previewBar;

  // 更新预览条
  updatePreviewBar(previewBar, segments);

  return previewBar;
}

/**
 * 更新进度条预览
 * @param {HTMLElement} previewBar 预览条元素
 * @param {Array} segments 片段数组
 */
export function updatePreviewBar(previewBar, segments) {
  // 清空预览条
  previewBar.innerHTML = "";

  if (!segments || segments.length === 0) return;

  // 获取视频总时长
  const videoDuration = document.querySelector("video")?.duration || 0;
  if (!videoDuration) return;
  console.log(segments);
  // 为每个片段创建预览块
  segments.forEach((info) => {
    const [startTime, endTime] = info.segment;
    // info.segment.forEach(([startTime, endTime] = ) => {
    const startPercent = (startTime / videoDuration) * 100;
    const widthPercent = ((endTime - startTime) / videoDuration) * 100;

    const previewSegment = createElement("div", {
      class: "previewbar",
      style: {
        position: "absolute",
        opacity: "0.7",
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
        backgroundColor: `var(--sb-category-${info.category})`,
      },
      title: `${getCategoryName(info.category)} (${formatTime(
        startTime
      )}-${formatTime(endTime)})`,
    });

    previewBar.insertAdjacentElement("afterbegin", previewSegment);
    // });
  });
}

/**
 * 创建跳过按钮
 * @param {HTMLElement} controlBar 控制栏元素
 * @param {Function} onSkipClick 点击回调
 * @returns {HTMLElement} 跳过按钮元素
 */
export function createSkipButton(controlBar, onSkipClick) {
  // 如果已存在，则移除
  if (uiElements.skipButton) {
    uiElements.skipButton.remove();
  }

  // 创建跳过按钮
  const skipButton = createElement(
    "div",
    {
      class: "sponsorblock-button",
      title: "跳过当前片段",
      style: {
        color: "#00d400",
      },
    },
    "跳过"
  );

  skipButton.addEventListener("click", onSkipClick);

  // 插入到控制栏
  controlBar.appendChild(skipButton);
  uiElements.skipButton = skipButton;

  return skipButton;
}

/**
 * 创建设置按钮
 * @param {HTMLElement} controlBar 控制栏元素
 * @returns {HTMLElement} 设置按钮元素
 */
export function createSettingsButton(controlBar) {
  // 如果已存在，则移除
  if (uiElements.settingsButton) {
    uiElements.settingsButton.remove();
  }

  // 创建设置按钮
  const settingsButton = createElement(
    "div",
    {
      class: "sponsorblock-button",
      title: "SponsorBlock 设置",
    },
    "⚙️"
  );

  settingsButton.addEventListener("click", toggleSettingsPanel);

  // 插入到控制栏
  controlBar.appendChild(settingsButton);
  uiElements.settingsButton = settingsButton;

  return settingsButton;
}

/**
 * 切换设置面板
 */
function toggleSettingsPanel() {
  if (uiElements.settingsPanel) {
    uiElements.settingsPanel.remove();
    uiElements.settingsPanel = null;
    return;
  }

  // 创建设置面板
  const settingsPanel = createElement("div", {
    class: "sponsorblock-settings-panel",
  });

  // 添加标题
  settingsPanel.appendChild(createElement("h3", {}, "SponsorBlock 设置"));

  // 添加类别设置
  const categoryGroup = createElement("div", {
    class: "sponsorblock-settings-group",
  });

  categoryGroup.appendChild(createElement("h4", {}, "片段处理方式"));

  // 添加各类别设置项
  const categories = {
    sponsor: "广告",
    selfpromo: "自我推广",
    exclusive_access: "品牌合作",
    interaction: "互动提醒",
    intro: "片头",
    outro: "片尾",
    preview: "预览/回顾",
    filler: "闲聊",
    music_offtopic: "非音乐部分",
    poi_highlight: "精彩时刻",
  };

  Object.entries(categories).forEach(([category, name]) => {
    const settingItem = createElement("div", {
      class: "sponsorblock-settings-item",
    });

    // 标签
    const label = createElement(
      "label",
      {
        for: `sb-category-${category}`,
      },
      name
    );
    settingItem.appendChild(label);

    // 选择框
    const select = createElement("select", {
      id: `sb-category-${category}`,
      "data-category": category,
    });

    // 添加选项
    const options = [
      { value: "skip", text: "跳过" },
      { value: "mute", text: "静音" },
      { value: "full", text: "完整播放" },
      { value: "overlay", text: "仅显示提示" },
      { value: "disabled", text: "禁用" },
    ];

    options.forEach((option) => {
      const optionElement = createElement(
        "option",
        {
          value: option.value,
        },
        option.text
      );
      select.appendChild(optionElement);
    });

    // 设置当前值
    select.value =
      window.sponsorBlockOptions?.categoryActions?.[category] || "skip";

    // 添加事件监听
    select.addEventListener("change", () => {
      if (!window.sponsorBlockOptions) {
        window.sponsorBlockOptions = { categoryActions: {} };
      }
      if (!window.sponsorBlockOptions.categoryActions) {
        window.sponsorBlockOptions.categoryActions = {};
      }
      window.sponsorBlockOptions.categoryActions[category] = select.value;

      // 保存设置
      localStorage.setItem(
        "sponsorBlockOptions",
        JSON.stringify(window.sponsorBlockOptions)
      );
    });

    settingItem.appendChild(select);
    categoryGroup.appendChild(settingItem);
  });

  settingsPanel.appendChild(categoryGroup);

  // 添加到页面
  document.body.appendChild(settingsPanel);
  uiElements.settingsPanel = settingsPanel;

  // 点击外部关闭面板
  document.addEventListener(
    "click",
    (event) => {
      if (
        uiElements.settingsPanel &&
        !uiElements.settingsPanel.contains(event.target) &&
        !uiElements.settingsButton.contains(event.target)
      ) {
        uiElements.settingsPanel.remove();
        uiElements.settingsPanel = null;
      }
    },
    { once: true }
  );
}

/**
 * 格式化时间
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的时间
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * 获取类别名称
 * @param {string} category 类别
 * @returns {string} 类别名称
 */
function getCategoryName(category) {
  const categoryNames = {
    sponsor: "广告",
    selfpromo: "自我推广",
    exclusive_access: "品牌合作",
    interaction: "互动提醒",
    intro: "片头",
    outro: "片尾",
    preview: "预览/回顾",
    filler: "闲聊",
    music_offtopic: "非音乐部分",
    poi_highlight: "精彩时刻",
  };

  return categoryNames[category] || category;
}

/**
 * 清理UI元素
 */
export function cleanupUI() {
  // 移除预览条
  if (uiElements.previewBar) {
    uiElements.previewBar.remove();
    uiElements.previewBar = null;
  }

  // 移除跳过按钮
  if (uiElements.skipButton) {
    uiElements.skipButton.remove();
    uiElements.skipButton = null;
  }

  // 移除设置按钮
  if (uiElements.settingsButton) {
    uiElements.settingsButton.remove();
    uiElements.settingsButton = null;
  }

  // 移除设置面板
  if (uiElements.settingsPanel) {
    uiElements.settingsPanel.remove();
    uiElements.settingsPanel = null;
  }
}
