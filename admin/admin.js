
const currentUser = JSON.parse(localStorage.getItem("currentUser"));



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



let allExpenses = [];

async function loadExpenses() {
  try {

    const response = await fetch(
      "http://localhost:3000/expenses"
    );

    allExpenses = await response.json();

    const activeExpenses = allExpenses.filter( exp =>
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
         <td>${exp.employeeId}</td>
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
                    class="btn btn-sm btn-primary rounded-pill"
                    onclick="viewExpense('${exp.id}')" data-bs-toggle="tooltip" title="View Expense">
                      <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
     enableTooltips()
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
        <p><b>Status:</b> ${expense.status}</p>
        ${
          expense.status === "Pending"
          ?
          `
          <div class="mt-3">
           <button
        class="btn btn-success"
        onclick="openDecisionModal('${expense.id}','Completed')">
        Approve
    </button>

              <button
        class="btn btn-danger"
        onclick="openDecisionModal('${expense.id}','Rejected')">
        Reject
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
    allExpenses.filter(exp =>!exp.isDeleted)
);
        }
        else {
            const filtered = allExpenses.filter(
                exp => 
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
            !exp.isDeleted
        )
    );
});
function openDecisionModal(id, status) {

    document.getElementById("decisionExpenseId").value = id;
    document.getElementById("decisionStatus").value = status;
    document.getElementById("decisionRemark").value = "";

    document.getElementById("decisionTitle").textContent =
        status === "Completed"
        ? "Approve Expense"
        : "Reject Expense";

    bootstrap.Modal.getInstance(
        document.getElementById("viewModal")
    )?.hide();

    new bootstrap.Modal(
        document.getElementById("decisionModal")
    ).show();
}

document.getElementById("saveDecisionBtn")
.addEventListener("click", async () => {

    const id =
        document.getElementById("decisionExpenseId").value;

    const status =
        document.getElementById("decisionStatus").value;

    const remark =
        document.getElementById("decisionRemark").value.trim();

    if (!remark) {
        Swal.fire(
            "Validation",
            "Please enter remarks",
            "warning"
        );
        return;
    }

    try {

        await fetch(
            `http://localhost:3000/expenses/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status,
                    remark: remark,
                    approvedBy: currentUser.fullName,
                    decisionDate: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
        );

        bootstrap.Modal.getInstance(
            document.getElementById("decisionModal")
        ).hide();

        await loadExpenses();

        Swal.fire({
            icon: "success",
            title: status,
            text: `Expense ${status.toLowerCase()} successfully`
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update expense"
        });
    }
});
function enableTooltips(){
    const tooltipTriggerList=document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].forEach(el =>{
     new bootstrap.Tooltip(el);
    })
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
