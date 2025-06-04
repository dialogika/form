// resetWarning belum berjalan
const resetWarnings = (inputClass, warningClass) => {
  const warnings = document.querySelectorAll(warningClass);
  const inputBorder = document.querySelectorAll(inputClass);
  warnings.forEach((warning) => (warning.style.display = "none"));
  inputBorder.forEach((input) => (input.style.border = "solid 1px #DEE2E6"));
};

// Tampilkan error warning bila input tidak valid
const showWarning = (inputId, warningId) => {
  const warningText = document.getElementById(warningId);
  const redInput = document.getElementById(inputId);

  warningText.style.display = "block";
  redInput.style.border = "solid 1px red";
};

const apiToken = "pk_276677813_5LZTC2L1TYHRVBRRRK5BKXBZDVUU2X7E";

// Function untuk ambil/GET isi data dari clickup. Sangat diperlukan bila ingin menggunakan function deleteExistingTask
const getClickupResponse = async (listId) => {
  const getResponse = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task?subtasks=true`, {
    method: "GET",
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
  });
  if (!getResponse.ok) throw new Error("Gagal terhubung ke server !.");
  return getResponse.json();
};

// Function untuk filter data di clickup dan hapus data lama bila sama dengan data baru. Memerlukan function getClickupResponse
const deleteExistingTask = async (tasks, whatsapp) => {
  let taskId = null;

  // Filter dan cari apakah ada whatsapp yang sama
  tasks.forEach((task) => {
    task.custom_fields.forEach((field) => {
      if (field.name === "Whatsapp" && field.value === whatsapp) {
        taskId = task.id;
      }
    });
  });

  if (taskId) {
    const deleteResponse = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
    });
    if (!deleteResponse.ok) throw new Error("Gagal menghapus task lama.");
  }
};

// Function untuk buat/POST data baru dari form ke clickup
const createNewTask = async (listId, taskName, customFields, description) => {
  const createTaskResponse = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: taskName,
      description: description,
      custom_fields: customFields,
    }),
  });

  if (!createTaskResponse.ok) throw new Error("Gagal mengirim data. Harap coba lagi !");
};

// ? Function untuk cek id custom field clickup. Buka browser dev tool untuk lihat response dan daftar id-idnya.
// ? Buat button dengan id "getClickupData" untuk menggunakan function ini
const handleGetClickupIds = async (event) => {
  event.preventDefault();
  const listId = "901608976118"; // Ganti dengan id yng sesuai. Contoh link https://app.clickup.com/2307700/v/li/14355106
  let taskId = null; // Variabel untuk menyimpan task ID

  console.log("hello world ini ambil data");

  try {
    // Langkah 1: Send GET Request ke Clickup
    const checkTaskResponse = await fetch(`https://api.clickup.com/api/v2/list/${listId}/field`, {
      method: "GET",
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!checkTaskResponse.ok) {
      throw new Error("Gagal memeriksa duplikasi tugas.");
    }

    const tasks = await checkTaskResponse.json(); // response data dari clickup

    // Variable sementara untuk menyimpan nomor whatsapp dan task yang sama.
    let existingWA = null;
    let matchedTask = null;
    console.log("ini response:", checkTaskResponse);
    console.log("ini tasks :", tasks);
  } catch (error) {
    console.log("terjadi kesalahan !", error);
  }
};

