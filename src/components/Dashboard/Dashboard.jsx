import React, { useContext, useState } from "react";
import { EmployeeContext } from "../../context/EmployeeContext";
import { useNavigate } from "react-router-dom";  // For redirect on logout
import { AuthContext } from "../../context/AuthContext";

export default function Dashboard() {
  const { employees, setEmployees } = useContext(EmployeeContext);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    state: "",
    image: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const total = employees.length;
  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = total - activeCount;

  const filteredEmployees = employees
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => (genderFilter ? e.gender === genderFilter : true))
    .filter((e) =>
      statusFilter === ""
        ? true
        : statusFilter === "active"
        ? e.isActive
        : !e.isActive
    );

  const openAddModal = () => {
    setEditEmployee(null);
    setForm({
      name: "",
      gender: "",
      dob: "",
      state: "",
      image: "",
      isActive: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditEmployee(emp);
    setForm(emp);
    setErrors({});
    setShowModal(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full Name is required";
    }
    if (!form.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!form.dob) {
      newErrors.dob = "Date of Birth is required";
    }
    if (!form.state) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
  };

  const saveEmployee = () => {
    if (!validateForm()) {
      return; // Don't save if form invalid
    }

    if (editEmployee) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editEmployee.id ? { ...form, id: editEmployee.id } : emp
        )
      );
    } else {
      setEmployees([...employees, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setErrors({});
  };

  const deleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { ...emp, isActive: !emp.isActive } : emp
      )
    );
  };

  // Print functionality
  const printEmployees = () => {
    const originalTable = document.getElementById("employee-table");
    if (!originalTable) return;

    // Clone the original table
    const tableClone = originalTable.cloneNode(true);

    // Remove the Actions column (last column) from header
    const headerRow = tableClone.querySelector("thead tr");
    if (headerRow) {
      // Assuming Actions is the last column
      headerRow.removeChild(headerRow.lastElementChild);
    }

    // Remove the Actions column from each row in tbody
    const bodyRows = tableClone.querySelectorAll("tbody tr");
    bodyRows.forEach((row) => {
      // Remove last cell (Actions)
      row.removeChild(row.lastElementChild);
    });

    const newWindow = window.open("", "", "width=900,height=650");

    newWindow.document.write(`
    <html>
      <head>
        <title>Print Employees</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: center;
          }
          th {
            background-color: #f4f4f4;
          }
          img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <h2>Employee List</h2>
        ${tableClone.outerHTML}
      </body>
    </html>
  `);

    newWindow.document.close();

    newWindow.onload = () => {
      newWindow.focus();
      newWindow.print();
      // newWindow.close();
    };
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to login page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Employee Management Dashboard</h2>

      {/* Logout Button */}
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <button style={styles.secondaryBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* SUMMARY */}
      <div style={styles.cardWrapper}>
        <SummaryCard title="Total Employees" value={total} color="#4f46e5" />
        <SummaryCard title="Active" value={activeCount} color="#16a34a" />
        <SummaryCard title="Inactive" value={inactiveCount} color="#dc2626" />
      </div>

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        <input
          style={styles.input}
          placeholder="Search by name"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <select
          style={styles.input}
          onChange={(e) => setGenderFilter(e.target.value)}
          value={genderFilter}
        >
          <option value="">All Genders</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <select
          style={styles.input}
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button style={styles.primaryBtn} onClick={openAddModal}>
          + Add Employee
        </button>

        {/* Print Button */}
        <button
          style={{ ...styles.primaryBtn, marginLeft: 10, backgroundColor: "#4b5563" }}
          onClick={printEmployees}
        >
          Print Employees
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table id="employee-table" style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Profile</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Gender</th>
              <th style={styles.th}>DOB</th>
              <th style={styles.th}>State</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td style={styles.td}>{emp.id}</td>

                <td style={styles.td}>
                  <img
                    src={emp.image || "https://via.placeholder.com/40"}
                    alt=""
                    style={styles.avatar}
                  />
                </td>

                <td style={styles.td}>{emp.name}</td>
                <td style={styles.td}>{emp.gender}</td>
                <td style={styles.td}>{emp.dob}</td>
                <td style={styles.td}>{emp.state}</td>

                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={emp.isActive}
                    onChange={() => toggleStatus(emp.id)}
                  />
                </td>

                <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                  <button
                    style={styles.editBtn}
                    onClick={() => openEditModal(emp)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteEmployee(emp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editEmployee ? "Edit Employee" : "Add Employee"}
            </h3>

            {/* Image upload at top */}
            <div style={styles.imageUploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={styles.fileInput}
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Profile Preview"
                  style={styles.imagePreview}
                />
              )}
            </div>

            {/* Form fields */}
            <div style={styles.formGrid}>
              <div>
                <input
                  style={styles.input}
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.name}</p>
                )}
              </div>

              <div>
                <select
                  style={styles.input}
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
                {errors.gender && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.gender}</p>
                )}
              </div>

              <div>
                <input
                  type="date"
                  style={styles.dateInput}
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
                {errors.dob && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.dob}</p>
                )}
              </div>

              <div>
                <select
                  style={styles.input}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                >
                  <option value="">State</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Kerala</option>
                </select>
                {errors.state && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.state}</p>
                )}
              </div>
            </div>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active Employee
            </label>

            <div style={styles.modalActions}>
              <button style={styles.primaryBtn} onClick={saveEmployee}>
                Save
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* SUMMARY CARD */
const SummaryCard = ({ title, value, color }) => (
  <div style={{ ...styles.card, backgroundColor: color }}>
    <p style={{ opacity: 0.9 }}>{title}</p>
    <h2 style={{ marginTop: 8 }}>{value}</h2>
  </div>
);

/* STYLES */
const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },
  cardWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    color: "#fff",
    padding: "20px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
    alignItems: "stretch",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box", // 🔥 REQUIRED
  },
  dateInput: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
  },

  primaryBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    backgroundColor: "#e5e7eb",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    padding: "14px 10px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
    fontWeight: "600",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 10px",
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    objectFit: "cover",
  },
  editBtn: {
    backgroundColor: "#facc15",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    marginRight: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: 420,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  imageUploadContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  fileInput: {
    marginBottom: 10,
    cursor: "pointer",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  checkbox: {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
};
