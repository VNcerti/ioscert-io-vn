/*
 * iOSCert Share Map viewer
 *
 * The current Raspberry Pi API only manages share sessions; it does NOT yet
 * provide /viewer-token or a WebRTC media stream. Keep this viewer honest until
 * the WebRTC provider and sender-side screen capture have been implemented.
 *
 * After the API is publicly exposed, set API_BASE to its HTTPS origin.
 */
(() => {
  const API_BASE = "https://REPLACE-WITH-PUBLIC-SHARE-API-DOMAIN";
  const params = new URLSearchParams(location.search);
  const resolvedPath = params.get("sharePath") || location.pathname;
  const code = decodeURIComponent(resolvedPath.split("/").filter(Boolean).pop() || "");
  const video = document.getElementById("remoteVideo");
  const placeholder = document.getElementById("placeholder");
  const title = document.getElementById("title");
  const status = document.getElementById("status");
  const codeNode = document.getElementById("roomCode");
  const placeholderTitle = document.getElementById("placeholderTitle");
  const placeholderText = document.getElementById("placeholderText");
  const refreshButton = document.createElement("button");
  refreshButton.type = "button";
  refreshButton.textContent = "Kiểm tra lại";
  refreshButton.id = "refreshSessionButton";
  refreshButton.style.marginTop = "14px";
  placeholder.appendChild(refreshButton);

  codeNode.textContent = code || "—";

  const setState = (label, heading, message, invalid = false) => {
    status.textContent = label;
    placeholderTitle.textContent = heading;
    placeholderText.textContent = message;
    placeholder.hidden = false;
    if (video) video.style.display = "none";
    status.style.color = invalid ? "#ff9aaa" : "";
  };

  async function checkSession() {
    if (!/^[A-Za-z0-9]{6}$/.test(code)) {
      title.textContent = "Liên kết không hợp lệ";
      setState("Không hợp lệ", "Mã chia sẻ không đúng", "Đường dẫn cần có mã gồm 6 ký tự ở cuối.", true);
      refreshButton.disabled = true;
      return;
    }

    title.textContent = "Phiên " + code;

    if (API_BASE.includes("REPLACE-WITH-PUBLIC-SHARE-API-DOMAIN")) {
      setState(
        "Chưa cấu hình",
        "Chưa kết nối máy chủ",
        "Giao diện đã sẵn sàng. Cần cấu hình domain HTTPS công khai của backend để kiểm tra phiên."
      );
      return;
    }

    refreshButton.disabled = true;
    setState("Đang kiểm tra", "Đang kiểm tra phiên", "Đang liên hệ máy chủ chia sẻ…");

    try {
      const response = await fetch(
        `${API_BASE}/v1/share-sessions/${encodeURIComponent(code)}`,
        { method: "GET", headers: { "Accept": "application/json" }, cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));

      if (response.status === 404) {
        setState("Không tìm thấy", "Phiên không tồn tại", "Mã sai, đã hết hạn hoặc phiên không còn được lưu.", true);
        return;
      }
      if (!response.ok) throw new Error(data.message || `Máy chủ trả về HTTP ${response.status}`);

      const sessionStatus = String(data.status || "unknown").toLowerCase();
      if (data.expiresAt) {
        const expires = new Date(data.expiresAt * 1000).toLocaleString("vi-VN");
        placeholderText.textContent = `Phiên hợp lệ. Hạn phiên dự kiến: ${expires}. Tuy nhiên, luồng video WebRTC chưa được tích hợp.`;
      } else {
        placeholderText.textContent = "Phiên tồn tại, nhưng luồng video WebRTC chưa được tích hợp.";
      }

      if (["active", "waiting_for_stream", "waiting"].includes(sessionStatus)) {
        setState(
          sessionStatus === "active" ? "Đang hoạt động" : "Đang chờ video",
          "Đang chờ luồng video",
          placeholderText.textContent
        );
      } else {
        setState("Đã kết thúc", "Phiên không còn hoạt động", "Hãy yêu cầu người chia sẻ tạo phiên mới.", true);
      }
    } catch (error) {
      setState("Lỗi kết nối", "Không thể kiểm tra phiên", `${error.message}. Kiểm tra domain HTTPS và cấu hình CORS.`, true);
    } finally {
      refreshButton.disabled = false;
    }
  }

  refreshButton.addEventListener("click", checkSession);

  document.getElementById("fullscreenButton").addEventListener("click", async () => {
    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch (_) {}
  });

  checkSession();
})();
