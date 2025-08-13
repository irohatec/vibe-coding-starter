// ======== ① Firebase 設定（あなたのプロジェクトの値で上書き） ========
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
// ======== ② 生成APIのURL（RenderのURLに置換） ========
const API_BASE = "https://YOUR-RENDER-SERVICE.onrender.com";

// ======== Firebase初期化 ========
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ======== UI要素 ========
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const googleLoginBtn = document.getElementById("google-login");
const logoutBtn = document.getElementById("logout");
const userName = document.getElementById("user-name");
const userPhoto = document.getElementById("user-photo");
const titleInput = document.getElementById("title");
const skillsInput = document.getElementById("skills");
const bioInput = document.getElementById("bio");
const saveBtn = document.getElementById("save-profile");
const genBtn = document.getElementById("generate-bio");
const toast = document.getElementById("toast");

// ======== ユーティリティ ========
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}
function setLoading(el, loading) {
  el.disabled = loading;
  el.textContent = loading ? "処理中..." : el.getAttribute("data-label") || el.textContent;
}

// ======== 認証状態監視 ========
auth.onAuthStateChanged(async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    userName.textContent = user.displayName || "ユーザー";
    if (user.photoURL) {
      userPhoto.src = user.photoURL;
      userPhoto.classList.remove("hidden");
    } else {
      userPhoto.classList.add("hidden");
    }
    // Firestoreからプロフィール読込
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data();
      titleInput.value = data.title || "";
      skillsInput.value = (data.skills || []).join(", ");
      bioInput.value = data.bio || "";
    }
  } else {
    appSection.classList.add("hidden");
    authSection.classList.remove("hidden");
  }
});

// ======== イベント ========
googleLoginBtn.addEventListener("click", async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (e) {
    console.error(e);
    showToast("ログインに失敗しました");
  }
});

logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
});

saveBtn.setAttribute("data-label", "プロフィール保存");
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return showToast("ログインしてください");
  try {
    const skills = skillsInput.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await db.collection("users").doc(user.uid).set(
      {
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        title: titleInput.value.trim(),
        skills,
        bio: bioInput.value.trim(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    showToast("保存しました");
  } catch (e) {
    console.error(e);
    showToast("保存に失敗しました");
  }
});

genBtn.setAttribute("data-label", "AIで自己紹介生成");
genBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return showToast("ログインしてください");
  setLoading(genBtn, true);
  try {
    const payload = {
      displayName: user.displayName || "",
      title: titleInput.value.trim(),
      skills: skillsInput.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await fetch(`${API_BASE}/generate-bio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    bioInput.value = data.bio || "";
    showToast("自己紹介を生成しました");
  } catch (e) {
    console.error(e);
    showToast("生成に失敗しました");
  } finally {
    setLoading(genBtn, false);
  }
});
