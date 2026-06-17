const myModalEl = document.getElementById('addModal');
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

document.getElementById("expDate").max =
    new Date().toISOString().split("T")[0];

    document.getElementById("editDate").max =
    new Date().toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];

document.getElementById("fromDate").max = today;
document.getElementById("toDate").max = today;

myModalEl.addEventListener('show.bs.modal', () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("empId").value = currentUser.employeeId || "N/A"
    document.getElementById("empName").value = currentUser.fullName  || "N/A"
    document.getElementById("empDept").value = currentUser.department || "N/A";
  } else {
    console.warn("No User is Found");
  }
});

$(document).ready(function () {
  $('#userProfileOffcanvas').on('show.bs.offcanvas', function () {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
      $("#dropdownUsername").text(currentUser.fullName  || "User");
      $("#profileDesignation").text(currentUser.designation || "N/A");
      $("#profileEmpId").text(currentUser.employeeId || currentUser.id || "N/A");
      $("#profileEmail").text(currentUser.email || "N/A");
      $("#profileDept").text(currentUser.department || "N/A");
      $("#profileRole").text(currentUser.role || "N/A");
      $("#profileGender").text(currentUser.gender || "N/A");
      $("#profileDob").text(currentUser.dob || "N/A");
    } else {
      console.warn("Failed loading profiles: 'currentUser' was missing from localStorage.");
    }
  });
});



document.getElementById("expenseForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  try {

    const expenseDate = document.getElementById("expDate").value;
const today = new Date().toISOString().split("T")[0];

if (expenseDate > today) {
    Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Future dates are not allowed."
    });
    return;
}

const year = new Date(expenseDate).getFullYear();

if (year < 1920) {
    Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Year must be 1920 or later."
    });
    return;
}

const title = document.getElementById("expTitle").value.trim();
const category = document.getElementById("expCategory").value.trim();
const amount = document.getElementById("expAmount").value.trim();
const description = document.getElementById("expDesc").value.trim();

if (!title || !category || !amount || !expenseDate || !description) {
    Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "All fields are required."
    });
    return;
}

if (Number(amount) <= 0) {
    Swal.fire({
        icon: "error",
        title: "Invalid Amount",
        text: "Amount must be greater than 0."
    });
    return;
}
    const data = {
      "employeeId": currentUser.employeeId,
      "employeeName": currentUser.fullName,
      "department": currentUser.department,
      "title": document.getElementById("expTitle").value.trim(),
      "category": document.getElementById("expCategory").value.trim(),
      "amount": document.getElementById("expAmount").value.trim(),
      "expenseDate": document.getElementById("expDate").value.trim(),
      "description": document.getElementById("expDesc").value.trim(),
      "status": "Pending",
       "isDeleted": false, 
      "remark": "",
      "approvedBy": "",
      "decisionDate": "",
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString()
    };

    const response = await fetch("http://localhost:3000/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    await response.json();

    await loadExpenses();

    await Swal.fire({
      title: "Success!",
      text: "Expense added successfully!",
      icon: "success"
    });

    document.getElementById("expenseForm").reset();
    const modalElement = document.getElementById("addModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }

  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Error!",
      text: "Failed to submit expense claim.",
      icon: "error"
    });
  }
});

let allExpenses = [];

async function loadExpenses() {
  try {

    const response = await fetch(
      "http://localhost:3000/expenses"
    );

    allExpenses = await response.json();

    const activeExpenses = allExpenses.filter( exp =>
         exp.employeeId === currentUser.employeeId &&
        !exp.isDeleted
    );

    renderExpenses(activeExpenses);
    countStat(activeExpenses)

  } catch (error) {
    console.error(error);
  }
}
loadExpenses();

function renderExpenses(expenses) {

        expenses.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    const tbody = document.getElementById("expenseTableBody");

    tbody.innerHTML = expenses.map(exp => `
        <tr>
            <td>${exp.title}</td>
            <td>${exp.category}</td>
            <td>₹${exp.amount}</td>
            <td>${exp.expenseDate}</td>
            <td>
                <span class="badge ${
                    exp.status === "Completed"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }">
                    ${exp.status}
                </span>
            </td>
      <td>
    <div class="d-flex justify-content-center gap-2">

       <button
    class="btn btn-sm btn-warning rounded-pill
    ${exp.status === 'Completed' ? 'disabled' : ''}"
    onclick="${exp.status === 'Pending' ? `editExpense('${exp.id}')` : ''}"
    data-bs-toggle="tooltip"
    title="${exp.status === 'Completed'
        ? 'Completed tasks cannot be updated'
        : 'Update Expense'}">
    <i class="bi bi-pencil"></i>
</button>

<button
    class="btn btn-sm btn-danger rounded-pill
    ${exp.status === 'Completed' ? 'disabled' : ''}"
    onclick="${exp.status === 'Pending' ? `deleteExpense('${exp.id}')` : ''}"
    data-bs-toggle="tooltip"
    title="${exp.status === 'Completed'
        ? 'Completed tasks cannot be deleted'
        : 'Delete Expense'}">
    <i class="bi bi-trash3"></i>
</button>

        <button
            class="btn btn-sm btn-primary rounded-pill"
            onclick="viewExpense('${exp.id}')"
            data-bs-toggle="tooltip"
            title="View Expense">
            <i class="bi bi-eye"></i>
        </button>

    </div>
</td>
        </tr>
    `).join('');
    enableTooltips();
}