// ? Function untuk kirim data user yang subscribe lewat footer dan gabung ke grup WA CEO Class.
const handleSubFooterSubmission = async (event) => {
  event.preventDefault();
  const inputSubFooterNama = document.getElementById("inputSubFooterNama").value.trim();
  const inputSubFooterWhatsapp = subFooterIti.getNumber();
  const inputSubFooterDomisili = document.getElementById("inputSubFooterDomisili").value.trim();
  const inputSubFooterEmail = document.getElementById("inputSubFooterEmail").value.trim();
  const description = "Menambahkan member grup CEO Class melalui form subscribe";
  const success = document.getElementById("successOverlay");

  const listId = "901602772763";

  const customFields = [
    {
      id: "562e180b-6664-483e-8f44-28902bfe4fbe",
      value: inputSubFooterWhatsapp,
    },
    {
      id: "cebb3fac-770a-4d4d-9056-1cab027bf9e1",
      value: inputSubFooterDomisili,
    },
  ];

  // Basic validation check
  if (!inputSubFooterNama) {
    alert("Nama harus diisi.");
    return;
  }
  if (!inputSubFooterWhatsapp || !/^\+?\d{10,15}$/.test(inputSubFooterWhatsapp)) {
    alert("Nomor WhatsApp tidak valid. Pastikan hanya angka dan panjang yang sesuai.");
    return;
  }
  if (!inputSubFooterEmail) {
    alert("Tolong isi email !");
  }
  if (!inputSubFooterDomisili) {
    alert("Domisili harus diisi.");
    return;
  }

  try {
    success.classList.remove("d-none");
    success.classList.add("d-flex");

    await createNewTask(listId, inputSubFooterNama, customFields, description);
  } catch (error) {
    alert("Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
    console.error(error);
  }
};

const openWhatsAppInvite = (url) => {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const handleFreeClass = async (event) => {
  event.preventDefault();
  const listId = "901608976118";
  const loadingSpinner = document.getElementById("loadingSpinner");
  const whatsAppInput = iti.getNumber();
  const namaInput = document.getElementById("namaInput")?.value.trim() || "";
  const eventTitle = document.getElementById("free-class-title") || "";
  const emailInput = document.getElementById("email");
  const lokasiInput = document.getElementById("lokasi");
  const pertanyaanInput = document.querySelector('textarea[name="notes"]');
  const description = "Mengirim data pendaftaran !";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;


  // Validate input fields
  const validateInput = (input, regex) => {
    if (!regex.test(input.value)) {
      alert("Harap masukkan format yang benar");
      return false;
    }
    return true;
  };
  if (!validateInput(emailInput, emailRegex)) return;
  const customFields = [
    {
      id: "37ed72e4-0702-47ad-baff-8eaaa568b876",
      value: whatsAppInput,
    },
    {
      id: "dc2e5dec-6383-4c74-8c48-157258583e0e",
      value: eventTitle.innerText.trim(),
    },
    {
      id: "7bd17e65-0751-4ccc-ad90-127d5b0316a5",
      value: emailInput.value.trim(),
    },
    {
      id: "d81c3c5b-590c-4dd6-bd06-07169fc6278f",
      value: lokasiInput.value.trim(),
    },
    {
      id: "856f5a4e-fe7b-4ca3-8f2a-82ba0a1816b2",
      value: pertanyaanInput.value.trim(),
    },
  ];

  try {
    loadingSpinner.style.display = "block";

    await createNewTask(listId, namaInput, customFields, description);

    // Action setelah upload data yaitu download file pdf
    // const link = document.createElement("a");
    // Uncomment syntax dibawah ini bila ingin download file ppt kemudian update href dan nama filenya
    // link.href = "assets/pdf/cheatsheet-how-to-become-a-confident-announcer.pdf";
    // link.download = "cheatsheet-how-to-become-a-confident-announcer.pdf";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // alert("Terimakasih telah presensi. Mohon Menunggu untuk mendownload PDF-nya.");
    const modal = new bootstrap.Modal(document.getElementById("successModal"));
    modal.show();
  } catch (error) {
    alert("Terjadi kesalahan: " + error.message);
  } finally {
    loadingSpinner.style.display = "none";
    emailInput.style.border = "";
  }
};

// | Masukkan function handlePresensiBtn ke element button dengan id submitPresensi di presence.html
const freeClass = document.getElementById("submitPendaftaranFreeClass");
if (freeClass) freeClass.addEventListener("click", handleFreeClass);

// | Masukkan function handleGetClickupIds ke element button dengan id getClickupData untuk mengambil id dan value custom_fields clickup
const getClickupData = document.getElementById("getClickupData");
if (getClickupData) getClickupData.addEventListener("click", handleGetClickupIds);

// Function untuk mengirim data saat send button di form di footer
const subFooterBtn = document.getElementById("subFooterBtn");
if (subFooterBtn) {
  subFooterBtn.addEventListener("click", handleSubFooterSubmission);
  $(document).on("click", "#subFooterBtn", () => {
    window.open("https://chat.whatsapp.com/FeXk75j2aAq7aqHD12SqN2", "_blank");
  });
}
