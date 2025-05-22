/**
 * API模块 - 处理与SponsorBlock API的交互
 */

const API_BASE_URL = "https://bsbsb.top/api";

/**
 * 获取视频的跳过片段
 * @param {string} videoId 视频ID
 * @returns {Promise<Array>} 跳过片段数组
 */
export async function getSkipSegments(data) {
  try {
    return await httpServer.get(`${API_BASE_URL}/skipSegments`, {
      params: data,
    });
  } catch (error) {
    // console.error("Failed to fetch skip segments:", error);
    return [];
  }
}

/**
 * 提交新的跳过片段
 * @param {Object} segmentData 片段数据
 * @returns {Promise<Object>} 提交结果
 */
export async function submitSkipSegment(segmentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/skipSegments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(segmentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to submit skip segment:", error);
    throw error;
  }
}

/**
 * 投票评价片段
 * @param {string} uuid 片段UUID
 * @param {number} type 投票类型（1: 赞成, 0: 反对）
 * @returns {Promise<void>}
 */
export async function voteOnSegment(uuid, type) {
  try {
    const response = await fetch(`${API_BASE_URL}/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UUID: uuid,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to vote on segment:", error);
    throw error;
  }
}

/**
 * 查看片段状态
 * @param {string} uuid 片段UUID
 * @returns {Promise<Object>} 片段状态
 */
export async function getSegmentInfo(uuid) {
  try {
    const response = await fetch(`${API_BASE_URL}/segmentInfo?UUID=${uuid}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get segment info:", error);
    throw error;
  }
}

/**
 * 获取用户统计信息
 * @param {string} userId 用户ID
 * @returns {Promise<Object>} 用户统计信息
 */
export async function getUserStats(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/userInfo?userID=${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get user stats:", error);
    throw error;
  }
}
