const API =  "https://render.com/docs/web-services#port-binding";;

let cart = [];
let wishlist = [];

/* ---------------- LOGIN MODAL ---------------- */

function showLogin() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

/* ---------------- SIGNUP ---------------- */

async function signup() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    try {

        const res = await fetch(`${API}/signup?username=${username}&password=${password}`, {
            method: "POST"
        });

        const data = await res.json();
        alert(data.message || data.detail || "Signup Failed");

    } catch (err) {
        console.log(err);
        alert("Signup Failed");
    }
}

/* ---------------- LOGIN ---------------- */

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    try {

        const res = await fetch(`${API}/login?username=${username}&password=${password}`, {
            method: "POST"
        });

        const data = await res.json();

        if (data.access_token) {

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", username);

            document.querySelector(".login-btn").innerText = username;

            alert("Login Successful");
            closeLogin();

        } else {
            alert(data.detail || "Login Failed");
        }

    } catch (err) {
        console.log(err);
        alert("Server Error");
    }
}

/* ---------------- CART ---------------- */

function addToCart(product, price) {

    cart.push({
        product: product,
        price: Number(price)
    });

    document.getElementById("cartCount").innerText = cart.length;

    updateCart();

    alert(product + " added to cart 🛒");
}

function openCart() {
    document.getElementById("cartModal").style.display = "flex";
}

function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

function updateCart() {

    let html = "";
    let total = 0;

    cart.forEach((item, index) => {

        total += Number(item.price);

        html += `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;border-bottom:1px solid #ddd;padding-bottom:10px;">
            <div>
                <strong>${item.product}</strong><br>
                ₹${item.price}
            </div>

            <button onclick="removeCart(${index})">X</button>
        </div>
        `;
    });

    document.getElementById("cartItems").innerHTML = html;
    document.getElementById("cartTotal").innerText = "Total: ₹" + total;
}

function removeCart(index) {

    cart.splice(index, 1);

    document.getElementById("cartCount").innerText = cart.length;

    updateCart();
}

/* ---------------- CHECKOUT (FIXED 422 + JWT) ---------------- */

async function checkoutCart() {

    if (!cart || cart.length === 0) {
        alert("Cart is Empty");
        return;
    }

    const username = localStorage.getItem("user") || "Guest";
    const token = localStorage.getItem("token");

    // 🔥 CLEAN + SAFE PAYLOAD (FIXES 422)
    const payload = {
        username: String(username),
        items: cart
            .filter(item => item && item.product != null && item.price != null)
            .map(item => ({
                product: String(item.product),
                price: Number(item.price)
            }))
    };

    try {

        const res = await fetch(`${API}/order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        alert(data.message || data.detail || "Checkout Failed");

        if (res.ok) {

            cart = [];
            updateCart();

            document.getElementById("cartCount").innerText = 0;

            closeCart();
        }

    } catch (err) {
        console.log(err);
        alert("Checkout Failed");
    }
}

/* ---------------- SEARCH ---------------- */

const setupSearch = () => {

    const search = document.getElementById("search");

    if (!search) return;

    search.addEventListener("keyup", () => {

        const value = search.value.toLowerCase();

        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {

            const title = card.querySelector("h3").innerText.toLowerCase();

            card.style.display = title.includes(value) ? "block" : "none";
        });
    });
};

/* ---------------- LOAD USER ---------------- */

window.onload = () => {

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
        document.querySelector(".login-btn").innerText = savedUser;
    }

    setupSearch();
};