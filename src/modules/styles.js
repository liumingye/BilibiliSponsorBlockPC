/**
 * 样式模块 - 处理CSS样式
 */
import { categoryStyles, previewBarStyles } from "./config.js";

/**
 * 添加全局样式
 */
export function addGlobalStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* SponsorBlock 通知样式 */
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
    
    /* SponsorBlock 按钮样式 */
    .sponsorblock-button {
      cursor: pointer;
      margin-left: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      border: solid 1px #999;
      padding: 8px 12px;
    }
    
    .sponsorblock-button:hover {
      background-color: rgba(99, 99, 99, 0.3);
      border: solid 1px #fff;
    }
    
    /* SponsorBlock 设置面板样式 */
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
    
    /* 暗色模式适配 */
    @media (prefers-color-scheme: dark) {
      .sponsorblock-settings-panel {
        background-color: #232323;
        color: #e5e5e5;
      }
      
      .sponsorblock-settings-item select {
        background-color: #333;
        color: #e5e5e5;
        border: 1px solid #555;
      }
    }
    
    /* 提交片段面板样式 */
    .sponsorblock-submit-panel {
      position: absolute;
      bottom: 50px;
      left: 10px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      padding: 16px;
      z-index: 100;
      width: 300px;
    }
    
    .sponsorblock-submit-panel h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
    }
    
    .sponsorblock-submit-form {
      display: flex;
      flex-direction: column;
    }
    
    .sponsorblock-submit-form label {
      margin-bottom: 4px;
    }
    
    .sponsorblock-submit-form select,
    .sponsorblock-submit-form input {
      margin-bottom: 12px;
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .sponsorblock-submit-form button {
      padding: 8px 12px;
      background-color: #00a0d6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .sponsorblock-submit-form button:hover {
      background-color: #0082b0;
    }
    
    /* 时间标记样式 */
    .sponsorblock-time-marker {
      position: absolute;
      bottom: 0;
      width: 2px;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 2;
    }
  `;

  document.head.appendChild(style);
}

/**
 * 添加预览条样式
 */
export function addPreviewBarStyles() {
  const style = document.createElement("style");
  style.textContent = previewBarStyles;
  document.head.appendChild(style);
}

/**
 * 添加类别颜色样式
 */
export function addCategoryColorStyles() {
  const style = document.createElement("style");
  style.textContent = categoryStyles;
  document.head.appendChild(style);
}

/**
 * 初始化所有样式
 */
export function initStyles() {
  addGlobalStyles();
  addPreviewBarStyles();
  addCategoryColorStyles();
}
