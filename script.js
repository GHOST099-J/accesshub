// ==========================================
// ACCESSHUB - script.js
// Supabase + Razorpay Checkout
// ==========================================

// ---------- SUPABASE CONFIG ----------

const SUPABASE_URL =
  "https://awtpelvnmpalmynouttg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_gQmC9w3gZOpXys79isx6Xg_d66H8Lp_";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ---------- RAZORPAY CONFIG ----------

// TEST MODE KEY ID ONLY
// Never put Razorpay Secret Key here.
const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_TEST_KEY_ID";

// Your Supabase Edge Function URL
// Replace YOUR_PROJECT_REF with your Supabase project reference.
const PAYMENT_FUNCTION_URL =
  `${SUPABASE_URL}/functions/v1/create-razorpay-order`;


// ---------- MODAL ----------

function openModal(content) {
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent) return;

  modalContent.innerHTML = content;
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("modal");

  if (!modal) return;

  modal.classList.remove("show");
}


// Close modal when clicking outside
document.addEventListener("click", function (event) {
  const modal = document.getElementById("modal");

  if (event.target === modal) {
    closeModal();
  }
});


// ---------- LOGIN ----------

async function login() {
  const email = prompt("Enter your email:");

  if (!email) return;

  const password = prompt("Enter your password:");

  if (!password) return;

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  alert("Login successful! 🎉");

  await checkUser();
}


// ---------- SIGN UP ----------

async function signup() {
  const email = prompt("Enter your email:");

  if (!email) return;

  const password = prompt(
    "Create a password (minimum 6 characters):"
  );

  if (!password) return;

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const { error } = await db.auth.signUp({
    email,
    password
  });

  if (error) {
    alert("Signup failed: " + error.message);
    return;
  }

  alert(
    "Account created successfully! 🎉\n\n" +
    "If email confirmation is enabled, check your email."
  );
}


// ---------- CURRENT USER ----------

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


// ---------- MEMBERSHIP ----------

async function getMembership() {
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await db
    .from("memberships")
    .select(
      "id,user_id,plan,status,started_at,expires_at"
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Membership error:", error);
    return null;
  }

  return data;
}


// ---------- PREMIUM CHECK ----------

async function isPremium() {
  const membership = await getMembership();

  if (!membership) {
    return false;
  }

  // Permanent membership
  if (
    membership.plan === "permanent" ||
    membership.plan === "Permanent Premium"
  ) {
    return true;
  }

  // Time-limited membership
  if (membership.expires_at) {
    return new Date(membership.expires_at) > new Date();
  }

  return false;
}


// ---------- LOCKED CONTENT ----------

function locked() {
  openModal(`
    <div class="premium-lock">
      <h2>🔒 Premium Content</h2>
      <p>
        This content is available only to Premium members.
      </p>

      <button
        class="btn primary big"
        onclick="closeModal(); goPremium();"
      >
        ⭐ Get Premium
      </button>
    </div>
  `);
}


// ---------- GO PREMIUM ----------

function goPremium() {
  const premiumSection =
    document.getElementById("premium");

  if (premiumSection) {
    premiumSection.scrollIntoView({
      behavior: "smooth"
    });
  }
}


// ==========================================
// RAZORPAY PAYMENT
// ==========================================

