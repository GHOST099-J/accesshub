const SUPABASE_URL = "https://awtpelvnm...supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dHBlbHZubXBhbG15bm91dHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTMwNDksImV4cCI6MjEwMzcyOTA0OX0.sdTA_oSM8G2nqd-v4-ZabDv83icdgL9JnAYJ09CGkOA";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const modal = document.getElementById("modal");
const content = document.getElementById("modalContent");

function openModal(html) {
  content.innerHTML = html;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    closeModal();
  }
});


/* =========================
   LOGIN
========================= */

function showLogin() {
  openModal(`
    <h2>Welcome back 👋</h2>
    <p>Log in to your AccessHub account.</p>

    <input
      id="loginEmail"
      type="email"
      placeholder="Email"
    >

    <input
      id="loginPassword"
      type="password"
      placeholder="Password"
    >

    <button
      class="btn primary big"
      style="width:100%;margin-top:10px"
      onclick="loginUser()"
    >
      Login
    </button>

    <p style="text-align:center;color:#8f9aae">
      New here?
      <a
        href="#"
        onclick="showSignup();return false"
        style="color:#2b9cff"
      >
        Create an account
      </a>
    </p>
  `);
}


/* =========================
   SIGN UP
========================= */

function showSignup() {
  openModal(`
    <h2>Create your account</h2>
    <p>Sign up for AccessHub.</p>

    <input
      id="signupName"
      type="text"
      placeholder="Full name"
    >

    <input
      id="signupEmail"
      type="email"
      placeholder="Email"
    >

    <input
      id="signupPassword"
      type="password"
      placeholder="Create password"
    >

    <button
      class="btn primary big"
      style="width:100%;margin-top:10px"
      onclick="signupUser()"
    >
      Create Account
    </button>

    <p style="text-align:center">
      Already have an account?
      <a
        href="#"
        onclick="showLogin();return false"
        style="color:#2b9cff"
      >
        Login
      </a>
    </p>
  `);
}


/* =========================
   CREATE ACCOUNT
========================= */

async function signupUser() {

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const { data, error } =
    await db.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name
        }
      }
    });

  if (error) {
    alert(error.message);
    return;
  }

  openModal(`
    <h2>Account created ✅</h2>

    <p>
      Your AccessHub account has been created.
    </p>

    <p>
      If email confirmation is enabled,
      check your email to verify your account.
    </p>

    <button
      class="btn primary big"
      style="width:100%"
      onclick="closeModal()"
    >
      Continue
    </button>
  `);
}


/* =========================
   LOGIN USER
========================= */

async function loginUser() {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const { data, error } =
    await db.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    alert(error.message);
    return;
  }

  openModal(`
    <h2>Login successful ✅</h2>

    <p>
      Welcome back to AccessHub!
    </p>

    <button
      class="btn primary big"
      style="width:100%"
      onclick="closeModal()"
    >
      Continue
    </button>
  `);
}


/* =========================
   PREMIUM
========================= */

function goPremium() {

  const premium =
    document.querySelector("#premium");

  if (premium) {
    premium.scrollIntoView({
      behavior: "smooth"
    });
  }
}


/* =========================
   SELECT PREMIUM PLAN
========================= */

function selectPlan(plan, price) {

  openModal(`
    <h2>${plan}</h2>

    <p>
      Price:
      <strong>${price}</strong>
    </p>

    <p>
      Create an account to continue.
    </p>

    <button
      class="btn primary big"
      style="width:100%"
      onclick="showSignup()"
    >
      Create Account & Continue
    </button>
  `);
}


/* =========================
   LOCKED CONTENT
========================= */

function locked() {

  openModal(`
    <h2>🔒 Premium Content</h2>

    <p>
      Create an account and purchase Premium
      to unlock this content.
    </p>

    <button
      class="btn primary big"
      style="width:100%"
      onclick="showSignup()"
    >
      Create Account
    </button>
  `);
}


/* =========================
   CHECK CURRENT USER
========================= */

async function checkUser() {

  const {
    data: { user }
  } = await db.auth.getUser();

  if (user) {
    console.log("Logged in:", user.email);
  } else {
    console.log("No user logged in.");
  }
}


/* =========================
   LOGOUT
========================= */

async function logoutUser() {

  const { error } =
    await db.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  alert("Logged out successfully.");
}

checkUser();
