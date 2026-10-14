
/*
 * Share MAP Viewer
 * - Hỗ trợ link ?code=ABC123 và /share-map/ABC123
 * - Giữ nguyên chữ hoa/chữ thường của mã phiên
 * - Kiểm tra phiên qua Share MAP API
 * - Tự cập nhật trạng thái định kỳ
 * - Hỗ trợ nút toàn màn hình
 *
 * Lưu ý: Chưa tích hợp luồng video WebRTC.
 */

(() => {
  "use strict";

  const API_BASE = "https://share-api.ioscert.io.vn";
  const REFRESH_INTERVAL = 10000;

  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  // Hỗ trợ:
  // /share-map/?code=ABC123
  // /share-map/ABC123
  const routeCode =
    pathParts[0] === "share-map" && pathParts.length >= 2
      ? pathParts[1]
      : "";

  // Giữ nguyên chữ hoa/chữ thường vì mã có thể phân biệt chữ.
  const code = (
    params.get("code") || routeCode || ""
  ).trim();

  const elements = {
    video: document.getElementById("remoteVideo"),
    placeholder: document.getElementById("placeholder"),
    title: document.getElementById("title"),
    status: document.getElementById("status"),
    roomCode: document.getElementById("roomCode"),
    placeholderTitle: document.getElementById("placeholderTitle"),
    placeholderText: document.getElementById("placeholderText"),
    fullscreenButton: document.getElementById("fullscreenButton")
  };

  const {
    video,
    placeholder,
    title,
    status,
    roomCode,
    placeholderTitle,
    placeholderText,
    fullscreenButton
  } = elements;

  if (
    !placeholder ||
    !title ||
    !status ||
    !roomCode ||
    !placeholderTitle ||
    !placeholderText
  ) {
    console.error(
      "[Share MAP] Không tìm thấy phần tử giao diện cần thiết."
    );
    return;
  }

  roomCode.textContent = code || "—";

  let refreshTimer = null;
  let requestInProgress = false;
  let stopped = false;

  function setState(label, heading, message) {
    status.textContent = label;
    placeholderTitle.textContent = heading;
    placeholderText.textContent = message;
    placeholder.hidden = false;
  }

  function scheduleRefresh() {
    if (stopped) return;

    if (refreshTimer !== null) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(() => {
      loadSession();
    }, REFRESH_INTERVAL);
  }

  async function loadSession() {
    if (requestInProgress || stopped) return;

    // Mã gồm đúng 6 ký tự chữ hoặc số, có phân biệt hoa/thường.
    if (!/^[A-Za-z0-9]{6}$/.test(code)) {
      title.textContent = "Liên kết không hợp lệ";

      setState(
        "Không hợp lệ",
        "Mã chia sẻ không đúng",
        "Đường dẫn cần có mã chia sẻ gồm 6 ký tự chữ hoặc số."
      );

      stopped = true;
      return;
    }

    requestInProgress = true;
    title.textContent = "Phiên " + code;

    setState(
      "Đang kiểm tra",
      "Đang kiểm tra phiên chia sẻ",
      "Đang kết nối tới Share MAP API..."
    );

    try {
      const response = await fetch(
        `${API_BASE}/v1/share-sessions/${encodeURIComponent(code)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          },
          cache: "no-store"
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "";

        if (response.status === 404) {
          throw new Error(
            "Không tìm thấy phiên này. Hãy kiểm tra mã hoặc tạo phiên mới."
          );
        }

        if (response.status === 410) {
          throw new Error(
            "Phiên chia sẻ đã hết hạn. Hãy yêu cầu người phát tạo phiên mới."
          );
        }

        throw new Error(
          detail || `Máy chủ trả về lỗi HTTP ${response.status}.`
        );
      }

      const state = String(
        data.status || data.state || "unknown"
      ).toLowerCase();

      if (
        state === "stopped" ||
        state === "ended" ||
        state === "expired"
      ) {
        setState(
          "Đã kết thúc",
          "Phiên chia sẻ đã kết thúc",
          "Hãy yêu cầu người phát tạo một phiên mới."
        );

        stopped = true;
        return;
      }

      if (
        state === "waiting_for_stream" ||
        state === "waiting" ||
        state === "created"
      ) {
        setState(
          "Đang chờ",
          "Đã tìm thấy phiên chia sẻ",
          "Phiên đã được tạo thành công. Đang chờ thiết bị phát màn hình kết nối."
        );

        scheduleRefresh();
        return;
      }

      if (state === "unknown") {
        setState(
          "Đã nhận phản hồi",
          "Chưa xác định được trạng thái phiên",
          "API đã phản hồi nhưng chưa trả về trạng thái phiên nhận diện được."
        );

        scheduleRefresh();
        return;
      }

      // Phiên tồn tại không đồng nghĩa video đã phát.
      setState(
        "Đã tìm thấy phiên",
        "Phiên chia sẻ đã sẵn sàng",
        "API đã xác nhận phiên tồn tại. Luồng video trực tiếp cần được kết nối riêng."
      );

      scheduleRefresh();

    } catch (error) {
      console.error("[Share MAP API]", error);

      setState(
        "Không kết nối được",
        "Không thể tải phiên chia sẻ",
        error.message ||
          "Không thể kết nối máy chủ. Vui lòng thử lại."
      );

      // Thử lại khi lỗi mạng tạm thời.
      scheduleRefresh();

    } finally {
      requestInProgress = false;
    }
  }

  // Nút toàn màn hình.
  fullscreenButton?.addEventListener("click", async () => {
    try {
      if (video?.requestFullscreen) {
        await video.requestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else {
        const player = video?.parentElement;

        if (player?.requestFullscreen) {
          await player.requestFullscreen();
        }
      }
    } catch (error) {
      console.warn(
        "[Share MAP] Không thể bật toàn màn hình:",
        error
      );
    }
  });

  // Dọn bộ hẹn giờ khi người dùng rời trang.
  window.addEventListener("pagehide", () => {
    stopped = true;

    if (refreshTimer !== null) {
      clearTimeout(refreshTimer);
    }
  });

  loadSession();
})();
