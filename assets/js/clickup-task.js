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

const apiToken = "pk_96883446_7ILY8APQDUIKOROYK7BZHOWREPH20QTC";

// Function untuk ambil/GET isi data dari clickup. Sangat diperlukan bila ingin menggunakan function deleteExistingTask
const getClickupResponse = async (listId) => {
  const getResponse = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}/task?subtasks=true`,
    {
      method: "GET",
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
    }
  );
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
    const deleteResponse = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: apiToken,
          "Content-Type": "application/json",
        },
      }
    );
    if (!deleteResponse.ok) throw new Error("Gagal menghapus task lama.");
  }
};

// Function untuk buat/POST data baru dari form ke clickup
const createNewTask = async (listId, taskName, customFields, description) => {
  const createTaskResponse = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}/task`,
    {
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
    }
  );

  if (!createTaskResponse.ok)
    throw new Error("Gagal mengirim data. Harap coba lagi !");
};

// ? Function untuk kirim data form event ke clickup di  Brand/Event/Register. Digunakan di index.html
const handleIndexFormSubmission = async (event) => {
  event.preventDefault();

  const taskName = document.getElementById("name").value.trim();
  const whatsapp = iti.getNumber();
  const motivate = document.getElementById("motivate").value.trim();
  const location = document.getElementById("location").value.trim();
  const Ketersediaan = document.getElementById("Ketersediaan").value.trim();
  // const experience = document.getElementById("experience").value.trim();
  const jobInputs = document.querySelectorAll("#job");
  const jobs = Array.from(jobInputs)
    .map((input) => input.value.trim())
    .filter((value) => value);
  const description = "Menambahkan data ke Event/Register";
  const loading = document.getElementById("loading");
  const success = document.getElementById("success");
  const whatsappModalFallback = new bootstrap.Modal(
    document.getElementById("whatsappFallbackModal")
  );

  const listId = "900302342659"; // listId untuk Brand/Event/Register

  // search dan gunakan function handleGetClickupIds untuk ambil id custom fields, jangan lupa ganti listId dengan yang diperlukan di functionnya.
  const customFields = [
    { id: "218de446-5037-4d3a-9f85-96c047453fe9", value: motivate },
    { id: "4d4ea89a-2c98-467a-8452-a6d1794036ab", value: location },
    { id: "41fe905e-8974-4bf3-a871-daddd8c4307a", value: jobs },
    // { id: "c1c0c137-27c5-4d5c-8ef0-408bf8faace9", value: experience },
    { id: "562e180b-6664-483e-8f44-28902bfe4fbe", value: whatsapp },
  ];

  let isValid = true;

  resetWarnings(".form-text-input", ".warning");

  // Validate Check
  if (!taskName) {
    showWarning("name", "nameWarning");
    isValid = false;
  }
  if (!whatsapp) {
    showWarning("whatsapp-number", "whatsappWarning");
    isValid = false;
  }
  if (!Ketersediaan) {
    showWarning("Ketersediaan", "ketersediaanWarning");
    isValid = false;
  }
  if (!location) {
    showWarning("location", "domisiliWarning");
    isValid = false;
  }
  if (!experience) {
    showWarning("experience", "experienceWarning");
    isValid = false;
  }
  if (!jobs || jobs <= 1) {
    showWarning("job", "jobWarning");
    isValid = false;
  }

  if (!isValid) return;

  try {
    loading.style.display = "flex";

    // Step 1: Ambil data-data dari clickup (GET)
    const tasks = await getClickupResponse(listId);

    // Step 2: Delete task lama (DELETE)
    await deleteExistingTask(tasks.tasks, whatsapp);

    // Step 3: Buat task baru dengan data dari form (POST)
    await createNewTask(listId, taskName, customFields, description);
    openWhatsAppInvite("https://chat.whatsapp.com/FeXk75j2aAq7aqHD12SqN2");

    loading.style.display = "none";
    success.style.display = "flex";
    setTimeout(() => {
      success.style.display = "none";
      whatsappModalFallback.toggle();
    }, 3000);
  } catch (error) {
    loading.style.display = "none";
    alert("Gagal mengirim data; harap coba lagi nanti.");
    console.error("Kesalahan:", error.message);
  }
};

