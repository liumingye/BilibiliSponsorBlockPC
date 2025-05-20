console.log("Bilibili SponsorBlock");

const options = {
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

const XOR_CODE = 23442827791579n;
const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;
const data = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";
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

const getSkipSegments = async () => {
  const manifest = window.biliPlayer.getManifest();
  const bvid = manifest.bvid ? manifest.bvid : av2bv(manifest.aid);
  const data = await window.fetch(
    `https://bsbsb.top/api/skipSegments?videoID=${bvid}&cid=${manifest.cid}`
  );
  if (data.status == 200) {
    const json = await data.json();
    return json;
  }
  return [];
};

// 循环等待window变量出现函数
const waitConst = async (constName, time = 1000) => {
  while (true) {
    if (window[constName]) {
      return window[constName];
    }
    await new Promise((resolve) => setTimeout(resolve, time));
  }
};

// 循环等待dom出现函数
const waitDom = async (dom, time = 1000) => {
  while (true) {
    if (document.querySelector(dom)) {
      return document.querySelector(dom);
    }
    await new Promise((resolve) => setTimeout(resolve, time));
  }
};

window.onload = async () => {
  if (location.pathname === "/player.html") {
    await waitConst("biliPlayer");
    console.log("SponsorBlock onload");
    let segments = [];

    const _getSkipSegments = async () => {
      segments = [];
      segments = await getSkipSegments();
      console.log("获取到的片段", segments);
      updatePreviewBar(segments);
    };

    _getSkipSegments();

    window.biliPlayer.on("Player_Prepared", _getSkipSegments);
    window.biliPlayer.on("Player_TimeUpdate", () => {
      if (segments.length == 0) return;
      segments.forEach(({ segment, videoDuration, category }) => {
        const [start, end] = segment;

        const startTime = end ? Math.min(videoDuration, start) : start;
        const endTime = Math.min(videoDuration, end);

        const currentTime = window.biliPlayer.getCurrentTime();
        if (
          currentTime >= parseInt(startTime) &&
          currentTime <= parseInt(startTime) + 1
        ) {
          if (options.categoryActions[category] === "skip") {
            window.biliPlayer.seek(endTime);
            console.log(`skip ${category} segment at ${currentTime}s`);
          }
        }
      });
    });
  }
};

const decimalTimeConverter = (value, videoDuration, isTime) => {
  if (isTime) {
    return Math.min(1, value / videoDuration);
  } else {
    return Math.max(0, value * videoDuration);
  }
};

const timeToDecimal = (time, videoDuration) => {
  return decimalTimeConverter(time, videoDuration, true);
};

const timeToPercentage = (time, videoDuration) => {
  return `${timeToDecimal(time, videoDuration) * 100}%`;
};

const timeToRightPercentage = (time, videoDuration) => {
  return `${(1 - timeToDecimal(time, videoDuration)) * 100}%`;
};

const updatePreviewBar = async (segments) => {
  await waitDom(".bpx-player-progress");
  document.querySelector(".previewbar")?.remove();
  const container = document.createElement("ul");
  container.id = "previewbar";
  const bars = segments.map(({ segment, videoDuration, category }) => {
    const [start, end] = segment;
    const bar = document.createElement("li");
    bar.classList.add("previewbar");
    bar.setAttribute("sponsorblock-category", category);
    bar.style.backgroundColor = `var(--sb-category-${category})`;
    bar.style.opacity = "0.7";
    bar.style.position = "absolute";
    const duration = Math.min(end, videoDuration) - start;
    const startTime = end ? Math.min(videoDuration, start) : start;
    const endTime = Math.min(videoDuration, end);
    bar.style.left = timeToPercentage(startTime, videoDuration);
    if (duration > 0) {
      bar.style.right = timeToRightPercentage(endTime, videoDuration);
    }
    return bar;
  });
  bars.forEach((bar) => container.appendChild(bar));
  document
    .querySelector(".bpx-player-progress")
    .insertAdjacentElement("afterbegin", container);
};

// head插入style
const style = document.createElement("style");
style.innerHTML = `
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

document.head.appendChild(style);
