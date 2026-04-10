// --- DỮ LIỆU VÒNG QUAY BAN ĐẦU ---
let segments = [
    { text: "Giải Nhất", color: "#FF5733", weight: 5 },   
    { text: "Chúc may mắn", color: "#33FF57", weight: 40 }, 
    { text: "Giải Nhì", color: "#3357FF", weight: 10 },
    { text: "Thêm 1 lượt", color: "#F033FF", weight: 20 },
    { text: "Giải Ba", color: "#FF33A8", weight: 15 },
    { text: "Phần quà nhỏ", color: "#33FFF0", weight: 10 }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-btn");

let currentAngle = 0; 
let isSpinning = false; 

// --- CÁC HÀM XỬ LÝ VÒNG QUAY ---
// 1. Hàm vẽ vòng quay 
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = canvas.width / 2; 
    const innerRadius = outerRadius - 20; 
    const arcSize = (2 * Math.PI) / segments.length; 

    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // --- A. Vẽ viền ngoài cùng ---
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#2c3e50"; 
    ctx.fill();

    // Vẽ 24 bóng đèn nhỏ trên viền (ĐÃ SỬA LỖI ĐỨNG YÊN)
    for (let i = 0; i < 24; i++) {
        // Thêm currentAngle vào đây để bóng đèn xoay theo vòng quay
        const bulbAngle = currentAngle + (i * (2 * Math.PI / 24)); 
        
        const bulbX = centerX + (outerRadius - 10) * Math.cos(bulbAngle);
        const bulbY = centerY + (outerRadius - 10) * Math.sin(bulbAngle);
        
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 4, 0, 2 * Math.PI); 
        ctx.fillStyle = (i % 2 === 0) ? "#f1c40f" : "#ffffff";
        ctx.fill();
    }

    // --- B. Vẽ các ô màu ---
    for (let i = 0; i < segments.length; i++) {
        const angle = currentAngle + i * arcSize;

        ctx.beginPath();
        ctx.fillStyle = segments[i].color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, innerRadius, angle, angle + arcSize);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arcSize / 2); 
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px Arial";
        
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(segments[i].text, innerRadius - 20, 6); 
        ctx.restore();
    }

    // --- C. Vẽ trục quay tâm 3D ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI); 
    ctx.fillStyle = "#bdc3c7";
    ctx.fill();
}

function getWinningSegment() {
    let totalWeight = 0;
    for (let i = 0; i < segments.length; i++) { totalWeight += segments[i].weight; }

    let randomNum = Math.random() * totalWeight;
    let currentWeight = 0;

    for (let i = 0; i < segments.length; i++) {
        currentWeight += segments[i].weight;
        if (randomNum <= currentWeight) { return i; }
    }
    return 0; 
}

// 3. Hàm xử lý quay
function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

    const winningIndex = getWinningSegment();
    const arcSize = (2 * Math.PI) / segments.length;
    const targetAngle = (winningIndex * arcSize) + (arcSize / 2); 
    const spins = 3 * 2 * Math.PI; 
    
    const totalRotation = currentAngle + spins + (2 * Math.PI - (targetAngle + currentAngle) % (2 * Math.PI));

    let startTime = null;
    const duration = 6000; 

    // --- CÁC BIẾN PHỤC VỤ CHO KIM NẢY ---
    const pointer = document.querySelector(".pointer");
    let lastPeg = 0;
    const pegAngle = (2 * Math.PI) / 24; // 24 bóng đèn tương ứng 24 chốt

    function easeOut(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        
        let percent = progress / duration;
        if (percent > 1) percent = 1;

        currentAngle = totalRotation * easeOut(percent);
        drawWheel();

        // --- MÔ PHỎNG VẬT LÝ KIM CHỈ NAM ---
        const pegAngle = (2 * Math.PI) / 24; // Khoảng cách giữa 2 bóng đèn
        
        // Tính tỷ lệ vị trí của chốt (từ 0.0 đến 1.0)
        let ratio = (currentAngle % pegAngle) / pegAngle; 
        
        // Kim sẽ bị bánh xe từ từ ép cong lên góc -35 độ, sau đó nảy búng về 0
        let flapperAngle = ratio * -35; 
        
        pointer.style.transform = `translateY(-50%) rotate(${flapperAngle}deg)`;
        // ------------------------------------

        if (percent < 1) {
            requestAnimationFrame(animate); 
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            currentAngle = currentAngle % (2 * Math.PI); 
            pointer.style.transform = `translateY(-50%) rotate(0deg)`;
            showResult(segments[winningIndex].text); 
        }
    }

    requestAnimationFrame(animate); 
}

