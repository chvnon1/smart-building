// ==========================================
// SMART BUILDING MAINTENANCE SYSTEM
// STEP 2 - AUTO DAILY MAINTENANCE
// ==========================================

let currentUser = null;

let workOrders = [];


// ==========================================
// ข้อมูลปัญหาที่ระบบสามารถสุ่มแจ้งได้
// ==========================================

const maintenanceProblems = [
    {
        title: "ตรวจสอบเครื่องปรับอากาศ",
        location: "อาคาร A ชั้น 3",
        room: "305",
        problem: "ตรวจพบอุณหภูมิสูงผิดปกติจาก Sensor",
        priority: "เร่งด่วน"
    },

    {
        title: "ตรวจสอบปั๊มน้ำ",
        location: "อาคาร A ชั้น 1",
        room: "105",
        problem: "ตรวจพบแรงดันน้ำผิดปกติ",
        priority: "ปานกลาง"
    },

    {
        title: "ตรวจสอบระบบไฟฟ้า",
        location: "อาคาร B ชั้น 5",
        room: "508",
        problem: "ตรวจพบการใช้พลังงานสูงกว่าปกติ",
        priority: "เร่งด่วน"
    },

    {
        title: "ตรวจสอบมอเตอร์",
        location: "อาคาร B ชั้น 2",
        room: "204",
        problem: "ตรวจพบค่าการสั่นสะเทือนสูง",
        priority: "ปานกลาง"
    },

    {
        title: "ตรวจสอบอุณหภูมิห้อง",
        location: "อาคาร C ชั้น 4",
        room: "402",
        problem: "อุณหภูมิสูงกว่าค่าปกติ",
        priority: "ปานกลาง"
    }
];


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const total =
        workOrders.length;

    const newJobs =
        workOrders.filter(
            job => job.status === "ใหม่"
        ).length;

    const workingJobs =
        workOrders.filter(
            job => job.status === "กำลังดำเนินการ"
        ).length;

    const completedJobs =
        workOrders.filter(
            job => job.status === "เสร็จแล้ว"
        ).length;


    document.getElementById("totalJobs")
        .textContent = total;

    document.getElementById("newJobs")
        .textContent = newJobs;

    document.getElementById("workingJobs")
        .textContent = workingJobs;

    document.getElementById("completedJobs")
        .textContent = completedJobs;


    renderWorkOrders();

    renderNotifications();

    renderAdminDashboard();
}


// ==========================================
// สร้างงานซ่อม
// ==========================================

function createMaintenanceJob(auto = false) {

    const now = new Date();

    const randomIndex =
        Math.floor(
            Math.random() *
            maintenanceProblems.length
        );

    const problem =
        maintenanceProblems[randomIndex];


    const job = {
    id: "WO-" + Date.now(),

    title: problem.title,

    location:
        `${problem.location} ห้อง ${problem.room}`,

    problem: problem.problem,

    priority: problem.priority,

    status: "ใหม่",

    time: now.toLocaleString("th-TH"),

    automatic: auto
};


    workOrders.unshift(job);


    saveJobs();


    updateDashboard();

    renderMyJobs();


    sendBrowserNotification(job);
}

// ==========================================
// RENDER WORK ORDERS
// ==========================================

