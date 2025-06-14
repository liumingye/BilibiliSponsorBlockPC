/**
 * 播放器交互模块 - 处理与Bilibili播放器的交互
 */

import { categorieActions } from "./config.js";
import { formatTime } from "./utils.js";
import { getCategoryName } from "./utils.js";
import { createSkipButton, uiElements } from "./ui.js";

// 存储当前处理的片段信息
let currentSegment = null;
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

  return playerControl;
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

/**
 * 处理播放器时间更新事件
 * @param {Object} playerControl 播放器控制对象
 */
function handleTimeUpdate(playerControl) {
  const { segments, video } = playerControl;

  if (playerControl.isProcessing || !segments || segments.length === 0) return;

  playerControl.isProcessing = true;

  try {
    const currentTime = video.currentTime;

    // 检查是否在任何片段内
    for (const info of segments) {
      const [startTime, endTime] = info.segment;

      // 如果当前时间在片段范围内
      if (currentTime >= startTime && currentTime < endTime) {
        // if (currentTime >= startTime && currentTime < startTime + 1) {
        processSegment(video, info, startTime, endTime, currentTime);
        break;
      } else if (
        currentSegment &&
        currentSegment.uuid === info.UUID &&
        (currentTime >= endTime || currentTime < startTime)
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
async function processSegment(
  player,
  segment,
  startTime,
  endTime,
  currentTime
) {
  // 如果已经在处理同一个片段，则跳过
  if (currentSegment && currentSegment.uuid === segment.UUID) return;

  currentSegment = {
    uuid: segment.UUID,
    category: segment.category,
    startTime,
    endTime,
  };

  if (startTime === endTime) return;

  const action = categorieActions.value[segment.category] || "skip";

  switch (action) {
    case "skip":
      if (currentTime < startTime + 1) {
        // 在片段开始
        skipSegment(player, endTime);
        showSkipNotice(segment.category, startTime, endTime);
      } else {
        // 在片段内
        const skipButton = createSkipButton(() => {
          skipSegment(player, endTime);
          skipButton.remove();
        });
      }
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
 * @param {HTMLElement} video 播放器元素
 */
export function resetPlayerState(video) {
  // 恢复音量和静音状态
  if (muteState.isMuted) {
    video.muted = muteState.wasMuted;
    video.volume = muteState.originalVolume;
    muteState.isMuted = false;
  }

  // 移除跳过按钮
  if (uiElements.skipButton) {
    uiElements.skipButton.remove();
  }

  currentSegment = null;

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
