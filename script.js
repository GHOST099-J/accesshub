/* =========================================
   ACCESSHUB — SUPABASE + AUTH + MEMBERSHIP
========================================= */

const SUPABASE_URL =
  "https://awtpelvnmpalmynouttg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_gQmC9w3gZOpXys79isx6Xg_d66H8Lp_";


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
  if (!modal || !content) {
    console.error("Modal elements not found.");
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

    const { error } =
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
        You can now log in to your account.
      </p>

      <button
        class="btn primary big"
        style="width:100%"
        onclick="showLogin()"
      >
        Continue to Login
      </button>

    `);


  } catch (error) {

    message.textContent =
      "Something went wrong: " +
      error.message;

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
        "Login error: " +
        error.message;

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
      "Something went wrong: " +
      error.message;

  }

}


/* =========================================
   GET CURRENT USER
========================================= */

async function getCurrentUser() {

  try {

    const {
      data: { user },
      error
    } = await db.auth.getUser();


    if (error) {

      console.error(
        "User error:",
        error
      );

      return null;
    }


    return user;

  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    return null;
  }

}


/* =========================================
   CHECK PREMIUM MEMBERSHIP
========================================= */

async function getMembership() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  try {

    const { data, error } =
      await db
        .from("memberships")
        .select(
          "id, plan, status, expires_at"
        )
        .eq("user_id", user.id)
        .eq("status", "active")
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


    /* 3-Month Premium */

    if (data.expires_at) {

      const expiry =
        new Date(data.expires_at);

      const now =
        new Date();


      if (expiry > now) {
        return data;
      }

      return null;
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
   CHECK IF USER IS PREMIUM
========================================= */

async function isPremium() {

  const membership =
    await getMembership();

  return membership !== null;
}


/* =========================================
   LOCKED / PREMIUM CONTENT
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
        Your account can access Premium content.
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


  /* CHECK LOGIN */

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


  /* LOGGED IN WITHOUT PREMIUM */

  openModal(`

    <h2>🔒 Premium Content</h2>

    <p>
      Your account does not have an active
      Premium membership.
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
   GO TO PREMIUM
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
        Please log in or create an account
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
      Logged in as:
      <strong>${user.email}</strong>
    </p>

    <p>
      Payment will be connected here.
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
   CHECK USER
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
   START
========================================= */

checkUser();
