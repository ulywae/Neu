import welcomeHTML from "./welcome.html?raw";

export default function WelcomePage() {
  const el = document.createElement("div");
  el.setAttribute("data-page", "welcome");
  el.innerHTML = welcomeHTML;

  return {
    el,
    name: "welcome",
    onDestroy() {
      // console.log("🧹 WelcomePage destroyed");
    },
    onInit() {
      // console.log("🚀 WelcomePage init");
    },
  };
}