function viewExpense(id) {

    const expense = allExpenses.find(x => x.id === id);

    document.getElementById("expenseDetails").innerHTML = `
        <p><b>Employee:</b> ${expense.employeeName}</p>
        <p><b>Department:</b> ${expense.department}</p>
        <p><b>Title:</b> ${expense.title}</p>
        <p><b>Category:</b> ${expense.category}</p>
        <p><b>Amount:</b> ₹${expense.amount}</p>
        <p><b>Date:</b> ${expense.expenseDate}</p>
        <p><b>Description:</b> ${expense.description}</p>
        <p><b>Remark:</b> ${expense.remark}</p>
         <p><b>Approved By:</b> ${expense.approvedBy}</p>
        <p><b>Decision Date:</b> ${
    expense.decisionDate?.split("T")[0] || "N/A"
}</p>
        <p><b>Status:</b> ${expense.status}</p>
        ${
          expense.status === "Pending"
          ?
          `
          <div class="mt-3">
              <button
                  class="btn btn-warning"
                  onclick="editExpense('${expense.id}')">
                  Update
              </button>

              <button
                  class="btn btn-danger"
                  onclick="deleteExpense('${expense.id}')">
                  Delete
              </button>
          </div>
          `
          :
          ''
        }
    `;

    new bootstrap.Modal(
      document.getElementById("viewModal")
    ).show();
}

document.querySelectorAll("#button-container button")
.forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll("#button-container button")
    .forEach(b => b.classList.remove("active"));

btn.classList.add("active");

        const status = btn.textContent.trim();

        if (status === "All") {
            renderExpenses(
    allExpenses.filter(exp =>  exp.employeeId === currentUser.employeeId &&!exp.isDeleted)
);
        }
        else {
            const filtered = allExpenses.filter(
                exp =>       exp.employeeId === currentUser.employeeId &&
      !exp.isDeleted &&
      exp.status === status
            );
            renderExpenses(filtered);
        }

    });

});

function editExpense(id) {

    const expense = allExpenses.find(
        exp => exp.id == id
    );

    document.getElementById("editId").value = expense.id;
    document.getElementById("editTitle").value = expense.title;
    document.getElementById("editCategory").value = expense.category;
    document.getElementById("editAmount").value = expense.amount;
    document.getElementById("editDate").value = expense.expenseDate;
    document.getElementById("editDesc").value = expense.description;

    bootstrap.Modal.getInstance(
        document.getElementById("viewModal")
    )?.hide();

    new bootstrap.Modal(
        document.getElementById("editModal")
    ).show();
}

document
.getElementById("updateExpenseBtn")
.addEventListener("click", async () => {

    const id =
        document.getElementById("editId").value;

const editDate = document.getElementById("editDate").value;
const today = new Date().toISOString().split("T")[0];

if (editDate > today) {
    Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Future dates are not allowed."
    });
    return;
}

const year = new Date(editDate).getFullYear();

