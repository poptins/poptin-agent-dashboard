const PASSWORD_HASH = "d33dc4f24cb91fc6975925bb3d2129b2948b2c8834029996136e4b34c83e6368";
async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
if (sessionStorage.getItem("agentDashboardAccess") === PASSWORD_HASH) window.location.replace("dashboard.html");
document.querySelector("#loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const password = document.querySelector("#password");
  const error = document.querySelector("#error");
  if (await sha256(password.value) === PASSWORD_HASH) {
    sessionStorage.setItem("agentDashboardAccess", PASSWORD_HASH);
    window.location.replace("dashboard.html");
  } else {
    error.textContent = "That password is not correct. Please try again.";
    password.value = "";
    password.focus();
  }
});