// ? Function untuk kirim data review event ke clickup di  Brand/Event/Review. Digunakan di review-event.html
const handleEventReview = async (event) => {
  event.preventDefault();

  const listId = "900302340074"; // listId untuk Brand/Event/Review

  const taskName = document.getElementById("inputName").value.trim();
  const comment = document.getElementById("inputComment").value.trim();
  const saran = document.getElementById("inputSaran").value.trim();
  const starsRating = document.getElementById("inputRating").value.trim();
  const alasanDaftar = document.getElementById("inputAlasan").value.trim();
  const inputTeknis = document.getElementById("inputTeknis").value.trim();
  const description = "Menambahkan data baru ke Event/Review";

  const loadingSpinner = document.getElementById("loadingSpinner");
  const successIndicator = document.getElementById("successIndicator");

  // search dan gunakan function handleGetClickupIds untuk ambil id custom fields, jangan lupa ganti listId dengan yang diperlukan di functionnya.
  const customFields = [
    { id: "4a11152c-a34b-4d53-aa86-0a25ccb97009", value: saran },
    { id: "c45a736a-d30e-45c8-b4ae-070e4b792d47", value: comment },
    { id: "42d9a4fc-e8a3-49bc-9f41-4ef76c6dae94", value: starsRating },
    { id: "5c1a365d-2b76-4c6b-a431-9f14d636813d", value: inputTeknis },
    { id: "0eb65763-45b4-4030-8553-c5cec8f19877", value: alasanDaftar },
  ];

  let isValid = true;
  resetWarnings();

  // Check validasi
  if (!taskName) {
    showWarning("inputName", "nameWarning");
    isValid = false;
  }
  if (!comment) {
    showWarning("inputComment", "commentWarning");
    isValid = false;
  }
  if (starsRating < 1) {
    showWarning("", "webinarWarning");
    isValid = false;
  }
  if (!saran) {
    showWarning("inputSaran", "saranWarning");
    isValid = false;
  }
  if (!alasanDaftar) {
    showWarning("inputAlasan", "alasanWarning");
    isValid = false;
  }
  if (!inputTeknis) {
    showWarning("inputTeknis", "teknisWarning");
    isValid = false;
  }
  if (!isValid) return;
  // End of Check validasi

  try {
    loadingSpinner.style.display = "flex";

    // Step 1: Buat task baru dengan data dari form
    await createNewTask(listId, taskName, customFields, description);

    // Step 2: Download kupon setelah mengisi form review
    const link = document.createElement("a");
    link.href = "assets/img/vsapp/voucher-juni.png";
    link.download = "basic-plus-voucher";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    loadingSpinner.style.display = "none";
    successIndicator.style.display = "flex";
  } catch (error) {
    loadingSpinner.style.display = "none";
    console.error("Kesalahan:", error.message);
  }
};

// ? Function untuk kirim data presensi event ke clickup di  Brand/Event/Presensi. Digunakan di presence.html
const handlePresensiBtn = async (event) => {
  event.preventDefault();
  const listId = "901604685240";
  const loadingSpinner = document.getElementById("loadingSpinner");
  const whatsAppInput = iti.getNumber();
  const namaInput = document.getElementById("namaInput").value.trim();
  const eventTitle = document.getElementById("eventTitle").innerText.trim();
  const emailInput = document.querySelector('input[name="Email"]');
  const lokasiInput = document.getElementById(`input[name="Lokasi"]`);
  const pertanyaanInput = document.getElementById(`input[name="Info"]`);
  const description = "Mengirim data pendafataran free class !";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

  //variable button
  const reviewEventButton = document.getElementById("reviewEventButton");

  // Validate input fields
  const validateInput = (input, regex) => {
    if (!regex.test(input.value)) {
      alert("Harap masukkan format yang benar");
      return false;
    }
    return true;
  };
  if (
    !validateInput(emailInput, emailRegex, "Email tidak valid!") ||
    !webinarAttendanceValue
  ) {
    if (!webinarAttendanceValue) {
      alert("Tolong isi apakah Anda dapat mengikuti webinar");
    }
    return;
  }

  // Process Followed Accounts
  const FollowedAccountsString = Array.from(followCheckBoxes)
    .filter((item) => item.checked)
    .map((item) => item.value)
    .reduce((acc, current) => {
      if (current === "Belum Semua") {
        return "Belum Semua";
      }
      return acc === "Belum Semua"
        ? "Belum Semua"
        : acc + (acc ? ", " : "") + current;
    }, "");

  const customFields = [
    {
      id: "8f694fdf-bc60-4f1c-aba5-1e595f95ad69",
      value: whatsAppInput,
    },
    {
      id: "50dbfb39-a980-4b49-80c7-70a6f1f154b8",
      value: eventTitle,
    },
    {
      id: "8c91cce3-c9ab-4be6-a2e4-fabd373bdafd",
      value: emailInput.value.trim(),
    },
    {
      id: "c1f564e7-d03f-4f5d-aad6-83661c93b37c",
      value: FollowedAccountsString,
    },
    {
      id: "b18aa038-7bac-4287-8264-72c4cd65ff39",
      value: webinarAttendanceValue,
    },
  ];

  try {
    loadingSpinner.style.display = "block";

    await createNewTask(listId, namaInput, customFields, description);
    submitPresensi.classList.add("d-none");

    // Action setelah upload data yaitu download file pdf
    const link = document.createElement("a");

    reviewEventButton.classList.remove("d-none");
    reviewEventButton.classList.add("d-block");

    // Uncomment syntax dibawah ini bila ingin download file ppt kemudian update href dan nama filenya
    // link.href = "assets/pdf/cheatsheet-how-to-become-a-confident-announcer.pdf";
    // link.download = "cheatsheet-how-to-become-a-confident-announcer.pdf";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // alert("Terimakasih telah presensi. Mohon Menunggu untuk mendownload PDF-nya.");
  } catch (error) {
    alert("Terjadi kesalahan: " + error.message);
  } finally {
    loadingSpinner.style.display = "none";
    emailInput.style.border = "";
  }
};

