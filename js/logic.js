// Function for Price Animation
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = '₹' + (progress * (end - start) + start).toFixed(2);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Accordion Summary Logic
    const toggleBtn = document.getElementById('toggle-summary');
    if(toggleBtn){
        toggleBtn.addEventListener('click', () => {
            document.getElementById('order-summary').classList.toggle('open');
            document.getElementById('summary-icon').classList.toggle('rotate-180');
        });
    }

    // 2. Card 3D Tilt Logic
    const card = document.getElementById('tilt-card');
    if(card){
        card.addEventListener('mousemove', (e) => {
            if(window.innerWidth > 768) {
                let xAxis = (window.innerWidth / 2 - e.pageX) / 40; let yAxis = (window.innerHeight / 2 - e.pageY) / 40;
                card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            }
        });
        card.addEventListener('mouseleave', () => card.style.transform = `rotateY(0deg) rotateX(0deg)`);
    }

    // 3. Button Ripple Effect
    document.querySelectorAll('.ripple-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            let x = e.clientX - e.target.offsetLeft; let y = e.clientY - e.target.offsetTop;
            let ripples = document.createElement('span'); ripples.style.left = x + 'px'; ripples.style.top = y + 'px'; ripples.classList.add('ripple');
            this.appendChild(ripples); setTimeout(() => { ripples.remove() }, 600);
        });
    });

    // 4. Timer Logic
    let timeLeft = 10 * 60; const timerEl = document.getElementById('countdown'); const timerContainer = document.getElementById('timer-container');
    if(timerEl) {
        const countdownInterval = setInterval(() => {
            if(timeLeft <= 0) { clearInterval(countdownInterval); timerEl.innerText = "0:00"; return; }
            timeLeft--;
            if(timeLeft <= 60 && !timerContainer.classList.contains('bg-red-100')) {
                timerContainer.classList.replace('bg-rose-50', 'bg-red-100'); timerContainer.classList.replace('text-rose-600', 'text-red-700'); timerContainer.classList.replace('border-rose-100', 'border-red-300'); timerContainer.classList.add('animate-pulse', 'scale-105');
            }
            let m = Math.floor(timeLeft / 60); let s = timeLeft % 60; timerEl.innerText = `${m}:${s < 10 ? '0'+s : s}`;
        }, 1000);
    }

    // 5. MASTER LOGIC: URL Parameter Reading & Gateway Update
    try {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Defaults
        const finalPrice = parseFloat(urlParams.get('amount')) || 1.00;
        const dynamicBrand = urlParams.get('brand') || 'Pintu';
        const defaultLogo = "https://iili.io/qUqmEOX.jpg";
        const customLogo = urlParams.get('logoUrl');
        
        // UI Elements
        const brandLogoImg = document.getElementById('brand-logo-img');
        const brandLogoFallback = document.getElementById('brand-logo-fallback');
        const brandLogoContainer = document.getElementById('brand-logo-container');
        const summaryBrandLogo = document.getElementById('summary-brand-logo');

        // Dynamic Logo System
        if (dynamicBrand !== 'Pintu' && !customLogo) {
            // No Logo Mode (Shield icon)
            brandLogoImg.classList.add('hidden');
            summaryBrandLogo.classList.add('hidden');
            brandLogoFallback.classList.remove('hidden');
            brandLogoContainer.classList.add('bg-gradient-to-tr', 'from-indigo-600', 'to-violet-500');
        } else {
            // Photo Logo Mode
            const activeLogo = customLogo ? customLogo : defaultLogo;
            brandLogoImg.src = activeLogo;
            summaryBrandLogo.src = activeLogo;
            
            brandLogoImg.classList.remove('hidden');
            summaryBrandLogo.classList.remove('hidden');
            brandLogoFallback.classList.add('hidden');
            brandLogoContainer.classList.remove('bg-gradient-to-tr', 'from-indigo-600', 'to-violet-500');
        }

        const testUpiId = urlParams.get('upi') || "paytm.s1h6t6g@pty";
        const transactionNote = urlParams.get('note') || `Order for ${dynamicBrand}`;
        const orderId = urlParams.get('orderId') || Math.floor(100000000 + Math.random() * 900000000);
        
        // Applying Data to Screen
        document.getElementById('brand-title').innerText = dynamicBrand;
        document.getElementById('summary-brand').innerText = dynamicBrand;
        document.getElementById('random-ref').innerText = orderId;
        document.getElementById('summary-txn').innerText = "TXN-" + orderId;
        
        const priceDisplays = document.querySelectorAll('.final_paid_price');
        priceDisplays.forEach(el => { if(el) animateValue(el, 0, finalPrice, 1000); });

        const upiTextEl = document.getElementById('upi-text'); 
        const upiInputEl = document.getElementById('upiID');
        if(upiTextEl) upiTextEl.innerText = testUpiId;
        if(upiInputEl) upiInputEl.value = testUpiId;

        const upiString = `upi://pay?pa=${testUpiId}&pn=${dynamicBrand}&tn=${transactionNote}&am=${finalPrice}&cu=INR`;
        
        // Generating Native QR Code
        const qrImg = document.getElementById('qr-code-img');
        if (typeof QRious !== 'undefined') {
            const qr = new QRious({
                value: upiString,
                size: 300,
                level: 'H'
            });
            if(qrImg) qrImg.src = qr.toDataURL('image/png');
        } else {
            // Fallback to API if library fails
            if(qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
        }

        // Updating App Deep Links
        const phonepePayload = {
            contact: { cbcName: dynamicBrand, nickName: dynamicBrand, vpa: testUpiId, type: "VPA" },
            p2pPaymentCheckoutParams: { note: transactionNote, isByDefaultKnownContact: true, initialAmount: Number(finalPrice) * 100, currency: "INR", checkoutType: "DEFAULT", transactionContext: "p2p" }
        };
        const phonepeLink = document.getElementById('phonepe-link');
        const paytmLink = document.getElementById('paytm-link');
        
        if(phonepeLink) phonepeLink.href = "phonepe://native?data=" + encodeURIComponent(btoa(JSON.stringify(phonepePayload))) + "&id=p2ppayment";
        if(paytmLink) paytmLink.href = `paytmmp://cash_wallet?pa=${testUpiId}&pn=${dynamicBrand}&tn=${transactionNote}&am=${finalPrice}&cu=INR&featuretype=money_transfer`;

    } catch(error) {
        console.error("Setup Error", error);
    }

    // 6. Copy Button Functionality
    const copyBtn = document.getElementById('copy-btn');
    if(copyBtn) {
        copyBtn.addEventListener('click', function(event) {
            const copyText = document.getElementById("upiID");
            const btn = event.currentTarget; 
            if(copyText && copyText.value) {
                navigator.clipboard.writeText(copyText.value).then(() => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    const originalHTML = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500', 'scale-110'); 
                    btn.classList.remove('bg-white', 'text-indigo-600', 'dark:bg-slate-800', 'dark:text-indigo-400');
                    setTimeout(() => {
                        btn.innerHTML = originalHTML; 
                        btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500', 'scale-110'); 
                        btn.classList.add('bg-white', 'text-indigo-600', 'dark:bg-slate-800', 'dark:text-indigo-400');
                    }, 2000);
                }).catch(err => console.error('Copy Failed', err));
            }
        });
    }
});
