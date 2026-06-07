/**
 * BilibiliSponsorBlock 插件入口文件
 * 用于跳过或静音视频中的广告、自我推广等内容
 */

import {
  getVideoId,
  getCId,
  waitForElement,
  waitForConstant,
  isSame,
} from "./modules/utils.js";
import { getSkipSegments } from "./modules/api.js";
import { initPlayerControl, cleanupPlayerControl } from "./modules/player.js";
import { createPreviewBar, cleanupUI } from "./modules/ui.js";
import { initStyles } from "./modules/styles.js";
import { configManager, categorieActions } from "./modules/config.js";

// 存储全局状态
let playerControl = null;
let segments = [];

export const configDefaults = {
  categoryActions: {
    sponsor: "skip", // 广告
    selfpromo: "mute", // 无偿/自我推广
    exclusive_access: "full", // 柔性推广/品牌合作
    interaction: "mute", // 三连/订阅提醒
    intro: "mute", // 过场/开场动画
    outro: "mute", // 鸣谢/结束画面
    preview: "overlay", // 回顾/概要
    filler: "disabled", // 离题闲聊/玩笑
    music_offtopic: "skip", // 音乐:非音乐部分
    poi_highlight: "mute", // 精彩时刻/重点
  },
};

/**
 * 初始化插件
 */
async function init() {
  console.log("BilibiliSponsorBlock: 初始化中...");

  // 初始化样式
  initStyles();

  // 监听URL变化
  observeUrlChange();

  // 监听精选视频切换
  observeSelectedPlayers();

  console.log("BilibiliSponsorBlock: 初始化完成");
}

const playerStates = new WeakMap();

async function observeSelectedPlayers() {
  if (!window.location.href.includes("/index.html")) return;

  await waitForConstant("selectedPlayers");

  // 监控selectedPlayers更改
  const handler = {
    set(_target, prop) {
      if (prop === "activePlayer") {
        initCurrentPage();
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

    console.log(`BilibiliSponsorBlock: 当前视频ID: ${videoID}`);

    // 等待播放器加载
    const player = window.biliPlayer;
    if (!player) {
      console.log("BilibiliSponsorBlock: 未找到播放器");
      return;
    }

    // 获取跳过片段
    const temp_segments = await getSkipSegments({ videoID, cid });
    if (!isSame(getVideoId(), videoID)) return;
    segments = temp_segments;
    console.log(`BilibiliSponsorBlock: 获取到 ${segments.length} 个片段`);

    // 初始化播放器控制
    playerControl = initPlayerControl(player, segments);

    // 等待进度条加载
    let progressBar;
    let shadowProgressBar;
    if (window.location.href.includes("/index.html#/page/selected")) {
      progressBar = await waitForElement(
        `.app_selected--item[data-cid="${
          player.getManifest().cid
        }"] .bpx-player-progress`,
      );
      shadowProgressBar = await waitForElement(
        `.app_selected--item[data-cid="${
          player.getManifest().cid
        }"] .bpx-player-shadow-progress-area`,
      );
    } else {
      progressBar = await waitForElement(".bpx-player-progress");
      shadowProgressBar = await waitForElement(
        ".bpx-player-shadow-progress-area",
      );
    }

    if (progressBar && shadowProgressBar) {
      // 创建预览条
      playerControl.progressBar = progressBar;
      playerControl.shadowProgressBar = shadowProgressBar;
      createPreviewBar(playerControl);
    }


  } catch (error) {
    console.error("BilibiliSponsorBlock: 初始化页面失败", error);
  }
}

// 设置页面加载时触发
export const onSettingsPageLoaded = async (view) => {
  const { Select, Margin } = window.BiliComponents;

  const skip = {
    label: "跳过",
    value: "skip",
  };
  const mute = {
    label: "静音",
    value: "mute",
  };
  const full = {
    label: "完整播放",
    value: "full",
  };
  const overlay = {
    label: "仅显示提示",
    value: "overlay",
  };
  const disabled = {
    label: "禁用",
    value: "disabled",
  };

  view.createSettingsItem({
    name: "BilibiliSponsorBlockPC",
    className: "bl-general-item",
    children: [
      ...[
        ["广告", "sponsor"],
        ["无偿/自我推广", "selfpromo"],
        ["柔性推广/品牌合作", "exclusive_access"],
        ["三连/订阅提醒", "interaction"],
        ["过场/开场动画", "intro"],
        ["鸣谢/结束画面", "outro"],
        ["回顾/概要", "preview"],
        ["离题闲聊/玩笑", "filler"],
        ["音乐:非音乐部分", "music_offtopic"],
        ["精彩时刻/重点", "poi_highlight"],
      ].map((arr) => {
        return new Select({
          label: arr[0],
          defaultValue: categorieActions.value[arr[1]],
          options: [skip, mute, full, overlay, disabled],
          onChange: (value) => {
            categorieActions.value[arr[1]] = value;
            configManager.set(
              "categoryActions",
              Vue.toRaw(categorieActions.value),
              {
                restart: false,
              },
            );
          },
          margin: { marginTop: Margin.MD },
        });
      }),
    ],
  });
};

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
}

// 初始化插件
init();
