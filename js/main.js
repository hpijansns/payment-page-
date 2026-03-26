/**
 * 1. 3D TILT EFFECT & RIPPLE ANIMATIONS
 */
const card = document.getElementById('tilt-card');
if (card) {
    card.addEventListener('mousemove', (e) => {
        if(window.innerWidth > 768) {
            let xAxis = (window.innerWidth / 2 - e.pageX) / 40; 
            let yAxis = (window.innerHeight / 2 - e.pageY) / 40;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });
    card.addEventListener('mouseleave', () => card.style.transform = `rotateY(0deg) rotateX(0deg)`);
}

document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left; 
        let y = e.clientY - rect.top;
        let ripples = document.createElement('span'); 
        ripples.style.left = x + 'px'; 
        ripples.style.top = y + 'px'; 
        ripples.classList.add('ripple');
        this.appendChild(ripples); 
        setTimeout(() => ripples.remove(), 600);
    });
});

/**
 * 2. COUNTDOWN TIMER LOGIC
 */
function startTimer(durationInSeconds) {
    let timeLeft = durationInSeconds;
    const timerEl = document.getElementById('countdown');
    const timerContainer = document.getElementById('timer-container');
    if(!timerEl) return;
    
    const countdownInterval = setInterval(() => {
        if(timeLeft <= 0) {
            clearInterval(countdownInterval);
            timerEl.innerText = "0:00";
            return;
        }
        timeLeft--;
        
        if(timeLeft <= 60 && !timerContainer.classList.contains('bg-red-100')) {
            timerContainer.classList.remove('bg-rose-50', 'text-rose-600', 'border-rose-100');
            timerContainer.classList.add('bg-red-100', 'text-red-700', 'border-red-300', 'animate-pulse', 'scale-105');
        }
        
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerEl.innerText = `${m}:${s < 10 ? '0'+s : s}`;
    }, 1000);
}

/**
 * 3. PRICE ANIMATION
 */
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let currentVal = (progress * (end - start) + start).toFixed(2);
        obj.innerHTML = '₹' + currentVal;
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

/**
 * 4. COPY UPI ID LOGIC
 */
window.copyUpi = function(e) {
    e.preventDefault();
    const upiToCopy = document.getElementById('upiID').value;
    if(!upiToCopy) return;

    navigator.clipboard.writeText(upiToCopy).then(() => {
        const btn = e.currentTarget;
        const originalText = btn.innerText;
        btn.innerText = "COPIED!";
        btn.classList.add("!text-green-600", "dark:!text-green-400");
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove("!text-green-600", "dark:!text-green-400");
        }, 2000);
    }).catch(err => console.error("Clipboard copy failed", err));
};

/**
 * 5. BACKEND API SYNC
 */
function saveTransactionToDB(orderId, amount, brand, upi_id) {
    // Modify this endpoint according to your Node.js or PHP backend route
    const API_URL = "/api/save_txn"; 
    
    fetch(API_URL, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            order_id: orderId, 
            amount: amount, 
            brand: brand, 
            upi_id: upi_id, 
            status: "initiated" 
        })
    }).catch(err => console.warn("Backend logging failed/Not connected yet:", err));
}

/**
 * 6. MAIN CHECKOUT LOGIC (URL Params, QR, Deep Links)
 */
document.addEventListener("DOMContentLoaded", () => {
    try {
        startTimer(10 * 60); // 10 minutes

        // Setup URL Parameters
        const urlParams = new URLSearchParams(window.location.search);
        const finalPrice = parseFloat(urlParams.get('amount')) || 1.00;
        const dynamicBrand = urlParams.get('brand') || 'SecurePay';
        const testUpiId = urlParams.get('upi') || "paytm.s1h6t6g@pty";
        const transactionNote = urlParams.get('note') || `Order for ${dynamicBrand}`;
        const orderId = urlParams.get('orderId') || Math.floor(100000000 + Math.random() * 900000000);

        // Update UI Texts
        if(document.getElementById('brand-title')) document.getElementById('brand-title').innerText = dynamicBrand;
        if(document.getElementById('summary-brand')) document.getElementById('summary-brand').innerText = dynamicBrand;
        if(document.getElementById('random-ref')) document.getElementById('random-ref').innerText = orderId;
        if(document.getElementById('summary-txn')) document.getElementById('summary-txn').innerText = "TXN-" + orderId;
        
        const upiTextEl = document.getElementById('upi-text');
        const upiInputEl = document.getElementById('upiID');
        if(upiTextEl) upiTextEl.innerText = testUpiId;
        if(upiInputEl) upiInputEl.value = testUpiId;

        // Animate price
        document.querySelectorAll('.final_paid_price').forEach(el => animateValue(el, 0, finalPrice, 1000));

        // Generate Universal UPI Intent String
        const upiString = `upi://pay?pa=${testUpiId}&pn=${encodeURIComponent(dynamicBrand)}&tr=${orderId}&tn=${encodeURIComponent(transactionNote)}&am=${finalPrice}&cu=INR`;

        // QRious BUG-FREE RENDERER TO <img>
        const qrImg = document.getElementById('qr-code-img'); 
        if(qrImg && typeof QRious !== 'undefined') {
            const qr = new QRious({
                value: upiString,
                size: 300,
                level: 'H'
            });
            qrImg.src = qr.toDataURL('image/png'); 
        }

        // PHONEPE BASE64 LOGIC (With Unicode Safety Fix)
        const phonepeLink = document.getElementById('phonepe-link');
        if(phonepeLink) {
            const phonePePayload = {
                pa: testUpiId,
                pn: dynamicBrand,
                am: String(finalPrice), 
                tr: String(orderId),
                tn: transactionNote,
                cu: "INR"
            };
            
            try {
                const jsonPayload = JSON.stringify(phonePePayload);
                // Safe btoa conversion to prevent DOMException with Indian characters
                const safeBase64 = btoa(unescape(encodeURIComponent(jsonPayload)));
                phonepeLink.href = `phonepe://pay?p2pPaymentCheckoutParams=${safeBase64}`;
            } catch (e) {
                console.error("PhonePe Encoding Failed. Falling back to safe URI", e);
                phonepeLink.href = upiString.replace("upi://", "phonepe://");
            }
        }

        // PAYTM DEEP LINK LOGIC
        const paytmLink = document.getElementById('paytm-link');
        if(paytmLink) {
            paytmLink.href = upiString.replace("upi://", "paytmmp://");
        }

        // Background Database Logging
        saveTransactionToDB(orderId, finalPrice, dynamicBrand, testUpiId);

    } catch (error) {
        console.error("Checkout System Error:", error);
    }
});
