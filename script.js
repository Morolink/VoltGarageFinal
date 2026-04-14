const STORAGE_KEYS = {
  products: "volt-garage-products",
  cart: "volt-garage-cart",
  auth: "volt-garage-auth",
  authSession: "volt-garage-auth-session"
};

const LEGACY_STORAGE_KEYS = {
  products: "voltforgegarage-products",
  cart: "voltforgegarage-cart"
};

const BRAND_NAME = "Volt Garage";

const STARTER_PRODUCTS = [
  {
    id: "starter-motor-1",
    name: "ForgeDrive Trail Motor",
    category: "motors",
    price: 689,
    image: "",
    description: "Mid-drive motor setup for strong, smooth power delivery on daily and weekend builds.",
    stock: 8,
    deliveryDays: "3-5 days",
    rating: 4.9,
    reviewCount: 24,
    reviews: [
      {
        author: "Mason R.",
        rating: 5,
        text: "Clean power delivery and easy to set up."
      },
      {
        author: "Avery L.",
        rating: 5,
        text: "Feels solid on hills and daily rides."
      }
    ]
  },
  {
    id: "starter-battery-1",
    name: "VoltCore 48 Battery Pack",
    category: "batteries",
    price: 429,
    image: "",
    description: "Reliable battery pack designed for steady output, practical range, and clean fitment.",
    stock: 12,
    deliveryDays: "2-4 days",
    rating: 4.8,
    reviewCount: 18,
    reviews: [
      {
        author: "Jordan P.",
        rating: 5,
        text: "Range matched the listing and fit was simple."
      },
      {
        author: "Chris T.",
        rating: 4,
        text: "Charges fast and stays consistent."
      }
    ]
  },
  {
    id: "starter-brake-1",
    name: "ApexStop Brake Kit",
    category: "brakes",
    price: 214,
    image: "",
    description: "Hydraulic brake kit that improves control, stopping confidence, and everyday ride feel.",
    stock: 15,
    deliveryDays: "3-6 days",
    rating: 4.7,
    reviewCount: 16,
    reviews: [
      {
        author: "Sam K.",
        rating: 5,
        text: "Strong bite and much better control."
      },
      {
        author: "Taylor S.",
        rating: 4,
        text: "Delivered quickly and installed cleanly."
      }
    ]
  }
];

const appState = {
  products: []
};

const page = document.body.dataset.page;
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll('.nav-links a, .cart-link[href]');
const revealItems = document.querySelectorAll(".reveal");

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readSessionStorage = (key, fallback) => {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const writeSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const loadProducts = async () => {
  try {
    const response = await fetch("data/products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Products request failed");
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      appState.products = data;
      return data;
    }
  } catch {
    // Fall back to the starter catalog when the JSON file is unavailable.
  }

  appState.products = [...STARTER_PRODUCTS];
  return appState.products;
};

const getProducts = () => (appState.products.length ? appState.products : [...STARTER_PRODUCTS]);
const getCart = () => {
  const saved = readStorage(STORAGE_KEYS.cart, null);
  if (Array.isArray(saved)) {
    return saved;
  }
  const legacySaved = readStorage(LEGACY_STORAGE_KEYS.cart, null);
  if (Array.isArray(legacySaved)) {
    writeStorage(STORAGE_KEYS.cart, legacySaved);
    return legacySaved;
  }
  return [];
};
const saveCart = (cart) => writeStorage(STORAGE_KEYS.cart, cart);
const getAuth = () => {
  const sessionSaved = readSessionStorage(STORAGE_KEYS.authSession, null);
  if (sessionSaved && typeof sessionSaved === "object") {
    return sessionSaved;
  }
  const saved = readStorage(STORAGE_KEYS.auth, null);
  return saved && typeof saved === "object" ? saved : null;
};
const saveAuth = (auth, remember) => {
  if (remember) {
    sessionStorage.removeItem(STORAGE_KEYS.authSession);
    writeStorage(STORAGE_KEYS.auth, auth);
    return;
  }
  localStorage.removeItem(STORAGE_KEYS.auth);
  writeSessionStorage(STORAGE_KEYS.authSession, auth);
};
const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.auth);
  sessionStorage.removeItem(STORAGE_KEYS.authSession);
};

