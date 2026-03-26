// 1. Tilt Effect Logic
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

// 2. Ripple Button Effect
document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        let x = e.clientX - e.target.offsetLeft; 
        let y = e.clientY - e.target.offsetTop;
        let ripples = document.createElement('span'); 
        ripples.style.left = x + 'px'; 
        ripples.style.top = y + 'px'; 
        ripples.classList.add('ripple');
        this.appendChild(ripples); 
        setTimeout(() => { ripples.remove() }, 600);
    });
});

// 3. Order Summary Toggle
const summaryBtn = document.getElementById('toggle-summary-btn');
if (summaryBtn) {
    summaryBtn.addEventListener('click', () => {
        document.getElementById('order-summary').classList.toggle('open'); 
        document.getElementById('summary-icon').classList.toggle('rotate-180');
    });
}

// 4. Timer Logic
document.addEventListener("DOMContentLoaded", () => {
    let timeLeft = 10 * 60; 
    const timerEl = document.getElementById('countdown'); 
    const timerContainer = document.getElementById('timer-container');
    if(timerEl) {
        const countdownInterval = setInterval(() => {
            if(timeLeft <= 0) { clearInterval(countdownInterval); timerEl.innerText = "0:00"; return; }
            timeLeft--;
            if(timeLeft <= 60 && !timerContainer.classList.contains('bg-red-100')) {
                timerContainer.classList.replace('bg-rose-50', 'bg-red-100'); 
                timerContainer.classList.replace('text-rose-600', 'text-red-700'); 
                timerContainer.classList.replace('border-rose-100', 'border-red-300'); 
                timerContainer.classList.add('animate-pulse', 'scale-105');
            }
            let m = Math.floor(timeLeft / 60); 
            let s = timeLeft % 60; 
            timerEl.innerText = `${m}:${s < 10 ? '0'+s : s}`;
        }, 1000);
    }
});

// 5. Price Animation Function
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

// 6. URL Params Parsing & Setup
document.addEventListener("DOMContentLoaded", () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const finalPrice = parseFloat(urlParams.get('amount')) || 1.00;
        const dynamicBrand = urlParams.get('brand') || 'SecurePay';
        const testUpiId = urlParams.get('upi') || "paytm.s1h6t6g@pty";
        const transactionNote = urlParams.get('note') || `Order for ${dynamicBrand}`;
        const orderId = urlParams.get('orderId') || Math.floor(100000000 + Math.random() * 900000000);
        
        // Update UI Texts
        document.getElementById('brand-title').innerText = dynamicBrand;
        document.getElementById('summary-brand').innerText = dynamicBrand;
        document.getElementById('random-ref').innerText = orderId;
        document.getElementById('summary-txn').innerText = "TXN-" + orderId;

        const qrImg = document.getElementById('qr-code-img'); 
        const phonepeLink = document.getElementById('phonepe-link');
        const paytmLink = document.getElementById('paytm-link');
        const priceDisplays = document.querySelectorAll('.final_paid_price');
        const upiTextEl = document.getElementById('upi-text');
        const upiInputEl = document.getElementById('upiID');
        
        // Animate dynamic price
        priceDisplays.forEach(el => { if(el) animateValue(el, 0, finalPrice, 1000); });

        // Set UP Complete Logic (Added for completeness)
        if(upiTextEl) upiTextEl.innerText = testUpiId;
        if(upiInputEl) upiInputEl.value = testUpiId;

        // Generate QR Code if QRious is loaded
        if (window.QRious) {
            const upiString = `upi://pay?pa=${testUpiId}&pn=${encodeURIComponent(dynamicBrand)}&am=${finalPrice}&tn=${encodeURIComponent(transactionNote)}&tr=${orderId}`;
            const qr = new QRious({
                element: document.createElement('canvas'),
                value: upiString,
                size: 250,
                level: 'H'
            });
            if(qrImg) {
                qrImg.src = qr.toDataURL();
            }
        }

        // Setup Direct App Links
        if(phonepeLink) {
            phonepeLink.href = `phonepe://pay?pa=${testUpiId}&pn=${encodeURIComponent(dynamicBrand)}&am=${finalPrice}&tn=${encodeURIComponent(transactionNote)}`;
        }
        if(paytmLink) {
            paytmLink.href = `paytmmp://pay?pa=${testUpiId}&pn=${encodeURIComponent(dynamicBrand)}&am=${finalPrice}&tn=${encodeURIComponent(transactionNote)}`;
        }

    } catch (error) {
        console.error("Error setting up checkout:", error);
    }
});

// 7. Copy UPI Function
window.copyUpi = function(event) {
    const upiId = document.getElementById('upiID').value;
    if(upiId) {
        navigator.clipboard.writeText(upiId).then(() => {
            const btn = event.target;
            const originalText = btn.innerText;
            btn.innerText = "COPIED!";
            btn.classList.add("bg-green-100", "text-green-700");
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove("bg-green-100", "text-green-700");
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
};
