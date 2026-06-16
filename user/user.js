const myModalEl = document.getElementById('addModal');
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

document.getElementById("expenseForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  try {
    const receiptInputElement = document.getElementById("expReceipt");
    const receiptFile = receiptInputElement ? receiptInputElement.files[0] : null;
    
    let base64DataString = "base64-image";

    if (receiptFile) {
      base64DataString = await convertFileToBase64(receiptFile);
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
      "priority": document.getElementById("expPriority").value.trim(),
      "receipt": base64DataString,
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
                <button
                    class="btn btn-sm btn-primary"
                    onclick="viewExpense('${exp.id}')">
                    View
                </button>
            </td>
        </tr>
    `).join('');
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
        <p><b>Priority:</b> ${expense.priority}</p>
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
    document.getElementById("editPriority").value = expense.priority;

    bootstrap.Modal.getInstance(
        document.getElementById("viewModal")
    ).hide();

    new bootstrap.Modal(
        document.getElementById("editModal")
    ).show();
}

document
.getElementById("updateExpenseBtn")
.addEventListener("click", async () => {

    const id =
        document.getElementById("editId").value;

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

        priority:
            document.getElementById("editPriority").value,

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
                <span class="badge bg-danger">
                    Deleted
                </span>
            </td>

            <td>
                <button
                    class="btn btn-success btn-sm"
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

document.getElementById("logoutBtn").addEventListener("click",() =>{
    window.location.href="../landing/index.html"
})