const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createImageStyle = (image) => {
  if (!image) {
    return "";
  }
  return `background-image: url('${String(image).replace(/'/g, "\\'")}');`;
};

const cartCountTargets = document.querySelectorAll("[data-cart-count]");
const authLinks = document.querySelectorAll("[data-auth-link]");
const authStatus = document.querySelector("[data-auth-status]");

const updateCartCount = () => {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCountTargets.forEach((target) => {
    target.textContent = String(count);
  });
};

const updateAuthState = () => {
  const auth = getAuth();
  authLinks.forEach((link) => {
    if (!link) {
      return;
    }
    if (auth) {
      link.textContent = "Logout";
      link.setAttribute("href", "#logout");
      link.dataset.authAction = "logout";
    } else {
      link.textContent = "Login";
      link.setAttribute("href", "login.html");
      link.dataset.authAction = "login";
    }
  });

  if (authStatus) {
    if (auth) {
      authStatus.textContent = `Signed in as ${auth.email}`;
      authStatus.classList.add("is-success");
    } else {
      authStatus.textContent = "Sign in to keep your session on this browser.";
      authStatus.classList.remove("is-success");
    }
  }
};

const setMenuState = (open) => {
  if (!navToggle || !navMenu) {
    return;
  }
  navToggle.classList.toggle("is-active", open);
  navMenu.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
};

if (navToggle) {
  navToggle.addEventListener("click", () => {
    setMenuState(!navMenu.classList.contains("is-open"));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

authLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.dataset.authAction === "logout") {
      event.preventDefault();
      clearAuth();
      updateAuthState();
      setMenuState(false);
      if (window.location.pathname.endsWith("login.html")) {
        window.location.reload();
      }
    }
  });
});

document.addEventListener("click", (event) => {
  if (!navMenu || !navToggle) {
    return;
  }
  const clickedInside = navMenu.contains(event.target) || navToggle.contains(event.target);
  if (!clickedInside && navMenu.classList.contains("is-open")) {
    setMenuState(false);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -24px 0px"
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const addToCart = (productId) => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
};

const getProductById = (id) => getProducts().find((product) => product.id === id);

const renderStorePage = () => {
  const productGrid = document.querySelector("[data-product-grid]");
  const emptyProducts = document.querySelector("[data-empty-products]");
  const filterButtons = document.querySelectorAll(".filter-chip");
  const productSearch = document.querySelector("#product-search");
  let activeFilter = "all";

  const renderProducts = () => {
    const products = getProducts();
    const query = (productSearch?.value || "").trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesFilter = activeFilter === "all" || product.category === activeFilter;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });

    productGrid.innerHTML = filtered
      .map((product) => {
        const name = escapeHtml(product.name);
        const description = escapeHtml(product.description);
        const rating = Number(product.rating || 0).toFixed(1);
        const stockText = Number.isFinite(Number(product.stock)) ? `${product.stock} in stock` : "Stock available";
        const deliveryText = product.deliveryDays ? product.deliveryDays : "Fast delivery";
        return `
          <article class="product-card reveal is-visible" data-view-product="${product.id}">
            <div class="product-image ${product.image ? "has-image" : ""}" style="${createImageStyle(product.image)}"></div>
            <div class="product-body">
              <h3>${name}</h3>
              <p>${description}</p>
              <div class="product-quick-meta">
                <span class="meta-pill">${escapeHtml(stockText)}</span>
                <span class="meta-pill">${escapeHtml(deliveryText)}</span>
                <span class="meta-pill">${rating} rating</span>
              </div>
              <div class="product-meta">
                <strong>${formatPrice(product.price)}</strong>
                <button class="button button-small" type="button" data-view-button="${product.id}">View Product</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    emptyProducts.classList.toggle("is-hidden", filtered.length > 0);

    productGrid.querySelectorAll("[data-view-button]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href = `product.html?id=${encodeURIComponent(button.dataset.viewButton)}`;
      });
    });

    productGrid.querySelectorAll("[data-view-product]").forEach((card) => {
      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${encodeURIComponent(card.dataset.viewProduct)}`;
      });
    });
  };

  filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      activeFilter = button.dataset.filter || "all";
      renderProducts();
    });
  });

  if (productSearch) {
    productSearch.addEventListener("input", renderProducts);
  }

  renderProducts();
};