async function selectPlan(plan, price) {

  // Check login
  const user = await getCurrentUser();

  if (!user) {
    openModal(`
      <h2>🔐 Login Required</h2>

      <p>
        Please login or create an account before
        purchasing Premium.
      </p>

      <button
        class="btn primary"
        onclick="closeModal(); login();"
      >
        Login
      </button>

      <button
        class="btn green"
        onclick="closeModal(); signup();"
      >
        Sign Up
      </button>
    `);

    return;
  }


  // Check existing membership
  const premium = await isPremium();

  if (premium) {
    openModal(`
      <h2>⭐ Premium Already Active</h2>

      <p>
        Your Premium membership is already active.
      </p>
    `);

    return;
  }


  // Check Razorpay SDK
  if (typeof Razorpay === "undefined") {
    alert(
      "Razorpay Checkout could not be loaded. " +
      "Please refresh the page."
    );

    return;
  }


  // Convert price to paise
  let amount;

  if (price === "₹99") {
    amount = 9900;
  }
  else if (price === "₹499") {
    amount = 49900;
  }
  else {
    alert("Invalid plan selected.");
    return;
  }


  openModal(`
    <h2>💳 Preparing Payment...</h2>
    <p>Please wait.</p>
  `);


  try {

    // Get Supabase session
    const {
      data: { session },
      error: sessionError
    } = await db.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Your login session has expired.");
    }


    // Ask backend to create Razorpay order
    const response = await fetch(
      PAYMENT_FUNCTION_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${session.access_token}`
        },

        body: JSON.stringify({
          plan: plan,
          amount: amount
        })
      }
    );


    const result = await response.json();


    if (!response.ok) {
      throw new Error(
        result.error ||
        "Could not create payment order."
      );
    }


    if (!result.order_id) {
      throw new Error(
        "Payment order was not created."
      );
    }


    closeModal();


    // ---------- RAZORPAY OPTIONS ----------

    const options = {

      key: RAZORPAY_KEY_ID,

      amount: amount,

      currency: "INR",

      name: "AccessHub",

      description: plan,

      order_id: result.order_id,


      prefill: {
        email: user.email || ""
      },


      theme: {
        color: "#2563eb"
      },


      handler: async function (paymentResponse) {

        await verifyPayment(
          paymentResponse,
          plan
        );

      },


      modal: {

        ondismiss: function () {

          console.log(
            "Razorpay checkout closed."
          );

        }

      }

    };


    const razorpay =
      new Razorpay(options);


    razorpay.on(
      "payment.failed",
      function (response) {

        console.error(
          "Payment failed:",
          response
        );

        openModal(`
          <h2>❌ Payment Failed</h2>

          <p>
            The payment could not be completed.
          </p>

          <button
            class="btn primary"
            onclick="closeModal()"
          >
            Close
          </button>
        `);

      }
    );


    razorpay.open();


  } catch (error) {

    console.error(
      "Payment error:",
      error
    );

    openModal(`
      <h2>⚠️ Payment Error</h2>

      <p>
        ${escapeHtml(error.message)}
      </p>

      <button
        class="btn primary"
        onclick="closeModal()"
      >
        Close
      </button>
    `);

  }
}


// ==========================================
// VERIFY PAYMENT
// ==========================================

async function verifyPayment(
  paymentResponse,
  plan
) {

  openModal(`
    <h2>🔄 Verifying Payment...</h2>

    <p>
      Please wait while we confirm your payment.
    </p>
  `);


  try {

    const {
      data: { session },
      error: sessionError
    } = await db.auth.getSession();


    if (sessionError || !session) {
      throw new Error(
        "Your login session has expired."
      );
    }


    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "Authorization":
            `Bearer ${session.access_token}`
        },

        body: JSON.stringify({

          razorpay_order_id:
            paymentResponse.razorpay_order_id,

          razorpay_payment_id:
            paymentResponse.razorpay_payment_id,

          razorpay_signature:
            paymentResponse.razorpay_signature,

          plan: plan

        })
      }
    );


    const result = await response.json();


    if (!response.ok) {

      throw new Error(
        result.error ||
        "Payment verification failed."
      );

    }


    openModal(`
      <h2>🎉 Payment Successful!</h2>

      <p>
        Your Premium membership has been activated.
      </p>

      <button
        class="btn green"
        onclick="closeModal(); checkUser();"
      >
        Continue
      </button>
    `);


    // Refresh Premium library
    await loadPremiumFiles();


  } catch (error) {

    console.error(
      "Verification error:",
      error
    );


    openModal(`
      <h2>⚠️ Verification Failed</h2>

      <p>
        We couldn't confirm the payment yet.
      </p>

      <p>
        Please don't pay again immediately.
      </p>

      <button
        class="btn primary"
        onclick="closeModal()"
      >
        Close
      </button>
    `);

  }
}


// ==========================================
// PREMIUM FILES
// ==========================================

async function loadPremiumFiles() {

  const container =
    document.getElementById("premiumFiles");

  if (!container) return;


  container.innerHTML =
    "<p>Loading Premium files...</p>";


  const { data, error } =
    await db.storage
      .from("premium-content")
      .list("", {
        limit: 100,
        sortBy: {
          column: "name",
          order: "asc"
        }
      });


  if (error) {

    console.error(
      "Storage error:",
      error
    );

    container.innerHTML =
      "<p>Unable to load Premium files.</p>";

    return;
  }


  const files = (data || []).filter(
    file =>
      file.name &&
      file.name.toLowerCase().endsWith(".pdf")
  );


  if (files.length === 0) {

    container.innerHTML =
      "<p>No Premium files available.</p>";

    return;
  }


  container.innerHTML = files.map(
    file => `

      <div class="premium-file">

        <h3>
          📄 ${escapeHtml(file.name)}
        </h3>

        <button
          class="btn primary"
          onclick="openPremiumFile('${escapeJs(file.name)}')"
        >
          🔓 Open PDF
        </button>

      </div>

    `
  ).join("");
}


// ==========================================
// OPEN PREMIUM PDF
// ==========================================

async function openPremiumFile(fileName) {

  const user = await getCurrentUser();

  if (!user) {

    alert(
      "Please login first."
    );

    return;
  }


  const premium =
    await isPremium();


  if (!premium) {

    locked();

    return;
  }


  try {

    const { data, error } =
      await db.storage
        .from("premium-content")
        .createSignedUrl(
          fileName,
          300
        );


    if (error) {

      console.error(
        "Signed URL error:",
        error
      );

      alert(
        "Unable to open this file."
      );

      return;
    }


    if (!data || !data.signedUrl) {

      alert(
        "File URL could not be generated."
      );

      return;
    }


    window.open(
      data.signedUrl,
      "_blank"
    );


  } catch (error) {

    console.error(
      "PDF error:",
      error
    );

    alert(
      "Something went wrong."
    );

  }
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

  if (!dateString) {
    return "—";
  }


  const date =
    new Date(dateString);


  if (isNaN(date.getTime())) {
    return "—";
  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// Escape JavaScript string
function escapeJs(value) {

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

  const { error } =
    await db.auth.signOut();


  if (error) {

    alert(
      "Logout failed: " +
      error.message
    );

    return;
  }


  alert(
    "Logged out successfully."
  );


  await checkUser();

}


// ==========================================
// UPDATE USER UI
// ==========================================

async function checkUser() {

  const user =
    await getCurrentUser();


  const loginButton =
    document.getElementById("loginBtn");

  const signupButton =
    document.getElementById("signupBtn");

  const logoutButton =
    document.getElementById("logoutBtn");

  const userInfo =
    document.getElementById("userInfo");


  if (user) {

    if (loginButton)
      loginButton.style.display = "none";

    if (signupButton)
      signupButton.style.display = "none";

    if (logoutButton)
      logoutButton.style.display = "inline-block";


    if (userInfo) {

      const premium =
        await isPremium();

      const membership =
        await getMembership();


      userInfo.innerHTML = `

        <strong>
          👤 ${escapeHtml(user.email)}
        </strong>

        <br>

        ${
          premium
            ? "⭐ Premium Active"
            : "🔒 Free Account"
        }

        ${
          membership?.expires_at
            ? `<br>Expires:
               ${formatDate(
                 membership.expires_at
               )}`
            : ""
        }

      `;

    }

  } else {

    if (loginButton)
      loginButton.style.display = "inline-block";

    if (signupButton)
      signupButton.style.display = "inline-block";

    if (logoutButton)
      logoutButton.style.display = "none";


    if (userInfo) {
      userInfo.innerHTML =
        "👤 Not logged in";
    }

  }

}


// ==========================================
// AUTH STATE LISTENER
// ==========================================

db.auth.onAuthStateChange(
  async function () {

    await checkUser();

  }
);


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.openModal =
  openModal;

window.closeModal =
  closeModal;

window.login =
  login;

window.signup =
  signup;

window.logout =
  logout;

window.selectPlan =
  selectPlan;

window.goPremium =
  goPremium;

window.locked =
  locked;

window.openPremiumFile =
  openPremiumFile;

window.loadPremiumFiles =
  loadPremiumFiles;

window.checkUser =
  checkUser;


// ==========================================
// INITIAL LOAD
// ==========================================

checkUser();
loadPremiumFiles();