// --- POPUP VÀ PHÁO BÔNG ---
function showResult(text) {
    document.getElementById("result-text").innerText = text;
    document.getElementById("result-popup").style.display = "flex";
    
    // Bắn từ bên Trái
    confetti({
        particleCount: 400,
        spread: 360,
        startVelocity: 70,
        ticks: 400,
        origin: { x: 0, y: 0.6 }, // x: 0 là sát mép trái
        angle: 60 // Góc bắn hướng lên sang phải
    });

    // Bắn từ bên Phải
    confetti({
        particleCount: 400,
        spread: 360,
        startVelocity: 70,
        ticks: 400,
        origin: { x: 1, y: 0.6 }, // x: 1 là sát mép phải
        angle: 120 // Góc bắn hướng lên sang trái
    });
}


function closePopup() { document.getElementById("result-popup").style.display = "none"; }


// --- CÔNG CỤ QUẢN TRỊ (ADMIN PANEL) ---
const adminPanel = document.getElementById("admin-panel");
const title = document.getElementById("main-title");
const adminHeader = document.getElementById("admin-header");

title.addEventListener("dblclick", () => {
    if (adminPanel.style.display === "none" || adminPanel.style.display === "") {
        adminPanel.style.display = "block";
        renderAdminSettings();
    } else {
        adminPanel.style.display = "none";
    }
});

// Kéo thả bảng
let isDragging = false;
let offsetX, offsetY;

adminHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - adminPanel.getBoundingClientRect().left;
    offsetY = e.clientY - adminPanel.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    adminPanel.style.left = (e.clientX - offsetX) + "px";
    adminPanel.style.top = (e.clientY - offsetY) + "px";
});
document.addEventListener("mouseup", () => { isDragging = false; });

// Vẽ các dòng cài đặt
function renderAdminSettings() {
    const container = document.getElementById("admin-settings");
    container.innerHTML = ""; 
    
    segments.forEach((seg, index) => {
        const row = document.createElement("div");
        row.className = "admin-row";
        row.innerHTML = `
            <label>${index + 1}.</label>
            <input type="text" id="text-${index}" value="${seg.text}">
            <input type="color" id="color-${index}" value="${seg.color}">
            <input type="number" id="weight-${index}" value="${seg.weight}" min="0" title="Tỷ lệ trúng">
            <button class="remove-btn" onclick="removeSegment(${index})" title="Xóa ô này">❌</button>
        `;
        container.appendChild(row);
    });
}

// Đồng bộ dữ liệu đang nhập dở vào mảng (để khi Thêm/Xóa không bị mất chữ đang gõ)
function syncInputsToSegments() {
    segments.forEach((seg, index) => {
        const textInput = document.getElementById(`text-${index}`);
        if(textInput) {
            seg.text = textInput.value;
            seg.color = document.getElementById(`color-${index}`).value;
            seg.weight = parseFloat(document.getElementById(`weight-${index}`).value);
        }
    });
}

// Thêm ô mới
function addSegment() {
    syncInputsToSegments(); // Lưu lại các thay đổi đang nhập
    // Thêm 1 phần tử mới với màu ngẫu nhiên
    const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    segments.push({ text: "Ô mới", color: randomColor, weight: 10 });
    
    renderAdminSettings(); // Vẽ lại bảng
    drawWheel();           // Cập nhật vòng quay ngay lập tức
}

// Xóa ô
function removeSegment(index) {
    if (segments.length <= 2) {
        alert("Vòng quay cần có ít nhất 2 ô để hoạt động!");
        return;
    }
    syncInputsToSegments(); // Lưu lại các thay đổi đang nhập
    segments.splice(index, 1); // Xóa phần tử tại vị trí index
    
    renderAdminSettings();
    drawWheel();
}

// Thông báo Toast
function showToastMessage(message) {
    const toast = document.getElementById("toast-msg");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

// Lưu cài đặt và đóng
function saveSettings() {
    syncInputsToSegments();
    drawWheel(); 
    adminPanel.style.display = "none"; 
    showToastMessage("Đã lưu cài đặt và cập nhật vòng quay!"); 
}

// --- KHỞI CHẠY LẦN ĐẦU ---
spinBtn.addEventListener("click", spinWheel);
drawWheel();