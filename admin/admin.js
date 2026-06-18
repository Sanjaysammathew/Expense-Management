
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (currentUser) {
    const firstName = currentUser.fullName.split(" ")[0];
    document.getElementById("navUsername").textContent = firstName;
}

////It is used for profile section to show all user data
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


// this function is used to fetch data from json server and store in allExpense array
//  so that we dont want to write fetch functions many time

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

//this function is used  to show data to the user by targeting elements and provide value using allExpense array

function renderExpenses(expenses) {

          expenses.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );


    const tbody = document.getElementById("expenseTableBody");

    tbody.innerHTML = expenses.map(exp => `
        <tr>
         <td>${exp.employeeId}</td>
            <td>${capitalizeWords(exp.title)}</td>
            <td>${capitalizeWords(exp.category)}</td>
            <td>₹${exp.amount}</td>
            <td>${formatDate(exp.expenseDate)}</td>
            <td>
          <span class="badge ${
    exp.status === "Completed"
        ? "bg-success"
        : exp.status === "Rejected"
        ? "bg-danger"
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

//this function is triggered when user click view icon it shows the modal and details using all expense array
function viewExpense(id) {

    const expense = allExpenses.find(x => x.id === id);

 document.getElementById("expenseDetails").innerHTML = `
<div class="container-fluid">

    <div class="text-center mb-4">

        <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
             style="width:80px;height:80px;">
            <i class="bi bi-receipt fs-2"></i>
        </div>

        <h4 class="fw-bold mt-3">${capitalizeWords(expense.title)}</h4>

         <span class="badge ${
    expense.status === "Completed"
        ? "bg-success"
        : expense.status === "Rejected"
        ? "bg-danger"
        : "bg-warning text-dark"
} px-4 py-2 rounded-pill">
            ${expense.status}
        </span>

    </div>

    <div class="card border-0 shadow rounded-4">
        <div class="card-body p-4">

            <div class="row text-center g-4">

                <div class="col-md-6">
                    <small class="text-muted">Employee</small>
                    <h6 class="fw-bold">${capitalizeWords(expense.employeeName)}</h6>
                </div>

                <div class="col-md-6">
                    <small class="text-muted">Department</small>
                    <h6 class="fw-bold">${expense.department}</h6>
                </div>

                <div class="col-md-6">
                    <small class="text-muted">Category</small>
                    <h6 class="fw-bold">${capitalizeWords(expense.category)}</h6>
                </div>

                <div class="col-md-6">
                    <small class="text-muted">Amount</small>
                    <h5 class="fw-bold text-success">
                        ₹${expense.amount}
                    </h5>
                </div>

                <div class="col-12">
                    <small class="text-muted">Expense Date</small>
                    <h6 class="fw-bold">${expense.expenseDate}</h6>
                </div>

            </div>

            <hr>

            <div class="mb-3">
                <label class="fw-semibold text-secondary mb-2">
                    Description
                </label>

                <div class="bg-light rounded-3 p-3">
                    ${expense.description}
                </div>
            </div>

        </div>
    </div>

    ${
        expense.status === "Pending"
        ? `
        <div class="d-flex justify-content-end gap-3 mt-4">

            <button
                class="btn btn-success rounded-pill px-4 shadow-sm"
                onclick="openDecisionModal('${expense.id}','Completed')">
                <i class="bi bi-check-circle me-1"></i>
                Approve
            </button>

            <button
                class="btn btn-danger rounded-pill px-4 shadow-sm"
                onclick="openDecisionModal('${expense.id}','Rejected')">
                <i class="bi bi-x-circle me-1"></i>
                Reject
            </button>

        </div>
        `
        : `
        <div class="card border-0 shadow-sm mt-4">
            <div class="card-body">

                <div class="row text-center">

                  <div class="col-md-6">
    <small class="text-muted">
        ${expense.status === "Rejected"
            ? "Rejected By"
            : "Approved By"}
    </small>

    <h6>${expense.approvedBy || "N/A"}</h6>
</div>

                    <div class="col-md-6">
                        <small class="text-muted">Remark</small>
                        <h6>${expense.remark || "N/A"}</h6>
                    </div>

                </div>

            </div>
        </div>
        `
    }

</div>
`;

    new bootstrap.Modal(
      document.getElementById("viewModal")
    ).show();
}

//this function is used to filter if all button is clicked it show all task pending means pending alone
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


/// this fnction is used to count the task and display in cards

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

///this function is used for filter by using task name start date and end date 
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
// used the clear all the inputs
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

//used to show remark modal when we click approve or reject
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
 //once we save the decison it update the status and other details
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
//enable tooltip
function enableTooltips(){
    const tooltipTriggerList=document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].forEach(el =>{
     new bootstrap.Tooltip(el);
    })
}

//logout button
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

        window.location.href = "../Main/index.html";
    }
});

//format date

function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

//captilize word

function capitalizeWords(text) {
    return text
        ?.toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase()) || "";
}