// ==============================
// SIMPLE FILTER UTILITIES
// ==============================

const DEBUG = true; // turn OFF in production

// Safely extract created date from any OPD/queue object
const getCreatedDate = (record: any): string | null => {
  const created =
    record?.createdAt ||
    record?.created_at ||
    record?.caseId?.createdAt ||
    record?.caseId?.created_at ||
    null;

  if (DEBUG) console.log("📌 getCreatedDate:", created);

  return created;
};

// ------------------------------
// 1️⃣ Filter by exact date (YYYY-MM-DD)
// ------------------------------
export const filterByDate = (targetDate: string) => {
  if (DEBUG) console.log("🎯 filterByDate - target:", targetDate);

  return (record: any) => {
    const createdAt = getCreatedDate(record);
    if (!createdAt) return false;

    const recordDate = new Date(createdAt).toISOString().split("T")[0];

    if (DEBUG)
      console.log("➡️ checking", recordDate, "==", targetDate, "=>", recordDate === targetDate);

    return recordDate === targetDate;
  };
};

// ------------------------------
// 2️⃣ Filter by date range
// ------------------------------
export const filterByDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  if (DEBUG)
    console.log("🎯 filterByDateRange:", { startDate, endDate });

  return (record: any) => {
    const createdAt = getCreatedDate(record);
    if (!createdAt) return false;

    const recordDate = new Date(createdAt);

    const inside =
      recordDate >= startDate && recordDate <= endDate;

    if (DEBUG)
      console.log("↔️ range check:", { recordDate, inside });

    return inside;
  };
};

// ------------------------------
// 3️⃣ Filter by doctor name
// ------------------------------
export const filterByDoctor = (doctorName: string) => {
  if (!doctorName) return () => true;

  if (DEBUG)
    console.log("👨‍⚕️ filterByDoctor:", doctorName);

  return (record: any) => {
    const doctor =
      record?.consulting_Doctor?.name ||
      record?.doctorId?.name ||
      record?.consulting_Doctor;

    const match = doctor === doctorName;

    if (DEBUG) console.log("➡️ doctor:", doctor, "==", doctorName, "=>", match);

    return match;
  };
};

// ------------------------------
// 4️⃣ Filter by text (mobile, name, uhid)
// ------------------------------
export const filterBySearchText = (text: string) => {
  const term = text.toLowerCase();

  if (DEBUG)
    console.log("🔍 filterBySearchText:", term);

  return (record: any) => {
    const name =
      record?.uniqueHealthIdentificationId?.patient_name?.toLowerCase() ||
      record?.caseId?.uniqueHealthIdentificationId?.patient_name?.toLowerCase() ||
      "";

    const mobile =
      record?.uniqueHealthIdentificationId?.mobile_no?.toLowerCase() ||
      record?.caseId?.uniqueHealthIdentificationId?.mobile_no ||
      "";

    const uhid =
      record?.uniqueHealthIdentificationId?.uhid?.toLowerCase() ||
      record?.caseId?.uniqueHealthIdentificationId?.uhid ||
      "";

    const match =
      name.includes(term) ||
      mobile.includes(term) ||
      uhid.includes(term);

    if (DEBUG)
      console.log("➡️ text-match:", { name, mobile, uhid, match });

    return match;
  };
};

// ------------------------------
// 5️⃣ Filter by status
// ------------------------------
export const filterByStatus = (status: string, isDoctor: boolean) => {
  if (!status || !isDoctor) return () => true;

  if (DEBUG)
    console.log("⚡ filterByStatus:", status);

  return (record: any) => {
    let match = false;

    if (status === "waiting") {
      match = record.status === "waiting" || record.status === "skipped";
    } else {
      match = record.status === status;
    }

    if (DEBUG)
      console.log("➡️ status-match:", record.status, "=>", match);

    return match;
  };
};
``
