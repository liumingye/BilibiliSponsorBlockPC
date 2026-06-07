/**
 * UI模块 - 处理UI相关的功能
 */

import { createElement, getCategoryName } from "./utils.js";

// 存储UI元素引用
export const uiElements = {
  // 哔哩哔哩播放器UI
  previewBar: null,
  skipButton: null,
  // 程序UI
  settingsButton: null,
  settingsPanel: null,
};

/**
 * 创建跳过按钮
 * @param {HTMLElement} controlBar 控制栏元素
 * @param {Function} onSkipClick 点击回调
 * @returns {HTMLElement} 跳过按钮元素
 */
export function createSkipButton(onSkipClick) {
  // 如果已存在，则移除
  if (uiElements.skipButton) {
    uiElements.skipButton.remove();
  }

  const skipButton = document.createElement("div");
  skipButton.className = "sponsorblock-button";
  skipButton.textContent = "跳过当前片段";
  skipButton.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 20px;
    z-index: 100;
  `;

  skipButton.addEventListener("click", onSkipClick);

  // 插入到控制栏
  document
    .querySelector(".app_selected--wrapper,.app_player--player")
    ?.appendChild(skipButton);
  uiElements.skipButton = skipButton;

  return skipButton;
}

/**
 * 创建进度条预览
 * @param {HTMLElement} progressBar 进度条元素
 * @param {Array} segments 片段数组
 * @returns {HTMLElement} 预览条元素
 */
export function createPreviewBar(playerControl) {
  // 如果已存在，则移除
  if (uiElements.previewBar) {
    uiElements.previewBar.remove();
  }
  if (uiElements.shadowPreviewbar) {
    uiElements.shadowPreviewbar.remove();
  }

  // 创建预览条容器
  const previewBar = createElement("div", { id: "previewbar" });
  playerControl.progressBar.prepend(previewBar);
  uiElements.previewBar = previewBar;

  const shadowPreviewbar = createElement("div", { id: "shadowPreviewbar" });
  playerControl.shadowProgressBar.prepend(shadowPreviewbar);
  uiElements.shadowPreviewbar = shadowPreviewbar;

  // 更新预览条
  updatePreviewBar(playerControl, { previewBar, shadowPreviewbar });

  return previewBar;
}

/**
 * 更新进度条预览
 * @param {HTMLElement} previewBar 预览条元素
 * @param {Array} segments 片段数组
 */
export function updatePreviewBar(
  playerControl,
  { previewBar, shadowPreviewbar }
) {
  // 清空预览条
  previewBar.innerHTML = "";
  shadowPreviewbar.innerHTML = "";

  const { segments, video } = playerControl;

  if (!segments || segments.length === 0) return;

  // 获取视频总时长
  const videoDuration = video.duration || 0;
  if (!videoDuration) return;
  // console.log(segments);
  // 为每个片段创建预览块
  segments.forEach((info) => {
    const [startTime, endTime] = info.segment;
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
    previewBar.prepend(previewSegment);

    const shadowPreviewbarSegment = createElement("div", {
      class: "previewbar",
      style: {
        position: "absolute",
        opacity: "0.7",
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
        backgroundColor: `var(--sb-category-${info.category})`,
      },
    });
    shadowPreviewbar.prepend(shadowPreviewbarSegment);
  });
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
 * 清理UI元素
 */
export function cleanupUI() {
  // 移除预览条
  if (uiElements.previewBar) {
    uiElements.previewBar.remove();
    uiElements.previewBar = null;
  }
  if (uiElements.shadowPreviewbar) {
    uiElements.shadowPreviewbar.remove();
    uiElements.shadowPreviewbar = null;
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
