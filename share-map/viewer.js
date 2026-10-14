/*
 * iOSCert Share Map Viewer
 *
 * Hỗ trợ URL:
 *   https://ioscert.io.vn/share-map/wWYi2H
 *   https://ioscert.io.vn/share-map/?code=wWYi2H
 *
 * Backend hiện tại:
 * - Có API tạo và quản lý share session.
 * - Chưa có WebRTC viewer-token.
 * - Chưa có luồng video trực tiếp.
 *
 * Trước khi sử dụng API công khai:
 * Thay API_BASE bằng domain HTTPS của Share Map API.
 */

(() => {
  "use strict";

  // =========================================================
  // 1. CẤU HÌNH API
  // =========================================================

  const API_BASE =
    "https://REPLACE-WITH-PUBLIC-SHARE-API-DOMAIN";

  const API_CONFIGURED =
    API_BASE.startsWith("https://") &&
    !API_BASE.includes("REPLACE-WITH-PUBLIC-SHARE-API-DOMAIN");

  // =========================================================
  // 2. LẤY MÃ CHIA SẺ TỪ URL
  // =========================================================

  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  // Dạng /share-map/wWYi2H
  const routeCode =
    pathParts[0] === "share-map" && pathParts.length > 1
      ? pathParts[1]
      : "";

  // Dạng /share-map/?code=wWYi2H
  // Hỗ trợ thêm sharePath để tương thích fallback cũ.
  const sharePath = params.get("sharePath") || "";
  const fallbackParts = sharePath.split("/").filter(Boolean);

  const fallbackCode =
    fallbackParts[0] === "share-map" && fallbackParts.length > 1
      ? fallbackParts[1]
      : "";

  const rawCode = params.get("code") || routeCode || fallbackCode;

  let code = rawCode;

  try {
    code = decodeURIComponent(rawCode);
  } catch (_) {
    code = "";
  }

  code = code.trim().toUpperCase();

  // =========================================================
  // 3. LẤY PHẦN TỬ GIAO DIỆN
  // =========================================================

  const $ = (id) => document.getElementById(id);

  const video = $("remoteVideo");
  const placeholder = $("placeholder");
  const title = $("title");
  const status = $("status");
  const codeNode = $("roomCode");
  const placeholderTitle = $("placeholderTitle");
  const placeholderText = $("placeholderText");
  const fullscreenButton = $("fullscreenButton");

  // Kiểm tra các phần tử bắt buộc để tránh lỗi JS âm thầm.
  if (
    !video ||
    !placeholder ||
    !title ||
    !status ||
    !codeNode ||
    !placeholderTitle ||
    !placeholderText
  ) {
    console.error(
      "[Share Map] Không tìm thấy phần tử giao diện cần thiết. " +
      "Kiểm tra index.html và ID của các phần tử."
    );
    return;
  }

  // =========================================================
  // 4. TẠO NÚT KIỂM TRA LẠI
  // =========================================================

  let refreshButton = $("refreshSessionButton");

  if (!refreshButton) {
    refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.id = "refreshSessionButton";
    refreshButton.textContent = "Kiểm tra lại";
    refreshButton.style.marginTop = "14px";
    refreshButton.setAttribute("aria-label", "Kiểm tra lại phiên chia sẻ");

    placeholder.appendChild(refreshButton);
  }

  // =========================================================
  // 5. HÀM CẬP NHẬT GIAO DIỆN
  // =========================================================

  function setState(label, heading, message, options = {}) {
    const { error = false, showPlaceholder = true } = options;

    status.textContent = label;
    status.style.color = error ? "#ff9aaa" : "";

    placeholderTitle.textContent = heading;
    placeholderText.textContent = message;

    placeholder.hidden = !showPlaceholder;

    if (showPlaceholder) {
      video.style.display = "none";
    }
  }

  function setLoading(isLoading) {
    refreshButton.disabled = isLoading;
    refreshButton.textContent = isLoading
      ? "Đang kiểm tra..."
      : "Kiểm tra lại";
  }

  function formatDate(timestamp) {
    const date = new Date(Number(timestamp) * 1000);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("vi-VN");
  }

  function updateExpiry(data) {
    const expiresAt = data && data.expiresAt;

    if (!expiresAt) {
      return;
    }

    const expiry = formatDate(expiresAt);

    if (expiry) {
      placeholderText.textContent +=
        "\nHạn phiên dự kiến: " + expiry + ".";
    }
  }

  // =========================================================
  // 6. KHỞI TẠO MÃ PHIÊN
  // =========================================================

  codeNode.textContent = code || "—";

  // =========================================================
  // 7. KIỂM TRA PHIÊN CHIA SẺ
  // =========================================================

  async function checkSession() {
    // Kiểm tra định dạng mã gồm đúng 6 ký tự.
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      title.textContent = "Liên kết không hợp lệ";

      setState(
        "Không hợp lệ",
        "Mã chia sẻ không đúng",
        "Đường dẫn cần có mã gồm 6 ký tự, ví dụ /share-map/wWYi2H.",
        { error: true }
      );

      setLoading(false);
      return;
    }

    title.textContent = "Phiên " + code;

    // API chưa được cấu hình.
    if (!API_CONFIGURED) {
      setState(
        "Chưa cấu hình",
        "Chưa kết nối máy chủ",
        "Giao diện đã sẵn sàng, nhưng cần cấu hình domain HTTPS công khai của Share Map API."
      );

      setLoading(false);
      return;
    }

    setLoading(true);

    setState(
      "Đang kiểm tra",
      "Đang kiểm tra phiên",
      "Đang liên hệ máy chủ chia sẻ..."
    );

    const controller = new AbortController();

    // Tránh yêu cầu bị treo quá lâu.
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const response = await fetch(
        `${API_BASE.replace(/\/+$/, "")}/v1/share-sessions/${encodeURIComponent(code)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          },
          cache: "no-store",
          signal: controller.signal
        }
      );

      const data = await response.json().catch(() => ({}));

      // API không tìm thấy phiên.
      if (response.status === 404) {
        setState(
          "Không tìm thấy",
          "Phiên không tồn tại",
          "Mã có thể không chính xác, đã hết hạn hoặc phiên không còn được lưu.",
          { error: true }
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          `Máy chủ trả về HTTP ${response.status}`
        );
      }

      const sessionStatus = String(
        data.status || "unknown"
      ).toLowerCase();

      // Phiên đang hoạt động hoặc chờ thiết bị phát.
      if (
        ["active", "waiting_for_stream", "waiting"].includes(
          sessionStatus
        )
      ) {
        const message =
          sessionStatus === "active"
            ? "Phiên đã được tạo. Tuy nhiên, luồng video WebRTC chưa được tích hợp."
            : "Mã phiên hợp lệ. Đang chờ thiết bị phát; hệ thống hiện chưa có luồng video WebRTC.";

        setState(
          sessionStatus === "active"
            ? "Phiên đang hoạt động"
            : "Đang chờ video",
          "Đang chờ luồng video",
          message
        );

        updateExpiry(data);

        // Không hiển thị video giả khi chưa có media stream.
        return;
      }

      // Những trạng thái còn lại được xem là không hoạt động.
      setState(
        "Phiên không hoạt động",
        "Phiên đã kết thúc",
        "Hãy yêu cầu người chia sẻ tạo một phiên mới.",
        { error: true }
      );
    } catch (error) {
      let message;

      if (error.name === "AbortError") {
        message = "Máy chủ phản hồi quá chậm. Hãy thử lại sau.";
      } else {
        message =
          error.message ||
          "Không thể kết nối máy chủ chia sẻ.";
      }

      setState(
        "Lỗi kết nối",
        "Không thể kiểm tra phiên",
        message +
          " Kiểm tra domain HTTPS, trạng thái API và cấu hình CORS.",
        { error: true }
      );

      console.error("[Share Map] Lỗi kiểm tra phiên:", error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  // =========================================================
  // 8. SỰ KIỆN NÚT KIỂM TRA LẠI
  // =========================================================

  refreshButton.addEventListener("click", checkSession);

  // =========================================================
  // 9. NÚT TOÀN MÀN HÌNH
  // =========================================================

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", async () => {
      try {
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        } else {
          console.warn(
            "[Share Map] Trình duyệt không hỗ trợ toàn màn hình video."
          );
        }
      } catch (error) {
        console.warn(
          "[Share Map] Không thể bật toàn màn hình:",
          error
        );
      }
    });
  }

  // =========================================================
  // 10. CHẠY LẦN ĐẦU
  // =========================================================

  checkSession();
})();