const renderProductPage = () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const product = productId ? getProductById(productId) : null;
  const category = document.querySelector("[data-detail-category]");
  const name = document.querySelector("[data-detail-name]");
  const description = document.querySelector("[data-detail-description]");
  const price = document.querySelector("[data-detail-price]");
  const image = document.querySelector("[data-detail-image]");
  const addButton = document.querySelector("[data-detail-add]");
  const stock = document.querySelector("[data-detail-stock]");
  const delivery = document.querySelector("[data-detail-delivery]");
  const rating = document.querySelector("[data-detail-rating]");
  const reviews = document.querySelector("[data-detail-reviews]");

  if (!product) {
    category.textContent = "Product";
    return;
  }

  document.title = `${BRAND_NAME} | ${product.name}`;
  category.textContent = product.category;
  name.textContent = product.name;
  description.textContent = product.description;
  price.textContent = formatPrice(product.price);
  image.style.cssText = createImageStyle(product.image);
  image.classList.toggle("has-image", Boolean(product.image));
  addButton.disabled = false;
  addButton.addEventListener("click", () => addToCart(product.id));
  if (stock) {
    stock.textContent = Number.isFinite(Number(product.stock)) ? `${product.stock} in stock` : "Stock available";
  }
  if (delivery) {
    delivery.textContent = product.deliveryDays ? `Delivery in ${product.deliveryDays}` : "Fast delivery";
  }
  if (rating) {
    rating.textContent = `${Number(product.rating || 0).toFixed(1)} rating from ${Number(product.reviewCount || 0)} reviews`;
  }
  if (reviews) {
    const reviewItems = Array.isArray(product.reviews) ? product.reviews : [];
    reviews.innerHTML = reviewItems.length
      ? reviewItems
      .map((review) => {
        const stars = "★".repeat(Math.max(0, Math.min(5, Number(review.rating || 0)))) + "☆".repeat(5 - Math.max(0, Math.min(5, Number(review.rating || 0))));
        return `
          <article class="review-card">
            <div class="review-top">
              <strong>${escapeHtml(review.author)}</strong>
              <span>${stars}</span>
            </div>
            <p>${escapeHtml(review.text)}</p>
          </article>
        `;
      })
      .join("")
      : '<p class="product-review-empty">No reviews yet.</p>';
  }
};

const renderLoginPage = () => {
  const form = document.querySelector("[data-login-form]");
  const message = document.querySelector("[data-auth-status]");
  const signout = document.querySelector("[data-login-signout]");
  const auth = getAuth();

  if (auth && message) {
    message.textContent = `Signed in as ${auth.email}.`;
    message.classList.add("is-success");
  }

  if (signout) {
    signout.hidden = !auth;
    signout.addEventListener("click", () => {
      clearAuth();
      updateAuthState();
      if (message) {
        message.textContent = "Signed out.";
        message.classList.remove("is-success");
      }
      signout.hidden = true;
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "").trim();
      const remember = Boolean(formData.get("remember"));
      if (!email || password.length < 4) {
        if (message) {
          message.textContent = "Enter a valid email and password.";
          message.classList.remove("is-success");
        }
        return;
      }

      saveAuth({ email }, remember);
      updateAuthState();
      if (message) {
        message.textContent = remember
          ? `Signed in as ${email}. This browser will remember you.`
          : `Signed in as ${email}. This session will stay active until you close the browser.`;
        message.classList.add("is-success");
      }
      if (signout) {
        signout.hidden = false;
      }
      form.reset();
    });
  }
};