function renderWorkOrders() {

    const container =
        document.getElementById("workOrderList");


    if (!container) return;

    let visibleJobs = workOrders;

if (currentUser && currentUser.role === "technician") {

  visibleJobs = workOrders.filter(
    job =>
      job.technicianUsername ===
      currentUser.username
  );

}


    if (workOrders.length === 0) {

        container.innerHTML = `
            <div class="empty">
                ยังไม่มีงานซ่อม
            </div>
        `;

        return;
    }


    container.innerHTML =
        visibleJobs.map(job => {

            let actionButton = "";


            if (job.status === "ใหม่") {

                actionButton = `
                    <button
                        onclick="window.startJob('${job.id}')">
                        รับงาน
                    </button>
                `;

            }

            else if (
                job.status === "กำลังดำเนินการ"
            ) {

                actionButton = `
                    <button
                        onclick="window.completeJob('${job.id}')">
                        ✓ เสร็จสิ้น
                    </button>
                `;

            }

            else {

                actionButton = `
                    <span class="completed-label">
                        ✓ ปิดงานแล้ว
                    </span>
                `;

            }


            return `

                <div class="work-order">

                    <div class="work-main">

                        <div class="work-title">
                            ${job.title}
                        </div>


                        <div class="work-detail">
                            📍 ${job.location}
                        </div>


                        <div class="work-detail">
                            ⚠️ ${job.problem}
                        </div>


                        <div class="work-detail">
                            🕐 ${job.time}
                        </div>


                        ${
                            job.technicianUsername
                            ?
                            `
                            <div class="work-detail">
                                🔧 ช่างผู้รับผิดชอบ:
                                ${job.technicianUsername}
                            </div>
                            `
                            :
                            ""
                        }
                        
                        ${
    job.startedAt
    ?
    `
    <div class="work-detail">
        ▶️ เริ่มงาน: ${job.startedAt}
    </div>
    `
    :
    ""
}

${
    job.completedAt
    ?
    `
    <div class="work-detail">
        ✅ ปิดงาน: ${job.completedAt}
    </div>
    `
    :
    ""
}

                        ${
                            job.resident
                            ?
                            `
                            <div class="work-detail">
                                👤 แจ้งโดยลูกบ้าน
                            </div>
                            `
                            :
                            ""
                        }


                        ${
                            job.image
                            ?
                            `
                            <div class="work-detail">
                                📷 รูปภาพ: ${job.image}
                            </div>
                            `
                            :
                            ""
                        }

                    </div>


                    <div class="work-actions">

                        <span class="badge
                            ${
                                job.status === "เสร็จแล้ว"
                                ? "badge-completed"
                                : ""
                            }">

                            ${job.status}

                        </span>


                        <button
                            class="detail-button"
                            onclick="openWorkModal('${job.id}')">

                            รายละเอียด

                        </button>


                        ${actionButton}

                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// แสดง Notification
// ==========================================

function renderNotifications() {

    const container =
        document.getElementById(
            "notificationList"
        );


    if (workOrders.length === 0) {

        container.innerHTML = `
            <div class="empty">
                ยังไม่มีการแจ้งเตือน
            </div>
        `;

        return;
    }


    container.innerHTML =
        workOrders.slice(0, 5).map(job => `

            <div class="notification-item">

                <div>

                    <div class="notification-title">

                        🔧 ${job.title}

                        ${
                            job.automatic
                            ? " 🤖"
                            : ""
                        }

                    </div>

                    <div class="notification-detail">

                        ${job.location}

                        -

                        ${job.problem}

                    </div>

                </div>


                <div class="notification-time">

                    ${job.time}

                </div>

            </div>

        `).join("");
}


// ==========================================
// BROWSER NOTIFICATION
// ==========================================

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        alert(
            "Browser นี้ไม่รองรับ Notification"
        );

        return false;
    }


    const permission =
        await Notification.requestPermission();


    return permission === "granted";
}


// ==========================================
// ส่ง Browser Notification
// ==========================================

function sendBrowserNotification(job) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "🔧 Smart Building แจ้งซ่อม",
            {
                body:
                    `${job.title}\n` +
                    `${job.location}\n` +
                    `${job.problem}`
            }
        );

    }
}


// ==========================================
// บันทึกข้อมูล
// ==========================================

function saveJobs() {

    localStorage.setItem(
        "smartBuildingJobs",
        JSON.stringify(workOrders)
    );

}


// ==========================================
// โหลดข้อมูล
// ==========================================

function loadJobs() {

    const saved =
        localStorage.getItem(
            "smartBuildingJobs"
        );


    if (saved) {

        workOrders =
            JSON.parse(saved);

    }

}


// ==========================================
// ตรวจสอบการแจ้งซ่อมประจำวัน
// ==========================================

function checkDailyMaintenance() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const lastDate =
        localStorage.getItem(
            "lastMaintenanceDate"
        );


    // ถ้าวันนี้ยังไม่มีการสร้างงาน
    if (lastDate !== today) {

        console.log(
            "🤖 ระบบกำลังสร้างงานซ่อมประจำวัน..."
        );


        createMaintenanceJob(true);


        localStorage.setItem(
            "lastMaintenanceDate",
            today
        );


        console.log(
            "✅ สร้างงานซ่อมประจำวันแล้ว"
        );

    } else {

        console.log(
            "วันนี้สร้างงานซ่อมไปแล้ว"
        );

    }

}


// ==========================================
// ปุ่มทดสอบแจ้งเตือน
// ==========================================

document
    .getElementById("testNotification")
    .addEventListener(
        "click",
        async () => {

            const allowed =
                await requestNotificationPermission();


            if (allowed) {

                createMaintenanceJob(false);

            } else {

                alert(
                    "กรุณาอนุญาตการแจ้งเตือนใน Browser"
                );

            }

        }
    );


// ==========================================
// เริ่มระบบ
// ==========================================

loadJobs();

updateDashboard();


// ตรวจสอบงานประจำวัน
checkDailyMaintenance();
// ==========================================
// OPEN WORK ORDER DETAIL
// ==========================================

function openWorkModal(jobId) {

    const job =
        workOrders.find(
            job => job.id === jobId
        );


    if (!job) return;


    const detail =
        document.getElementById(
            "workDetail"
        );


    let priorityClass = "";


    if (job.priority === "เร่งด่วน") {

        priorityClass = "priority-high";

    }

    else {

        priorityClass = "priority-normal";

    }


    detail.innerHTML = `

        <div class="detail-section">

            <div class="detail-label">
                หมายเลขงาน
            </div>

            <div class="detail-value">
                ${job.id}
            </div>

        </div>


        <div class="detail-section">

            <div class="detail-label">
                ปัญหา
            </div>

            <div class="detail-value large">
                ${job.title}
            </div>

        </div>


        <div class="detail-section">

            <div class="detail-label">
                รายละเอียด
            </div>

            <div class="detail-value">
                ${job.problem}
            </div>

        </div>


        <div class="detail-grid">

            <div class="detail-section">

                <div class="detail-label">
                    📍 สถานที่
                </div>

                <div class="detail-value">
                    ${job.location}
                </div>

            </div>


            <div class="detail-section">

                <div class="detail-label">
                    🚨 ความเร่งด่วน
                </div>

                <div class="detail-value">
                    <span class="${priorityClass}">
                        ${job.priority}
                    </span>
                </div>

            </div>


            <div class="detail-section">

                <div class="detail-label">
                    📅 แจ้งเมื่อ
                </div>

                <div class="detail-value">
                    ${job.time}
                </div>

            </div>


            <div class="detail-section">

                <div class="detail-label">
                    📊 สถานะ
                </div>

                <div class="detail-value">
                    ${job.status}
                </div>

            </div>

        </div>


        ${
            job.startedAt
            ?
            `
            <div class="detail-section">

                <div class="detail-label">
                    🔧 เริ่มดำเนินการ
                </div>

                <div class="detail-value">
                    ${job.startedAt}
                </div>

            </div>
            `
            :
            ""
        }


        ${
            job.completedAt
            ?
            `
            <div class="detail-section">

                <div class="detail-label">
                    ✅ เสร็จสิ้น
                </div>

                <div class="detail-value">
                    ${job.completedAt}
                </div>

            </div>
            `
            :
            ""
        }


        <div class="modal-actions">

            ${
                job.status === "ใหม่"
                ?
                `
                <button
                    onclick="startJob('${job.id}');
                    closeWorkModal();">

                    👨‍🔧 รับงานนี้

                </button>
                `
                :
                ""
            }


            ${
                job.status === "กำลังดำเนินการ"
                ?
                `
                <button
                    onclick="completeJob('${job.id}');
                    closeWorkModal();">

                    ✓ ปิดงาน

                </button>
                `
                :
                ""
            }

        </div>

    `;


    document
        .getElementById("workModal")
        .classList.add("show");

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeWorkModal() {

    document
        .getElementById("workModal")
        .classList.remove("show");

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

document
    .getElementById("workModal")
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeWorkModal();

            }

        }
    );
    // ==========================================
// START JOB
// ==========================================

function startJob(jobId) {

    console.log("กำลังรับงาน:", jobId);

    const index = workOrders.findIndex(
        job => job.id === jobId
    );

    if (index === -1) {

        console.error(
            "ไม่พบงานซ่อม:",
            jobId
        );

        alert("ไม่พบงานซ่อม");

        return;
    }


    // เปลี่ยนสถานะ
    workOrders[index].status =
        "กำลังดำเนินการ";


    // บันทึกเวลาเริ่มงาน
    workOrders[index].startedAt =
        new Date().toLocaleString("th-TH");

        workOrders[index].technicianUsername =
  currentUser.username;


    // บันทึกข้อมูล
    saveJobs();


    // อัปเดตหน้าจอ
    updateDashboard();

    renderMyJobs();


    console.log(
        "เปลี่ยนสถานะเป็นกำลังดำเนินการแล้ว"
    );

}


// ==========================================
// COMPLETE JOB
// ==========================================

function completeJob(jobId) {

    console.log("กำลังปิดงาน:", jobId);

    const index = workOrders.findIndex(
        job => job.id === jobId
    );

    if (index === -1) {

        console.error(
            "ไม่พบงานซ่อม:",
            jobId
        );

        alert("ไม่พบงานซ่อม");

        return;
    }


    workOrders[index].status =
        "เสร็จแล้ว";


    workOrders[index].completedAt =
        new Date().toLocaleString("th-TH");


    saveJobs();


    updateDashboard();

    renderMyJobs();


    alert(
        "ปิดงานซ่อมเรียบร้อยแล้ว ✓"
    );

}
// ==========================================
// RESIDENT MAINTENANCE FORM
// ==========================================

document
    .getElementById("maintenanceForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        // ==============================
        // รับค่าจากฟอร์ม
        // ==============================

        const building =
            document.getElementById("building").value;

        const floor =
            document.getElementById("floor").value;

        const room =
            document.getElementById("room").value;

        const problemType =
            document.getElementById("problemType").value;

        const problemDetail =
            document.getElementById("problemDetail").value;

        const priority =
            document.getElementById("priority").value;

        const imageInput =
            document.getElementById("problemImage");


        // ==============================
        // ตรวจสอบข้อมูล
        // ==============================

        if (
            !building ||
            !floor ||
            !room ||
            !problemType ||
            !problemDetail ||
            !priority
        ) {

            alert(
                "กรุณากรอกข้อมูลให้ครบถ้วน"
            );

            return;
        }


        // ==============================
        // สร้างเลข Work Order
        // ==============================

        const jobId =
            "WO-" + Date.now();


        const now =
            new Date();


        // ==============================
        // สร้างข้อมูลรูปภาพ
        // ==============================

        let imageName = "";

        if (
            imageInput.files &&
            imageInput.files.length > 0
        ) {

            imageName =
                imageInput.files[0].name;

        }


        // ==============================
        // สร้างงานใหม่
        // ==============================

        const newJob = {

            id: jobId,

            title:
                `${problemType} - ห้อง ${room}`,
                residentUsername: currentUser.username,

            location:
                `${building} ชั้น ${floor} ห้อง ${room}`,

            problem:
                problemDetail,

            priority:
                priority,

            status:
                "ใหม่",

            time:
                now.toLocaleString("th-TH"),

            automatic:
                false,

            resident:
                true,

            image:
                imageName

        };


        // ==============================
        // เพิ่มเข้า Work Order
        // ==============================

        workOrders.unshift(
            newJob
        );


        // ==============================
        // บันทึกข้อมูล
        // ==============================

        saveJobs();


        // ==============================
        // อัปเดต Dashboard
        // ==============================

        updateDashboard();


        // ==============================
        // แจ้งเตือน
        // ==============================

        sendBrowserNotification(
            newJob
        );


        // ==============================
        // ล้างฟอร์ม
        // ==============================

        document
            .getElementById("maintenanceForm")
            .reset();


        // ==============================
        // แจ้งผล
        // ==============================

        alert(
            `ส่งแจ้งซ่อมเรียบร้อยแล้ว\n\n` +
            `เลขงาน: ${jobId}`
        );

    });
    // =========================
// LOGIN SYSTEM
// =========================


function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("loginRole").value;
  const error = document.getElementById("loginError");

  if (!username || !password) {
    error.textContent = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
    return;
  }

  currentUser = {
    username: username,
    role: role
  };

  localStorage.setItem(
    "smartBuildingUser",
    JSON.stringify(currentUser)
  );

  showDashboard();
}

function showDashboard() {
  const loginPage = document.getElementById("loginPage");

  if (loginPage) {
    loginPage.style.display = "none";
  }

  applyRolePermissions();

  renderWorkOrders();

  renderMyJobs();
}

function logout() {
  localStorage.removeItem("smartBuildingUser");

  currentUser = null;

  const loginPage = document.getElementById("loginPage");

  if (loginPage) {
    loginPage.style.display = "flex";
  }
}

function loadUser() {
  const savedUser = localStorage.getItem("smartBuildingUser");

  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
  }
}

function applyRolePermissions() {

  if (!currentUser) return;

  const residentSection =
    document.querySelector(".resident-section");

    const adminDashboardSection =
  document.querySelector(".admin-dashboard-section");

    const myJobsSection =
  document.querySelector(".my-jobs-section");

  const workOrderList =
    document.getElementById("workOrderList");

  const workOrderSection =
    workOrderList ? workOrderList.closest("section") : null;

  const notificationSection =
    document.querySelector(".notification-section");


  // ลูกบ้าน
  if (currentUser.role === "resident") {

    if (residentSection) {
      residentSection.style.display = "block";
    }

    if (myJobsSection) {
  myJobsSection.style.display = "block";
    }

    if (workOrderSection) {
      workOrderSection.style.display = "none";
    }

    if (notificationSection) {
      notificationSection.style.display = "none";
    }

    if (adminDashboardSection)
  adminDashboardSection.style.display = "none";

  }


  // ช่าง
  else if (currentUser.role === "technician") {

    if (residentSection) {
      residentSection.style.display = "none";
    }

    if (myJobsSection) {
  myJobsSection.style.display = "none";
    }

    if (workOrderSection) {
      workOrderSection.style.display = "block";
    }

    if (notificationSection) {
      notificationSection.style.display = "block";
    }

    if (adminDashboardSection)
  adminDashboardSection.style.display = "none";

  }


  // Admin
  else if (currentUser.role === "admin") {

    if (residentSection) {
      residentSection.style.display = "block";
    }

    if (myJobsSection) {
  myJobsSection.style.display = "none";
    }

    if (workOrderSection) {
      workOrderSection.style.display = "block";
    }

    if (notificationSection) {
      notificationSection.style.display = "block";
    }

    if (adminDashboardSection)
  adminDashboardSection.style.display = "block";

  }
}
loadUser();
function renderMyJobs() {

  const myJobsList =
    document.getElementById("myJobsList");

  if (!myJobsList || !currentUser) return;

  const myJobs = workOrders.filter(job =>
    job.residentUsername === currentUser.username
  );

  if (myJobs.length === 0) {
    myJobsList.innerHTML = `
      <div class="empty">
        ยังไม่มีงานแจ้งซ่อม
      </div>
    `;
    return;
  }

  myJobsList.innerHTML = myJobs.map(job => {

    let statusText = job.status;

    if (job.status === "ใหม่") {
      statusText = "🆕 รอช่างรับงาน";
    }

    if (job.status === "กำลังดำเนินการ") {
      statusText = "🔧 กำลังดำเนินการ";
    }

    if (job.status === "เสร็จแล้ว") {
      statusText = "✅ ดำเนินการเสร็จแล้ว";
    }

    return `
      <div class="my-job-card">

        <div class="my-job-header">
          <strong>${job.title}</strong>
          <span>${statusText}</span>
        </div>

        <div class="work-detail">
          📍 ${job.location}
        </div>

        <div class="work-detail">
          🔧 ${job.problem}
        </div>

        <div class="work-detail">
          ⚠️ ความเร่งด่วน: ${job.priority}
        </div>

        <div class="work-detail">
          🕐 แจ้งเมื่อ: ${job.time}
        </div>

        ${
  job.technicianUsername
    ? `<div class="work-detail">
        🔧 ช่างผู้รับผิดชอบ: ${job.technicianUsername}
       </div>`
    : ""
}

${
  job.startedAt
    ? `
      <div class="work-detail">
        ▶️ เริ่มงาน: ${job.startedAt}
      </div>
    `
    : ""
}

${
  job.completedAt
    ? `
      <div class="work-detail">
        ✅ ปิดงาน: ${job.completedAt}
      </div>
    `
    : ""
}
      </div>
    `;

  }).join("");
}
function renderAdminDashboard() {

  const totalEl =
    document.getElementById("adminTotalJobs");

  const newEl =
    document.getElementById("adminNewJobs");

  const workingEl =
    document.getElementById("adminWorkingJobs");

  const completedEl =
    document.getElementById("adminCompletedJobs");

  const recentEl =
    document.getElementById("adminRecentJobs");

  if (!totalEl) return;


  // =========================
  // KPI
  // =========================

  const total = workOrders.length;

  const newJobs = workOrders.filter(
    job => job.status === "ใหม่"
  ).length;

  const workingJobs = workOrders.filter(
    job => job.status === "กำลังดำเนินการ"
  ).length;

  const completedJobs = workOrders.filter(
    job => job.status === "เสร็จแล้ว"
  ).length;


  totalEl.textContent = total;
  newEl.textContent = newJobs;
  workingEl.textContent = workingJobs;
  completedEl.textContent = completedJobs;


  // =========================
  // งานล่าสุด
  // =========================

  if (!recentEl) return;

  if (workOrders.length === 0) {

    recentEl.innerHTML = `
      <div class="empty">
        ยังไม่มีงาน
      </div>
    `;

    return;
  }


  // เอา 5 งานล่าสุด
  const recentJobs =
    workOrders.slice(0, 5);


  recentEl.innerHTML =
    recentJobs.map(job => {

      return `
        <div class="admin-job-card">

          <div class="admin-job-header">

            <strong>
              ${job.title}
            </strong>

            <span>
              ${job.status}
            </span>

          </div>

          <div class="work-detail">
            📍 ${job.location}
          </div>

          <div class="work-detail">
            ⚠️ ${job.problem}
          </div>

          <div class="work-detail">
            🕐 ${job.time}
          </div>

          ${
  job.status !== "เสร็จแล้ว"
  ?
  `
  <button
    class="assign-button"
    onclick="openAssignTechnician('${job.id}')">
    👷 มอบหมายช่าง
  </button>
  `
  :
  ""
}

          ${
            job.technicianUsername
            ?
            `
            <div class="work-detail">
              🔧 ช่าง:
              ${job.technicianUsername}
            </div>
            `
            :
            ""
          }

        </div>
      `;

    }).join("");
}

let selectedJobIdForAssignment = null;

function openAssignTechnician(jobId) {

  selectedJobIdForAssignment = jobId;

  const modal =
    document.getElementById("assignModal");

  if (!modal) {
    alert("ไม่พบ assignModal");
    return;
  }

  modal.style.display = "flex";
}

function closeAssignTechnician() {

  const modal =
    document.getElementById("assignModal");

  if (!modal) return;

  modal.style.display = "none";

  selectedJobIdForAssignment = null;
}
function assignTechnician() {

  if (!selectedJobIdForAssignment) {
    return;
  }

  const select =
    document.getElementById("technicianSelect");

  if (!select) return;

  const technicianUsername =
    select.value;

  if (!technicianUsername) {

    alert("กรุณาเลือกช่าง");

    return;
  }


  const index =
    workOrders.findIndex(
      job => job.id === selectedJobIdForAssignment
    );

  if (index === -1) {

    alert("ไม่พบงาน");

    return;
  }


  // บันทึกช่างที่รับผิดชอบ
  workOrders[index].technicianUsername =
    technicianUsername;


  saveJobs();

  updateDashboard();

  renderWorkOrders();

  renderMyJobs();

  closeAssignTechnician();

  alert(
    `มอบหมายงานให้ ${technicianUsername} เรียบร้อยแล้ว`
  );
}
// =========================
// Register Service Worker
// =========================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => {
        console.log("Service Worker registered");
      })
      .catch(error => {
        console.error("Service Worker registration failed:", error);
      });
  });
}