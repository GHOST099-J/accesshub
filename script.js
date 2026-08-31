/* =========================================
   ACCESSHUB — SUPABASE CONNECTION
========================================= */

const SUPABASE_URL =
  "https://awtpelvnmpalmynouttg.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dHBlbHZubXBhbG15bm91dHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTMwNDksImV4cCI6MjEwMzcyOTA0OX0.sdTA_oSM8G2nqd-v4-ZabDv83icdgL9JnAYJ09CGkOA";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================
   SUPABASE CONNECTION
========================================= */

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================
   MODAL
========================================= */

const modal = document.getElementById("modal");
const content = document.getElementById("modalContent");

function openModal(html) {
  if (!modal || !content) return;

  content.innerHTML = html;
  modal.style.display = "flex";
}

function closeModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

if (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}


/* =========================================
   LOGIN FORM
========================================= */

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

    <p id="loginMessage"
       style="text-align:center;color:#8f9aae">
    </p>

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


/* =========================================
   SIGNUP FORM
========================================= */

function showSignup() {

  openModal(`
    <h2>Create your account</h2>

    <p>Join AccessHub today.</p>

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

    <p id="signupMessage"
       style="text-align:center;color:#8f9aae">
    </p>

    <p style="text-align:center;color:#8f9aae">
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


/* =========================================
   CREATE ACCOUNT
========================================= */

async function signupUser() {

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;

  const message =
    document.getElementById("signupMessage");


  if (!name || !email || !password) {
    message.textContent =
      "Please fill in all fields.";
    return;
  }


  if (password.length < 6) {
    message.textContent =
      "Password must be at least 6 characters.";
    return;
  }


  message.textContent =
    "Creating your account...";


  try {

    const { data, error } =
      await db.auth.signUp({

        email: email,

        password: password,

        options: {
          data: {
            full_name: name
          },

          emailRedirectTo:
            "https://ghost099-j.github.io/accesshub/"
        }

      });


    if (error) {

      message.textContent =
        "Signup error: " + error.message;

      return;
    }


    openModal(`
      <h2>Account created! 🎉</h2>

      <p>
        Your AccessHub account has been created.
      </p>

      <p>
        Please check your email and confirm
        your account if email confirmation is enabled.
      </p>

      <button
        class="btn primary big"
        style="width:100%"
        onclick="closeModal()"
      >
        Continue
      </button>
    `);


  } catch (error) {

    message.textContent =
      "Something went wrong: " + error.message;

  }

}


/* =========================================
   LOGIN
========================================= */

async function loginUser() {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  const message =
    document.getElementById("loginMessage");


  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }


  message.textContent =
    "Logging in...";


  try {

    const { error } =
      await db.auth.signInWithPassword({

        email: email,
        password: password

      });


    if (error) {

      message.textContent =
        "Login error: " + error.message;

      return;
    }


    message.textContent =
      "Login successful! ✅";


    setTimeout(() => {
      closeModal();
      checkUser();
    }, 700);


  } catch (error) {

    message.textContent =
      "Something went wrong: " + error.message;

  }

}


/* =========================================
   GET CURRENT USER
========================================= */

async function getCurrentUser() {

  const {
    data: { user },
    error
  } = await db.auth.getUser();

  if (error) {
    console.error("User error:", error);
    return null;
  }

  return user;
}


/* =========================================
   CHECK PREMIUM MEMBERSHIP
========================================= */

async function getMembership() {

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }


  const { data, error } =
    await db
      .from("memberships")
      .select("id, plan, status, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();


  if (error) {

    console.error(
      "Membership check failed:",
      error
    );

    return null;
  }


  if (!data) {
    return null;
  }


  /* Permanent membership */

  if (
    data.plan === "Permanent Premium" &&
    data.status === "active"
  ) {

    return data;
  }


  /* Time-based membership */

  if (data.expires_at) {

    const expiry =
      new Date(data.expires_at);

    const now = new Date();

    if (expiry > now) {
      return data;
    }

    return null;
  }


  return null;
}


/* =========================================
   IS PREMIUM?
========================================= */

async function isPremium() {

  const membership =
    await getMembership();

  return membership !== null;
}


/* =========================================
   LOCKED CONTENT
========================================= */

async function locked() {

  const premium =
    await isPremium();


  /* PREMIUM USER */

  if (premium) {

    openModal(`
      <h2>🔓 Premium Access</h2>

      <p>
        Your Premium membership is active.
      </p>

      <p>
        You can now access the Premium library.
      </p>

      <button
        class="btn primary big"
        style="width:100%"
        onclick="closeModal()"
      >
        Continue
      </button>
    `);

    return;
  }


  /* NORMAL USER */

  const user =
    await getCurrentUser();


  if (!user) {

    openModal(`
      <h2>🔒 Premium Content</h2>

      <p>
        Please create an account or log in
        to continue.
      </p>

      <button
        class="btn primary big"
        style="width:100%"
        onclick="showLogin()"
      >
        Login
      </button>

      <button
        class="btn ghost big"
        style="width:100%;margin-top:10px"
        onclick="showSignup()"
      >
        Create Account
      </button>
    `);

    return;
  }


  /* LOGGED IN BUT NO PREMIUM */

  openModal(`
    <h2>🔒 Premium Content</h2>

    <p>
      Your account does not currently have
      an active Premium membership.
    </p>

    <button
      class="btn primary big"
      style="width:100%"
      onclick="closeModal();goPremium()"
    >
      View Premium Plans
    </button>
  `);
}


/* =========================================
   PREMIUM
========================================= */

function goPremium() {

  const premium =
    document.querySelector("#premium");

  if (premium) {

    premium.scrollIntoView({
      behavior: "smooth"
    });

  }

}


/* =========================================
   SELECT PREMIUM PLAN
========================================= */

async function selectPlan(plan, price) {

  const user =
    await getCurrentUser();


  if (!user) {

    openModal(`
      <h2>${plan}</h2>

      <p>
        Price:
        <strong>${price}</strong>
      </p>

      <p>
        Please create an account or log in
        before continuing.
      </p>

      <button
        class="btn primary big"
        style="width:100%"
        onclick="showSignup()"
      >
        Create Account
      </button>

      <button
        class="btn ghost big"
        style="width:100%;margin-top:10px"
        onclick="showLogin()"
      >
        Login
      </button>
    `);

    return;
  }


  openModal(`
    <h2>${plan}</h2>

    <p>
      Price:
      <strong>${price}</strong>
    </p>

    <p>
      You are logged in as:
      <strong>${user.email}</strong>
    </p>

    <p>
      Payment system will be connected here.
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


/* =========================================
   CHECK LOGGED-IN USER
========================================= */

async function checkUser() {

  const user =
    await getCurrentUser();


  if (!user) {

    console.log(
      "No user logged in."
    );

    return;
  }


  console.log(
    "Logged in:",
    user.email
  );


  const membership =
    await getMembership();


  if (membership) {

    console.log(
      "Premium:",
      membership.plan
    );

  } else {

    console.log(
      "No active Premium membership."
    );

  }

}


/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {

  const { error } =
    await db.auth.signOut();


  if (error) {

    alert(
      "Logout error: " +
      error.message
    );

    return;
  }


  alert(
    "Logged out successfully."
  );

  location.reload();

}


/* =========================================
   START
========================================= */

checkUser();