// ? Function untuk kirim data presensi event ke clickup di  Brand/Event/Presensi. Digunakan di presence.html
const handleEventSenam = async (event) => {
  event.preventDefault();
  const listId = "901608598330";
  const loadingSpinner = document.getElementById("loadingSpinner");
  // const whatsAppInput = iti.getNumber();
  const namaInput = document.getElementById("namaInput").value.trim();
  const emailInput = document.querySelector('input[name="Email"]');
  const universityInput = document.getElementById("university");
  const infoInput = document.getElementById("formInfo");
  const eventTitle = document.getElementById("eventTitle").innerText.trim();
  const description = "Mengirim data presensi peserta event webinar !";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

  // Validate input fields
  const validateInput = (input, regex) => {
    if (!regex.test(input.value))
      return alert("Harap masukkan format yang benar");

    return true;
  };

  const customFields = [
    // {
    //   id: "37ed72e4-0702-47ad-baff-8eaaa568b876",
    //   value: whatsAppInput,
    // },
    {
      id: "083b8a3f-f475-4d47-9590-77b27575f544",
      value: universityInput.value.trim(),
    },
    {
      id: "50dc4d2b-8674-4ac3-a8e6-ed6383754dd5",
      value: emailInput.value.trim(),
    },
    {
      id: "083b8a3f-f475-4d47-9590-77b27575f544",
      value: infoInput.value.trim(),
    },
  ];

  try {
    loadingSpinner.style.display = "block";

    await createNewTask(listId, namaInput, customFields, description);

    // Di dalam try setelah createNewTask:
    openWhatsAppInvite("https://chat.whatsapp.com/GEH72ZRx03r2Rpk8906l2L");

    // window.open("https://chat.whatsapp.com/GEH72ZRx03r2Rpk8906l2L", "_blank");
  } catch (error) {
    alert("Terjadi kesalahan: " + error.message);
  } finally {
    loadingSpinner.style.display = "none";
    emailInput.style.border = "";
  }
};

