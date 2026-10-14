
/* Share MAP viewer
   Kiểm tra phiên chia sẻ qua API.
   Luồng video trực tiếp cần tích hợp WebRTC riêng.
*/
(() => {
  const API_BASE = "https://share-api.ioscert.io.vn";

  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  const routeCode =
    pathParts[0] === "share-map" && pathParts.length >= 2
      ? pathParts[1]
      : "";

  const code = (
    params.get("code") || routeCode || ""
  ).trim().toUpperCase();

  const video = document.getElementById("remoteVideo");
  const placeholder = document.getElementById("placeholder");
  const title = document.getElementById("title");
  const status = document.getElementById("status");
  const roomCode = document.getElementById("roomCode");
  const placeholderTitle =
    document.getElementById("placeholderTitle");
  const placeholderText =
    document.getElementById("placeholderText");

  if (
    !placeholder ||
    !title ||
    !status ||
    !roomCode ||
    !placeholderTitle ||
    !placeholderText
  ) {
    console.error("Share MAP: Không tìm thấy các phần tử giao diện.");
    return;
  }

  roomCode.textContent = code || "—";

  function setState(label, heading, message) {
    status.textContent = label;
    placeholderTitle.textContent = heading;
    placeholderText.textContent = message;
    placeholder.hidden = false;
  }

  async function loadSession() {
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      title.textContent = "Liên kết không hợp lệ";
      setState(
        "Không hợp lệ",
        "Mã chia sẻ không đúng",
        "Đường dẫn cần có mã chia sẻ gồm 6 ký tự."
      );
      return;
    }

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
            : "Không tìm thấy phiên chia sẻ.";

        throw new Error(detail);
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
        return;
      }

      if (
        state === "waiting_for_stream" ||
        state === "waiting" ||
        state === "created" ||
        state === "unknown"
      ) {
        setState(
          "Đang chờ",
          "Đã tìm thấy phiên chia sẻ",
          "Phiên đã được tạo, nhưng luồng video trực tiếp chưa được kết nối."
        );
        return;
      }

      setState(
        "Đã kết nối API",
        "Đã tìm thấy phiên chia sẻ",
        "API xác nhận phiên tồn tại. Phần nhận video WebRTC chưa được tích hợp."
      );
    } catch (error) {
      console.error("Share MAP API error:", error);

      setState(
        "Không kết nối được",
        "Không thể tải phiên chia sẻ",
        error.message || "Vui lòng thử lại sau."
      );
    }
  }

  document
    .getElementById("fullscreenButton")
    ?.addEventListener("click", async () => {
      try {
        if (video?.requestFullscreen) {
          await video.requestFullscreen();
        } else if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } catch (error) {
        console.warn("Không thể bật toàn màn hình:", error);
      }
    });

  loadSession();
})();
