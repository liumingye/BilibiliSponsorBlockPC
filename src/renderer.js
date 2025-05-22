/**
 * BilibiliSponsorBlock 插件入口文件
 * 用于跳过或静音视频中的广告、自我推广等内容
 */

import { options } from "./modules/config.js";
import {
  getVideoId,
  getCId,
  waitForElement,
  waitForConstant,
  waitForEqual,
} from "./modules/utils.js";
import { getSkipSegments } from "./modules/api.js";
import {
  initPlayerControl,
  cleanupPlayerControl,
  resetPlayerState,
} from "./modules/player.js";
import {
  // initUI,
  createPreviewBar,
  createSkipButton,
  createSettingsButton,
  cleanupUI,
} from "./modules/ui.js";
import { initStyles } from "./modules/styles.js";

// 存储全局状态
let playerControl = null;
let segments = [];
let currentVideoId = null;

/**
 * 初始化插件
 */
async function init() {
  console.log("BilibiliSponsorBlock: 初始化中...");

  // 初始化样式
  initStyles();

  // 初始化UI
  // initUI();

  // 加载设置
  loadSettings();

  // 监听URL变化
  observeUrlChange();

  // 监听精选视频切换
  observeSelectedPlayers();

  // 初始化当前页面
  // await initCurrentPage();

  console.log("BilibiliSponsorBlock: 初始化完成");
}

/**
 * 加载设置
 */
function loadSettings() {
  try {
    const savedOptions = localStorage.getItem("sponsorBlockOptions");
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions);

      // 合并设置
      if (parsedOptions.categoryActions) {
        options.categoryActions = {
          ...options.categoryActions,
          ...parsedOptions.categoryActions,
        };
      }
    }
  } catch (error) {
    console.error("BilibiliSponsorBlock: 加载设置失败", error);
  }

  // 将设置暴露给全局
  window.sponsorBlockOptions = options;
}

async function observeSelectedPlayers() {
  if (!window.location.href.includes("/index.html")) return;

  await waitForConstant("selectedPlayers");

  // 监控selectedPlayers更改
  let lastValue = window.selectedPlayers.activePlayer;
  const handler = {
    set(target, prop, value) {
      if (prop === "activePlayer") {
        // callback(value, lastValue);
        // console.log('selectedPlayers 更改')
        initCurrentPage();
        lastValue = value;
      }
      return Reflect.set(...arguments);
    },
  };
  window.selectedPlayers = new Proxy(window.selectedPlayers, handler);
}

/**
 * 监听URL变化
 */
function observeUrlChange() {
  let lastUrl = window.location.href;

  // 创建一个新的 MutationObserver 实例
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;

      // URL 变化时重新初始化
      setTimeout(() => {
        initCurrentPage();
      }, 100);
    }
  });

  // 开始观察 document 的子树变化
  observer.observe(document, { subtree: true, childList: true });
}

/**
 * 判断是否为同一视频
 */
function isSameVideo(currentID, targetID) {
  return currentID && targetID && currentID === targetID;
}

/**
 * 初始化当前页面
 */
async function initCurrentPage() {
  // 清理之前的状态
  cleanup();

  // 检查是否在视频页面
  if (
    !window.location.href.includes("/player.html") &&
    !window.location.href.includes("/index.html#/page/selected")
  ) {
    return;
  }

  await waitForConstant("biliPlayer");

  try {
    // 获取视频ID
    const videoID = getVideoId();
    const cid = getCId();
    if (!videoID) {
      console.log("BilibiliSponsorBlock: 未找到视频ID");
      return;
    }

    currentVideoId = videoID;
    console.log(`BilibiliSponsorBlock: 当前视频ID: ${videoID}`);

    // 等待播放器加载
    const player = window.biliPlayer;
    if (!player) {
      console.log("BilibiliSponsorBlock: 未找到播放器");
      return;
    }

    // 获取跳过片段
    const temp_segments = await getSkipSegments({ videoID, cid });
    if (!isSameVideo(getVideoId(), videoID)) return;
    segments = temp_segments;
    console.log(`BilibiliSponsorBlock: 获取到 ${segments.length} 个片段`);

    // 初始化播放器控制
    playerControl = initPlayerControl(player, segments);

    // 等待进度条加载
    let progressBar;
    if (window.location.href.includes("/index.html#/page/selected")) {
      progressBar = await waitForElement(
        `.app_selected--item[data-cid="${
          player.getManifest().cid
        }"] .bpx-player-progress`
      );
    } else {
      progressBar = await waitForElement(".bpx-player-progress");
    }

    playerControl.progressBar = progressBar;

    if (progressBar) {
      // 创建预览条
      createPreviewBar(playerControl);
    }

    // 等待控制栏加载
    // const controlBar = await waitForElement(".bpx-player-control-wrap");
    // if (controlBar) {
    //   // 创建跳过按钮
    //   createSkipButton(controlBar, () => {
    //     console.log(111)
    //   });
    // }
    //   if (playerControl && playerControl.player) {
    //     // 查找当前时间后的下一个片段
    //     const currentTime = playerControl.player.currentTime;
    //     let nextSegmentEnd = null;
    //     for (const segment of segments) {
    //       for (const [start, end] of segment.segment) {
    //         if (currentTime >= start && currentTime < end) {
    //           nextSegmentEnd = end;
    //           break;
    //         } else if (start > currentTime) {
    //           // 找到当前时间之后的第一个片段
    //           if (nextSegmentEnd === null || start < nextSegmentEnd) {
    //             nextSegmentEnd = end;
    //           }
    //           break;
    //         }
    //       }
    //       if (nextSegmentEnd !== null) {
    //         break;
    //       }
    //     }
    //     if (nextSegmentEnd !== null) {
    //       playerControl.player.currentTime = nextSegmentEnd;
    //     }
    //   }
    // });
    // 创建设置按钮
    // createSettingsButton(controlBar);
    // }
  } catch (error) {
    console.error("BilibiliSponsorBlock: 初始化页面失败", error);
  }
}

/**
 * 清理资源
 */
function cleanup() {
  // 清理播放器控制
  if (playerControl) {
    cleanupPlayerControl(playerControl);
    playerControl = null;
  }

  // 清理UI元素
  cleanupUI();

  // 重置状态
  segments = [];
  currentVideoId = null;
}

// 初始化插件
init();
