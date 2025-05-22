/**
 * 播放器交互模块 - 处理与Bilibili播放器的交互
 */

import { options } from "./config.js";
import { formatTime } from "./utils.js";
import { getCategoryName } from "./utils.js";

// 存储当前处理的片段信息
let currentSegment = null;
// let skipNoticeTimeout = null;
let muteState = {
  wasMuted: false,
  originalVolume: 1,
  isMuted: false,
};

/**
 * 初始化播放器控制
 * @param {HTMLElement} player 播放器元素
 * @param {Array} segments 片段数组
 * @returns {Object} 播放器控制对象
 */
export function initPlayerControl(player, segments) {
  // 存储播放器和片段信息
  let playerControl = {
    player,
    segments,
    timeUpdateHandler: null,
    isProcessing: false,
  };

  // 设置时间更新处理函数
  playerControl.timeUpdateHandler = () => handleTimeUpdate(playerControl);

  const video = player.getElements().container.querySelector("video");

  video.addEventListener("timeupdate", playerControl.timeUpdateHandler);

  playerControl.video = video;

  // console.log("playerControl", playerControl);

  return playerControl;
}

/**
 * 处理播放器时间更新事件
 * @param {Object} playerControl 播放器控制对象
 */
function handleTimeUpdate(playerControl) {
  const { player, segments, video } = playerControl;

  // console.log(segments);

  if (playerControl.isProcessing || !segments || segments.length === 0) return;

  playerControl.isProcessing = true;

  try {
    const currentTime = video.currentTime;

    // 检查是否在任何片段内
    for (const info of segments) {
      // console.log(info)
      const [startTime, endTime] = info.segment;

      // 如果当前时间在片段范围内
      // if (currentTime >= startTime && currentTime < endTime) {
      // console.log(currentTime);
      if (currentTime >= startTime && currentTime < startTime + 1) {
        processSegment(video, info, startTime, endTime);
        break;
      } else if (
        currentSegment &&
        currentSegment.uuid === info.UUID &&
        currentTime >= endTime
      ) {
        // 如果已经通过了片段结束时间，恢复状态
        resetPlayerState(video);
      }
    }
  } finally {
    playerControl.isProcessing = false;
  }
}

/**
 * 处理片段
 * @param {HTMLElement} player 播放器元素
 * @param {Object} segment 片段信息
 * @param {number} startTime 开始时间
 * @param {number} endTime 结束时间
 */
async function processSegment(player, segment, startTime, endTime) {
  // 如果已经在处理同一个片段，则跳过
  if (currentSegment && currentSegment.uuid === segment.UUID) return;

  currentSegment = {
    uuid: segment.UUID,
    category: segment.category,
    startTime,
    endTime,
  };

  if (startTime === endTime) return;

  const action = options.categoryActions[segment.category] || "skip";

  switch (action) {
    case "skip":
      skipSegment(player, endTime);
      showSkipNotice(segment.category, startTime, endTime);
      break;
    case "mute":
      muteSegment(player);
      showMuteNotice(segment.category, startTime, endTime);
      break;
    case "full":
      // 创建跳过按钮
      const skipButton = createSkipButton(() => {
        skipSegment(player, endTime);
        skipButton.remove();
      });
      break;
    case "overlay":
      showOverlayNotice(segment.category, startTime, endTime);
      break;
    default:
      // 默认不做任何处理
      break;
  }
}

/**
 * 跳过片段
 * @param {HTMLElement} player 播放器元素
 * @param {number} endTime 结束时间
 */
function skipSegment(player, endTime) {
  player.currentTime = endTime;
}

/**
 * 静音片段
 * @param {HTMLElement} player 播放器元素
 */
function muteSegment(player) {
  if (!muteState.isMuted) {
    muteState.wasMuted = player.muted;
    muteState.originalVolume = player.volume;
    player.muted = true;
    muteState.isMuted = true;
  }
}

/**
 * 重置播放器状态
 * @param {HTMLElement} player 播放器元素
 */
export function resetPlayerState(player) {
  if (muteState.isMuted) {
    player.muted = muteState.wasMuted;
    player.volume = muteState.originalVolume;
    muteState.isMuted = false;
  }

  currentSegment = null;

  // 清除通知超时
  // if (skipNoticeTimeout) {
  //   clearTimeout(skipNoticeTimeout);
  //   skipNoticeTimeout = null;
  // }

  // 移除通知元素
  // const notice = document.querySelector(".sponsorblock-notice");
  // if (notice) {
  //   notice.remove();
  // }
}

/**
 * 显示跳过通知
 * @param {string} category 类别
 * @param {number} startTime 开始时间
 * @param {number} endTime 结束时间
 */
function showSkipNotice(category, startTime, endTime) {
  showNotice(
    `已跳过 ${getCategoryName(category)} (${formatTime(startTime)}-${formatTime(
      endTime
    )})`
  );
}

/**
 * 显示静音通知
 * @param {string} category 类别
 * @param {number} startTime 开始时间
 * @param {number} endTime 结束时间
 */
function showMuteNotice(category, startTime, endTime) {
  showNotice(
    `已静音 ${getCategoryName(category)} (${formatTime(startTime)}-${formatTime(
      endTime
    )})`
  );
}

/**
 * 显示覆盖通知
 * @param {string} category 类别
 * @param {number} startTime 开始时间
 * @param {number} endTime 结束时间
 */
function showOverlayNotice(category, startTime, endTime) {
  showNotice(
    `${getCategoryName(category)} (${formatTime(startTime)}-${formatTime(
      endTime
    )})`
  );
}

/**
 * 显示通知
 * @param {string} message 消息内容
 */
function showNotice(message) {
  // 移除现有通知
  const existingNotice = document.querySelector(".sponsorblock-notice");
  if (existingNotice) {
    existingNotice.remove();
  }

  // 创建新通知
  const notice = document.createElement("div");
  notice.className = "sponsorblock-notice";
  notice.textContent = message;
  notice.style.cssText = `
    position: absolute;
    bottom: 60px;
    left: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    z-index: 99999;
    font-size: 14px;
    transition: opacity 0.3s;
  `;

  document
    .querySelector(".app_selected--wrapper,.app_player--player")
    ?.appendChild(notice);

  // 2秒后淡出
  setTimeout(() => {
    notice.style.opacity = "0";
    setTimeout(() => {
      if (notice.parentNode) {
        notice.remove();
      }
    }, 300);
  }, 2000);
}

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
 * 清理播放器控制
 * @param {Object} playerControl 播放器控制对象
 */
export function cleanupPlayerControl(playerControl) {
  if (playerControl && playerControl.video && playerControl.timeUpdateHandler) {
    playerControl.video.removeEventListener(
      "timeupdate",
      playerControl.timeUpdateHandler
    );
  }

  resetPlayerState(playerControl.video);
}