const renderCheckoutPage = () => {
  const itemsContainer = document.querySelector("[data-checkout-items]");
  const emptyCart = document.querySelector("[data-empty-cart]");
  const summaryItems = document.querySelector("[data-summary-items]");
  const summarySubtotal = document.querySelector("[data-summary-subtotal]");
  const summaryShipping = document.querySelector("[data-summary-shipping]");
  const summaryTotal = document.querySelector("[data-summary-total]");
  const checkoutForm = document.querySelector("[data-checkout-form]");
  const checkoutMessage = document.querySelector("[data-checkout-message]");
  const shipping = 18;

  const renderCheckout = () => {
    const cart = getCart();
    const products = getProducts();
    const detailedItems = cart
      .map((item) => {
        const product = products.find((entry) => entry.id === item.id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean);

    if (!detailedItems.length) {
      itemsContainer.innerHTML = "";
      emptyCart.classList.remove("is-hidden");
      summaryItems.textContent = "0";
      summarySubtotal.textContent = formatPrice(0);
      summaryShipping.textContent = formatPrice(0);
      summaryTotal.textContent = formatPrice(0);
      return;
    }

    emptyCart.classList.add("is-hidden");

    itemsContainer.innerHTML = detailedItems
      .map(({ quantity, product }) => {
        const name = escapeHtml(product.name);
        const description = escapeHtml(product.description);
        return `
          <article class="checkout-item">
            <div class="checkout-item-thumb" style="${createImageStyle(product.image)}"></div>
            <div class="checkout-item-copy">
              <h4>${name}</h4>
              <p>${description}</p>
              <div class="checkout-qty">
                <button class="qty-button" type="button" data-qty-change="${product.id}" data-direction="-1">-</button>
                <span class="qty-value">${quantity}</span>
                <button class="qty-button" type="button" data-qty-change="${product.id}" data-direction="1">+</button>
              </div>
            </div>
            <div class="checkout-item-side">
              <strong class="checkout-item-price">${formatPrice(product.price * quantity)}</strong>
              <div class="checkout-item-actions">
                <button class="button button-small button-danger" type="button" data-remove-cart="${product.id}">Remove</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    itemsContainer.querySelectorAll("[data-qty-change]").forEach((button) => {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.direction);
        const updatedCart = getCart()
          .map((item) =>
            item.id === button.dataset.qtyChange
              ? { ...item, quantity: Math.max(0, item.quantity + direction) }
              : item
          )
          .filter((item) => item.quantity > 0);
        saveCart(updatedCart);
        updateCartCount();
        renderCheckout();
      });
    });

    itemsContainer.querySelectorAll("[data-remove-cart]").forEach((button) => {
      button.addEventListener("click", () => {
        const updatedCart = getCart().filter((item) => item.id !== button.dataset.removeCart);
        saveCart(updatedCart);
        updateCartCount();
        renderCheckout();
      });
    });

    const itemCount = detailedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = detailedItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    summaryItems.textContent = String(itemCount);
    summarySubtotal.textContent = formatPrice(subtotal);
    summaryShipping.textContent = formatPrice(shipping);
    summaryTotal.textContent = formatPrice(subtotal + shipping);
  };

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      checkoutMessage.textContent = "Add products to the cart before placing an order.";
      checkoutMessage.classList.remove("is-success");
      return;
    }

    saveCart([]);
    updateCartCount();
    renderCheckout();
    checkoutForm.reset();
    checkoutMessage.textContent = "Order placed successfully.";
    checkoutMessage.classList.add("is-success");
  });

  renderCheckout();
};

const initApp = async () => {
  await loadProducts();
  updateCartCount();
  updateAuthState();

  if (page === "shop") {
    renderStorePage();
  }

  if (page === "checkout") {
    renderCheckoutPage();
  }

  if (page === "product") {
    renderProductPage();
  }

if (page === "login") {
  renderLoginPage();
}
};

initApp();