if (year < 1920) {
    Swal.fire({
        icon: "error",
        title: "Invalid Date"
    });
    return;
}

   const title = document.getElementById("editTitle").value.trim();
    const category = document.getElementById("editCategory").value.trim();
    const amount = document.getElementById("editAmount").value.trim();
    const description = document.getElementById("editDesc").value.trim();

    if (!title || !category || !amount || !editDate || !description) {
        Swal.fire({
            icon: "error",
            title: "Missing Fields",
            text: "All fields are required."
        });
        return;
    }

    if (Number(amount) <= 0) {
        Swal.fire({
            icon: "error",
            title: "Invalid Amount",
            text: "Amount must be greater than 0."
        });
        return;
    }

    const updatedExpense = {

        title:
            document.getElementById("editTitle").value,

        category:
            document.getElementById("editCategory").value,

        amount:
            document.getElementById("editAmount").value,

        expenseDate:
            document.getElementById("editDate").value,

        description:
            document.getElementById("editDesc").value,

        updatedAt:
            new Date().toISOString()
    };

    try {

        const response = await fetch(
            `http://localhost:3000/expenses/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedExpense)
            }
        );

        if (!response.ok) {
            throw new Error("Update failed");
        }

        bootstrap.Modal.getInstance(
            document.getElementById("editModal")
        ).hide();

        await loadExpenses();

        Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Expense updated successfully"
        });

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update expense"
        });
    }
});

function countStat(expenses) {

    const activeExpenses = expenses.filter(
        exp => !exp.isDeleted
    );

    const total = activeExpenses.length;

    const completed = activeExpenses.filter(
        exp => exp.status === "Completed"
    ).length;

    const pending = activeExpenses.filter(
        exp => exp.status === "Pending"
    ).length;

    document.getElementById("totalCount").textContent =
        total;

    document.getElementById("completedCount").textContent =
        completed;

    document.getElementById("pendingCount").textContent =
        pending;
}

async function deleteExpense(id) {

    const result = await Swal.fire({
        title: "Delete Expense?",
        text: "You can restore it later.",
        icon: "warning",
        showCancelButton: true
    });

    if (!result.isConfirmed) return;

    await fetch(`http://localhost:3000/expenses/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true,
            updatedAt: new Date().toISOString()
        })
    });

    bootstrap.Modal.getInstance(
        document.getElementById("viewModal")
    )?.hide();

    await loadExpenses();

    Swal.fire(
        "Deleted!",
        "Expense moved to Restore Bin.",
        "success"
    );
}

document
.getElementById("restoreBtn")
.addEventListener("click", showRestoreBin);

function showRestoreBin() {
    
        document.querySelectorAll("#button-container button")
        .forEach(btn => btn.classList.remove("active"));
    const deletedExpenses = allExpenses.filter(
            exp => exp.employeeId === currentUser.employeeId &&
    exp.isDeleted
    );

    const tbody = document.getElementById(
        "expenseTableBody"
    );

    tbody.innerHTML = deletedExpenses.map(exp => `
        <tr>
            <td>${exp.employeeId}</td>
            <td>${exp.title}</td>
            <td>${exp.category}</td>
            <td>₹${exp.amount}</td>
            <td>${exp.expenseDate}</td>

            <td>
                <button
                    class="btn btn-danger btn-sm"
                    onclick="restoreExpense('${exp.id}')">
                    Restore
                </button>
            </td>
        </tr>
    `).join('');
}

async function restoreExpense(id) {

    await fetch(`http://localhost:3000/expenses/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: false,
            updatedAt: new Date().toISOString()
        })
    });

    await loadExpenses();

    Swal.fire({
        icon: "success",
        title: "Restored",
        text: "Expense restored successfully"
    });
}

document
.getElementById("taskSearch")
.addEventListener("input", applyFilters);

document
.getElementById("fromDate")
.addEventListener("change", applyFilters);

document
.getElementById("toDate")
.addEventListener("change", applyFilters);

function applyFilters() {

    const searchText = document
        .getElementById("taskSearch")
        .value
        .toLowerCase();

    const fromDate = document
        .getElementById("fromDate")
        .value;

    const toDate = document
        .getElementById("toDate")
        .value;

        const today = new Date().toISOString().split("T")[0];

if (fromDate && fromDate > today) {
    Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Future dates are not allowed."
    });
    return;
}

if (toDate && toDate > today) {
    Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Future dates are not allowed."
    });
    return;
}

    let filtered = allExpenses.filter(exp =>
        exp.employeeId === currentUser.employeeId &&
        !exp.isDeleted
    );

    if (searchText) {
        filtered = filtered.filter(exp =>
            exp.title.toLowerCase().includes(searchText)
        );
    }

    if (fromDate) {
        filtered = filtered.filter(exp =>
            exp.expenseDate >= fromDate
        );
    }

    if (toDate) {
        filtered = filtered.filter(exp =>
            exp.expenseDate <= toDate
        );
    }

    renderExpenses(filtered);
}

document
.getElementById("clearFiltersBtn")
.addEventListener("click", () => {

    document.getElementById("taskSearch").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";

    renderExpenses(
        allExpenses.filter(exp =>
            exp.employeeId === currentUser.employeeId &&
            !exp.isDeleted
        )
    );
});

function enableTooltips() {
    const tooltipTriggerList =
        document.querySelectorAll('[data-bs-toggle="tooltip"]');

    [...tooltipTriggerList].forEach(el => {
        new bootstrap.Tooltip(el);
    });
}

document.getElementById("logoutBtn").addEventListener("click", async () => {

    const result = await Swal.fire({
        title: "Logout?",
        text: "Are you sure you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc3545"
    });

    if (result.isConfirmed) {

        localStorage.removeItem("currentUser");

        await Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out successfully.",
            timer: 1500,
            showConfirmButton: false
        });

        window.location.href = "../landing/index.html";
    }
});
