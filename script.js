 /* =========================================
   ACCESSHUB
   SUPABASE + AUTH + MEMBERSHIP
========================================= */


/* =========================================
   SUPABASE CONFIG
========================================= */

const SUPABASE_URL =
  "https://awtpelvnmpalmynouttg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_gQmC9w3gZOpXys79isx6Xg_d66H8Lp_";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================
   MODAL
========================================= */

const modal =
  document.getElementById("modal");

const content =
  document.getElementById("modalContent");


function openModal(html) {

  if (!modal || !content) {
    console.error(
      "AccessHub: modal elements not found."
    );
    return;
  }

  content.innerHTML = html;
  modal.style.display = "flex";
}


function closeModal() {

  if (modal) {
    modal.style.display = "none";
  }

}


if (modal) {

  modal.addEventListener(
    "click",
    function (event) {

      if (event.target === modal) {
        closeModal();
      }

    }
  );

}


/* =========================================
   LOGIN FORM
========================================= */

function showLogin() {

  openModal(`

    <h2>Welcome back 👋</h2>

    <p>
      Log in to your AccessHub account.
    </p>

    <input
      id="loginEmail"
      type="email"
      placeholder="Email"
      autocomplete="email"
    >

    <input
      id="loginPassword"
      type="password"
      placeholder="Password"
      autocomplete="current-password"
    >

    <button
      type="button"
      class="btn primary big"
      style="width:100%;margin-top:10px"
      onclick="loginUser()"
    >
      Login
    </button>

    <p
      id="loginMessage"
      style="text-align:center;color:#8f9aae"
    ></p>

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

    <p>
      Join AccessHub today.
    </p>

    <input
      id="signupName"
      type="text"
      placeholder="Full name"
      autocomplete="name"
    >

    <input
      id="signupEmail"
      type="email"
      placeholder="Email"
      autocomplete="email"
    >

    <input
      id="signupPassword"
      type="password"
      placeholder="Create password"
      autocomplete="new-password"
    >

    <button
      type="button"
      class="btn primary big"
      style="width:100%;margin-top:10px"
      onclick="signupUser()"
    >
      Create Account
    </button>

    <p
      id="signupMessage"
      style="text-align:center;color:#8f9aae"
    ></p>

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
   SIGN UP
========================================= */

async function signupUser() {

  const nameElement =
    document.getElementById("signupName");

  const emailElement =
    document.getElementById("signupEmail");

  const passwordElement =
    document.getElementById("signupPassword");

  const message =
    document.getElementById("signupMessage");


  if (
    !nameElement ||
    !emailElement ||
    !passwordElement ||
    !message
  ) {
    return;
  }


  const name =
    nameElement.value.trim();

  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


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
        "Signup error: " +
        error.message;

      return;
    }


    if (
      data &&
      data.user &&
      !data.session
    ) {

      openModal(`

        <h2>Account created! 🎉</h2>

        <p>
          Your account has been created.
        </p>

        <p>
          Please check your email and click
          the confirmation link.
        </p>

        <button
          type="button"
          class="btn primary big"
          style="width:100%"
          onclick="showLogin()"
        >
          Continue to Login
        </button>

      `);

      return;
    }


    openModal(`

      <h2>Account created! 🎉</h2>

      <p>
        Your account has been created successfully.
      </p>

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="showLogin()"
      >
        Continue to Login
      </button>

    `);


  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    message.textContent =
      "Something went wrong: " +
      error.message;

  }

}


/* =========================================
   LOGIN
========================================= */

async function loginUser() {

  const emailElement =
    document.getElementById("loginEmail");

  const passwordElement =
    document.getElementById("loginPassword");

  const message =
    document.getElementById("loginMessage");


  if (
    !emailElement ||
    !passwordElement ||
    !message
  ) {
    return;
  }


  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }


  message.textContent =
    "Logging in...";


  try {

    const { data, error } =
      await db.auth.signInWithPassword({

        email: email,
        password: password

      });


    if (error) {

      message.textContent =
        "Login error: " +
        error.message;

      return;
    }


    console.log(
      "Login successful:",
      data.user?.email
    );


    message.textContent =
      "Login successful! ✅";


    setTimeout(
      function () {

        closeModal();
        checkUser();

      },
      700
    );


  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    message.textContent =
      "Something went wrong: " +
      error.message;

  }

}


/* =========================================
   CURRENT USER
========================================= */

async function getCurrentUser() {

  try {

    const {
      data,
      error
    } = await db.auth.getUser();


    if (error) {

      console.error(
        "User error:",
        error
      );

      return null;
    }


    return data?.user || null;

  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    return null;

  }

}


/* =========================================
   MEMBERSHIP
========================================= */

async function getMembership() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  try {

    const {
      data,
      error
    } = await db
      .from("memberships")
      .select(
        "id,user_id,plan,status,started_at,expires_at"
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();


    if (error) {

      console.error(
        "Membership error:",
        error
      );

      return null;
    }


    if (!data) {
      return null;
    }


    /* Permanent Premium */

    if (
      data.plan === "permanent" ||
      data.plan === "Permanent Premium"
    ) {

      return data;

    }


    /* Time-limited Premium */

    if (data.expires_at) {

      const expiry =
        new Date(data.expires_at);

      if (
        !Number.isNaN(
          expiry.getTime()
        ) &&
        expiry > new Date()
      ) {

        return data;

      }

    }


    return null;

  } catch (error) {

    console.error(
      "Membership check error:",
      error
    );

    return null;

  }

}


/* =========================================
   IS PREMIUM
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

  const user =
    await getCurrentUser();


  if (!user) {

    openModal(`

      <h2>🔒 Premium Content</h2>

      <p>
        Please log in or create an account
        to continue.
      </p>

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="showLogin()"
      >
        Login
      </button>

      <button
        type="button"
        class="btn ghost big"
        style="width:100%;margin-top:10px"
        onclick="showSignup()"
      >
        Create Account
      </button>

    `);

    return;
  }


  const membership =
    await getMembership();


  if (membership) {

    openModal(`

      <h2>🔓 Premium Access</h2>

      <p>
        Your Premium membership is active.
      </p>

      <p>
        Plan:
        <strong>
          ${escapeHtml(membership.plan)}
        </strong>
      </p>

      ${
        membership.expires_at
          ? `
            <p>
              Expires:
              <strong>
                ${formatDate(
                  membership.expires_at
                )}
              </strong>
            </p>
          `
          : `
            <p>
              Permanent access.
            </p>
          `
      }

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="closeModal()"
      >
        Continue
      </button>

    `);

    return;
  }


  openModal(`

    <h2>🔒 Premium Content</h2>

    <p>
      Your account does not have an active
      Premium membership.
    </p>

    <button
      type="button"
      class="btn primary big"
      style="width:100%"
      onclick="closeModal();goPremium()"
    >
      View Premium Plans
    </button>

  `);

}


/* =========================================
   GO PREMIUM
========================================= */

function goPremium() {

  const premium =
    document.getElementById("premium");


  if (premium) {

    premium.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


/* =========================================
   SELECT PLAN
========================================= */

async function selectPlan(
  plan,
  price
) {

  const user =
    await getCurrentUser();


  if (!user) {

    openModal(`

      <h2>${escapeHtml(plan)}</h2>

      <p>
        Price:
        <strong>
          ${escapeHtml(price)}
        </strong>
      </p>

      <p>
        Please log in or create an account
        before continuing.
      </p>

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="showLogin()"
      >
        Login
      </button>

      <button
        type="button"
        class="btn ghost big"
        style="width:100%;margin-top:10px"
        onclick="showSignup()"
      >
        Create Account
      </button>

    `);

    return;
  }


  const membership =
    await getMembership();


  if (membership) {

    openModal(`

      <h2>🔓 Premium Already Active</h2>

      <p>
        Your Premium membership is active.
      </p>

      <p>
        Plan:
        <strong>
          ${escapeHtml(membership.plan)}
        </strong>
      </p>

      ${
        membership.expires_at
          ? `
            <p>
              Expires:
              <strong>
                ${formatDate(
                  membership.expires_at
                )}
              </strong>
            </p>
          `
          : `
            <p>
              Permanent access.
            </p>
          `
      }

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="closeModal()"
      >
        Continue
      </button>

    `);

    return;
  }


  openModal(`

    <h2>${escapeHtml(plan)}</h2>

    <p>
      Price:
      <strong>
        ${escapeHtml(price)}
      </strong>
    </p>

    <p>
      Logged in as:
      <strong>
        ${escapeHtml(user.email)}
      </strong>
    </p>

    <p>
      💳 Payment gateway is not connected yet.
    </p>

    <button
      type="button"
      class="btn primary big"
      style="width:100%"
      onclick="closeModal()"
    >
      Close
    </button>

  `);

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(value) {

  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }


  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;

}


/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {

  try {

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

  } catch (error) {

    alert(
      "Logout error: " +
      error.message
    );

  }

}


/* =========================================
   CHECK USER
========================================= */

async function checkUser() {

  const user =
    await getCurrentUser();


  if (!user) {

    console.log(
      "AccessHub: No user logged in."
    );

    return;

  }


  console.log(
    "AccessHub: Logged in as",
    user.email
  );


  const membership =
    await getMembership();


  if (membership) {

    console.log(
      "AccessHub: Premium active:",
      membership.plan
    );

  } else {

    console.log(
      "AccessHub: No active Premium."
    );

  }

}


/* =========================================
   MAKE FUNCTIONS AVAILABLE TO HTML
========================================= */

window.showLogin =
  showLogin;

window.showSignup =
  showSignup;

window.loginUser =
  loginUser;

window.signupUser =
  signupUser;

window.logoutUser =
  logoutUser;

window.locked =
  locked;

window.goPremium =
  goPremium;

window.selectPlan =
  selectPlan;

window.closeModal =
  closeModal;

window.checkUser =
  checkUser;

window.isPremium =
  isPremium;


/* =========================================
   SCRIPT TEST
========================================= */

console.log(
  "✅ AccessHub script loaded successfully"
);


/* =========================================
   OPEN PREMIUM PDF
========================================= */

async function openPremiumPDF() {

  const user = await getCurrentUser();

  if (!user) {
    showLogin();
    return;
  }

  const membership = await getMembership();

  if (!membership) {

    openModal(`
      <h2>🔒 Premium Content</h2>

      <p>
        You need an active Premium membership
        to access this PDF.
      </p>

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="closeModal();goPremium()"
      >
        View Premium Plans
      </button>
    `);

    return;
  }

  const { data, error } =
    await db.storage
      .from("premium-content")
      .createSignedUrl(
        "The-Gift-of-Power.pdf",
        300
      );

  if (error) {

    console.error("PDF access error:", error);

    openModal(`
      <h2>⚠️ Unable to open PDF</h2>

      <p>${escapeHtml(error.message)}</p>

      <button
        type="button"
        class="btn primary big"
        style="width:100%"
        onclick="closeModal()"
      >
        Close
      </button>
    `);

    return;
  }

  window.open(data.signedUrl, "_blank");
}

/* =========================================
   START ACCESSHUB
========================================= */

checkUser();


/* =========================================
   MAKE FUNCTIONS AVAILABLE TO HTML
========================================= */

window.openPremiumPDF = openPremiumPDF;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.loginUser = loginUser;
window.signupUser = signupUser;
window.logoutUser = logoutUser;
window.locked = locked;
window.goPremium = goPremium;
window.selectPlan = selectPlan;
window.closeModal = closeModal;
window.checkUser = checkUser;
window.isPremium = isPremium;

console.log("✅ AccessHub loaded");

checkUser();