// ? Function untuk cek id custom field clickup. Buka browser dev tool untuk lihat response dan daftar id-idnya.
// ? Buat button dengan id "getClickupData" untuk menggunakan function ini
const handleGetClickupIds = async (event) => {
  event.preventDefault();
  const apiToken = "pk_96883446_7ILY8APQDUIKOROYK7BZHOWREPH20QTC";
  const listId = "901608976118"; // Ganti dengan id yng sesuai. Contoh link https://app.clickup.com/2307700/v/li/14355106
  let taskId = null; // Variabel untuk menyimpan task ID

  console.log("hello world ini ambil data");

  try {
    // Langkah 1: Send GET Request ke Clickup
    const checkTaskResponse = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/field`,
      {
        method: "GET",
        headers: {
          Authorization: apiToken,
          "Content-Type": "application/json",
        },
      }
    );

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
  const inputSubFooterNama = document
    .getElementById("inputSubFooterNama")
    .value.trim();
  const inputSubFooterWhatsapp = subFooterIti.getNumber();
  const inputSubFooterDomisili = document
    .getElementById("inputSubFooterDomisili")
    .value.trim();
  const inputSubFooterEmail = document
    .getElementById("inputSubFooterEmail")
    .value.trim();
  const description =
    "Menambahkan member grup CEO Class melalui form subscribe";
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
  if (
    !inputSubFooterWhatsapp ||
    !/^\+?\d{10,15}$/.test(inputSubFooterWhatsapp)
  ) {
    alert(
      "Nomor WhatsApp tidak valid. Pastikan hanya angka dan panjang yang sesuai."
    );
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

let iti;

document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector("#whatsapp-number");

  if (window.intlTelInput) {
    iti = window.intlTelInput(input, {
      initialCountry: "id",
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
    });
  } else {
    console.error("intlTelInput tidak ditemukan");
  }
});

const handleFreeClass = async (event) => {
  event.preventDefault();
  const listId = "901608976118";
  const loadingSpinner = document.getElementById("loadingSpinner");
  // const whatsAppInput = iti.getNumber();
  const namaInput = document.getElementById("namaInput")?.value.trim() || "";
  const eventTitle =
    document.getElementById("eventTitle")?.innerText.trim() || "";
  const emailInput = document.querySelector('input[name="Email"]');
  const lokasiInput = document.querySelector('input[name="Lokasi"]');
  // const pertanyaanInput = document.querySelector('textarea[name="Info"]');
  const submitPresensi = document.getElementById("submitPresensi");
  const description = "Mengirim data pendaftaran !";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

  //variable button
  const reviewEventButton = document.getElementById("reviewEventButton");

  // Validate input fields
  const validateInput = (input, regex) => {
    if (!regex.test(input.value)) {
      alert("Harap masukkan format yang benar");
      return false;
    }
    return true;
  };
  if (!validateInput(emailInput, emailRegex)) {
    return;
  }

  const customFields = [
    // {
    //   id: "37ed72e4-0702-47ad-baff-8eaaa568b876",
    //   value: whatsAppInput,
    // },
    {
      id: "dc2e5dec-6383-4c74-8c48-157258583e0e",
      value: eventTitle,
    },
    {
      id: "7bd17e65-0751-4ccc-ad90-127d5b0316a5",
      value: emailInput.value.trim(),
    },
    {
      id: "98221139-3eb6-44c8-b77e-bfb869a25d34",
      value: lokasiInput,
    },
    // {
    //   id: "",
    //   value: pertanyaanInput,
    // },
  ];

  try {
    loadingSpinner.style.display = "block";

    await createNewTask(listId, namaInput, customFields, description);

    // Action setelah upload data yaitu download file pdf
    const link = document.createElement("a");
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

// | Masukkan function handleIndexFormSubmission ke element button dengan id eventSubmitBtn dan membuka grup WA CEO Class
const eventSubmitBtn = document.getElementById("eventSubmitBtn");
if (eventSubmitBtn)
  eventSubmitBtn.addEventListener("click", handleIndexFormSubmission);

// | Masukkan function handleEventReview ke element button dengan id eventSubmitBtn di review-event.html
const reviewSubmitBtn = document.getElementById("reviewSubmitBtn");
if (reviewSubmitBtn)
  reviewSubmitBtn.addEventListener("click", handleEventReview);

// | Masukkan function handlePresensiBtn ke element button dengan id submitPresensi di presence.html
const presensiBtn = document.getElementById("submitPresensi");
if (presensiBtn) presensiBtn.addEventListener("click", handlePresensiBtn);

// | Masukkan function handlePresensiBtn ke element button dengan id submitPresensi di presence.html
const freeClass = document.getElementById("submitPendaftaranFreeClass");
if (freeClass) freeClass.addEventListener("click", handleFreeClass);

// | Masukkan function handleEventSenam ke element button dengan id submitPresensi di presence.html
const eventBtn = document.getElementById("submitEventSenam");
if (eventBtn) eventBtn.addEventListener("click", handleEventSenam);

// | Masukkan function handleGetClickupIds ke element button dengan id getClickupData untuk mengambil id dan value custom_fields clickup
const getClickupData = document.getElementById("getClickupData");
if (getClickupData)
  getClickupData.addEventListener("click", handleGetClickupIds);

// Direct user ke halam review-event
// Function untuk mengirim data saat send button di form di footer
const reviewEventButton = document.getElementById("reviewEventButton");
if (reviewEventButton) {
  reviewEventButton.addEventListener("click", function () {
    window.location.href = "../../review-event.html";
  });
}

// Function untuk mengirim data saat send button di form di footer
const subFooterBtn = document.getElementById("subFooterBtn");
if (subFooterBtn) {
  subFooterBtn.addEventListener("click", handleSubFooterSubmission);
  $(document).on("click", "#subFooterBtn", () => {
    window.open("https://chat.whatsapp.com/FeXk75j2aAq7aqHD12SqN2", "_blank");
  });
}
