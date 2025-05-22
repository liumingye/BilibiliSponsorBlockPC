/**
 * 工具函数模块 - 包含各种辅助函数
 */
import { categories } from "./config.js";

const XOR_CODE = 23442827791579n;
// const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;
const data = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";

/**
 * 将av号转换为bv号
 * @param {string} av AV号
 * @returns {string} BV号
 */
function av2bv(aid) {
  const bytes = ["B", "V", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
  let bvIndex = bytes.length - 1;
  let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
  while (tmp > 0) {
    bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
    tmp = tmp / BASE;
    bvIndex -= 1;
  }
  [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
  [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
  return bytes.join("");
}

/**
 * 等待DOM元素出现
 * @param {string} selector CSS选择器
 * @param {number} timeout 超时时间（毫秒）
 * @returns {Promise<Element>} DOM元素
 */
export function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((_mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    if (timeout) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    }
  });
}

/**
 * 格式化时间（秒）为 MM:SS 格式
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的时间
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * 获取当前视频ID
 * @returns {string|null} 视频ID
 */
export function getVideoId() {
  const manifest = window.biliPlayer.getManifest();
  const bvid = manifest.bvid ? manifest.bvid : av2bv(manifest.aid);
  return bvid || "";
}

export function getCId() {
  const manifest = window.biliPlayer.getManifest();
  return manifest.cid || "";
}

/**
 * 创建DOM元素
 * @param {string} tag 标签名
 * @param {Object} attributes 属性对象
 * @param {string|Node} content 内容
 * @returns {HTMLElement} 创建的元素
 */
export function createElement(tag, attributes = {}, content = "") {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key === "classList" && Array.isArray(value)) {
      element.classList.add(...value);
    } else {
      element.setAttribute(key, value);
    }
  }

  if (typeof content === "string") {
    element.textContent = content;
  } else if (content instanceof Node) {
    element.appendChild(content);
  }

  return element;
}

// 循环等待window变量出现函数
export async function waitForConstant(constName, time = 1000) {
  while (true) {
    if (window[constName]) {
      return window[constName];
    }
    await new Promise((resolve) => setTimeout(resolve, time));
  }
}

// 循环等待变量等于指定数
export async function waitForEqual(variable, value, time = 1000) {
  while (true) {
    if (variable() === value) return variable;
    await new Promise((resolve) => setTimeout(resolve, time));
  }
}

/**
 * 获取类别名称
 * @param {string} category 类别
 * @returns {string} 类别名称
 */
export function getCategoryName(category) {
  return categories[category] || category;
}

/**
 * 判断是否为同一视频
 */
export function isSame(a, b) {
  return a && b && a === b;
}
