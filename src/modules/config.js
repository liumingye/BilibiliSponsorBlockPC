/**
 * 配置模块 - 包含插件的配置选项
 */

// 各类型片段的处理方式配置
export const options = {
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

// 类别颜色样式
export const categoryStyles = `
:root {
    --sb-category-sponsor: #00d400;--darkreader-bg--sb-category-sponsor: #00d400;
    --sb-category-preview-sponsor: #007800;--darkreader-bg--sb-category-preview-sponsor: #007800;
    --sb-category-selfpromo: #ffff00;--darkreader-bg--sb-category-selfpromo: #ffff00;
    --sb-category-preview-selfpromo: #bfbf35;--darkreader-bg--sb-category-preview-selfpromo: #bfbf35;
    --sb-category-exclusive_access: #008a5c;--darkreader-bg--sb-category-exclusive_access: #008a5c;
    --sb-category-interaction: #cc00ff;--darkreader-bg--sb-category-interaction: #cc00ff;
    --sb-category-preview-interaction: #6c0087;--darkreader-bg--sb-category-preview-interaction: #6c0087;
    --sb-category-intro: #00ffff;--darkreader-bg--sb-category-intro: #00ffff;
    --sb-category-preview-intro: #008080;--darkreader-bg--sb-category-preview-intro: #008080;
    --sb-category-outro: #0202ed;--darkreader-bg--sb-category-outro: #0202ed;
    --sb-category-preview-outro: #000070;--darkreader-bg--sb-category-preview-outro: #000070;
    --sb-category-preview: #008fd6;--darkreader-bg--sb-category-preview: #008fd6;
    --sb-category-preview-preview: #005799;--darkreader-bg--sb-category-preview-preview: #005799;
    --sb-category-music_offtopic: #ff9900;--darkreader-bg--sb-category-music_offtopic: #ff9900;
    --sb-category-preview-music_offtopic: #a6634a;--darkreader-bg--sb-category-preview-music_offtopic: #a6634a;
    --sb-category-poi_highlight: #ff1684;--darkreader-bg--sb-category-poi_highlight: #ff1684;
    --sb-category-preview-poi_highlight: #9b044c;--darkreader-bg--sb-category-preview-poi_highlight: #9b044c;
    --sb-category-filler: #7300FF;--darkreader-bg--sb-category-filler: #7300FF;
    --sb-category-preview-filler: #2E0066;--darkreader-bg--sb-category-preview-filler: #2E0066;
    --sb-category-dynamicSponsor_sponsor: #007800;--darkreader-bg--sb-category-dynamicSponsor_sponsor: #007800;
    --sb-category-dynamicSponsor_forward_sponsor: #bfbf35;--darkreader-bg--sb-category-dynamicSponsor_forward_sponsor: #bfbf35;
    --sb-category-dynamicSponsor_suspicion_sponsor: #a6634a;--darkreader-bg--sb-category-dynamicSponsor_suspicion_sponsor: #a6634a;
}
`;

// 预览条样式
export const previewBarStyles = `
#previewbar {
	overflow: hidden;
	padding: 0;
	margin: 0;
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 1;
	transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1);
}

.previewbar {
	display: inline-block;
	height: 100%;
	min-width: 1px;
}
`;