const API = "http://localhost:3000/users";

const emailRegex = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
const employeeRegex = /^\d{3}$/;

function setError(input, errorDiv, message) {
    $("#" + errorDiv).text(message);
    $(input).addClass("is-invalid").removeClass("is-valid");
}

function clearError(input, errorDiv) {
    $("#" + errorDiv).text("");
    $(input).addClass("is-valid").removeClass("is-invalid");
}

function validateEmpId() {
    const value = $("#empId").val().trim();
    if (value === "") {
        setError("#empId", "error-empId", "Employee ID is required");
        return false;
    }
    if (!employeeRegex.test(value)) {
        setError("#empId", "error-empId", "Employee ID must be 3 digits");
        return false;
    }
    clearError("#empId", "error-empId");
    return true;
}

function validateName() {
    const value = $("#fullName").val().trim();
    if (value === "") {
        setError("#fullName", "error-fullName", "Name is required");
        return false;
    }
    if (value.length < 3) {
        setError("#fullName", "error-fullName", "Minimum 3 characters required");
        return false;
    }
    clearError("#fullName", "error-fullName");
    return true;
}

function validateEmail() {
    const value = $("#email").val().trim();
    if (value === "") {
        setError("#email", "error-email", "Email is required");
        return false;
    }
    if (!emailRegex.test(value)) {
        setError("#email", "error-email", "Invalid Email");
        return false;
    }
    clearError("#email", "error-email");
    return true;
}

function validatePassword() {
    const value = $("#regPassword").val().trim();
    if (value === "") {
        setError("#regPassword", "error-password", "Password is required");
        return false;
    }
    if (!passRegex.test(value)) {
        setError("#regPassword", "error-password", "8+ chars, uppercase, lowercase, number & special char");
        return false;
    }
    clearError("#regPassword", "error-password");
    return true;
}

function validateConfirmPassword() {
    const password = $("#regPassword").val();
    const confirmPassword = $("#Confirmpassword").val();
    if (confirmPassword === "") {
        setError("#Confirmpassword", "error-confirmPassword", "Confirm Password is required");
        return false;
    }
    if (password !== confirmPassword) {
        setError("#Confirmpassword", "error-confirmPassword", "Passwords do not match");
        return false;
    }
    clearError("#Confirmpassword", "error-confirmPassword");
    return true;
}

function validateDOB() {
    const dobValue = $("#date").val();
    if (!dobValue) {
        setError("#date", "error-date", "Date of birth is required");
        return false;
    }
    const dob = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    if (age < 21) {
        setError("#date", "error-date", "You must be at least 21 years old to register");
        return false;
    }
    clearError("#date", "error-date");
    return true;
}

function validateDepartment() {
    const value = $("#department").val();
    if (!value) {
        setError("#department", "error-department", "Please select a department");
        return false;
    }
    clearError("#department", "error-department");
    return true;
}

function validateDesignation() {
    const value = $("#designation").val().trim();
    if (value === "") {
        setError("#designation", "error-designation", "Designation is required");
        return false;
    }
    clearError("#designation", "error-designation");
    return true;
}

function validateRole() {
    const value = $("#role").val();
    if (!value) {
        setError("#role", "error-role", "Please select a role");
        return false;
    }
    clearError("#role", "error-role");
    return true;
}

async function registerUser() {
    const isEmpIdValid = validateEmpId();
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isDobValid = validateDOB();
    const isDeptValid = validateDepartment();
    const isDesigValid = validateDesignation();
    const isRoleValid = validateRole();

    if (!isEmpIdValid || !isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isDobValid || !isDeptValid || !isDesigValid || !isRoleValid) {
        return;
    }

    const user = {
        employeeId: $("#empId").val().trim(),
        fullName: $("#fullName").val().trim(),
        email: $("#email").val().trim(),
        password: $("#regPassword").val(),
        dob: $("#date").val(),
        department: $("#department").val(),
        designation: $("#designation").val().trim(),
        gender: $("input[name='gender']:checked").val(),
        role: $("#role").val(),
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) throw new Error("Server error");

        Swal.fire({
            icon: "success",
            title: "Registration Successful!",
            text: "Your account has been created successfully.",
            confirmButtonColor: "#0d6efd"
        });

        $("#registerModal").modal("hide");
        $("#registerModal").find("input, select").val("");
        $("#registerModal").find("input, select").removeClass("is-valid is-invalid");
        $("#male").prop("checked", true);

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: "Make sure json-server is running on port 3000.",
            confirmButtonColor: "#dc3545"
        });
    }
}

async function loginUser() {
    const username = $("#name").val().trim();
    const password = $("#password").val().trim();

    if (username === "" || password === "") {
        Swal.fire({
            icon: "warning",
            title: "Fields Missing",
            text: "Please enter your username/email and password.",
            confirmButtonColor: "#ffc107"
        });
        return;
    }

    try {
        const response = await fetch(API);
        const users = await response.json();

        const user = users.find(
            u =>
                u.fullName === username &&
                u.password === password
        );

        if (!user) {
            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Invalid Credentials. Check your input and try again.",
                confirmButtonColor: "#dc3545"
            });
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));

        Swal.fire({
            icon: "success",
            title: "Welcome Back!",
            text: "Redirecting to your workspace...",
            timer: 1500,
            showConfirmButton: true
        }).then(() => {
            if (user.role === "Admin") {
                window.location.href = "../admin/admin.html";
            } else {
                window.location.href = "../user/user.html";
            }
        });

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Login Error",
            text: "Could not connect to authentication services.",
            confirmButtonColor: "#dc3545"
        });
    }
}

$("#empId").on("input", validateEmpId);
$("#fullName").on("input", validateName);
$("#email").on("input", validateEmail);
$("#regPassword").on("input", validatePassword);
$("#Confirmpassword").on("input", validateConfirmPassword);
$("#date").on("input change", validateDOB);
$("#department").on("change", validateDepartment);
$("#designation").on("input", validateDesignation);
$("#role").on("change", validateRole);

$("#registerModal .btn-primary").click(registerUser);
$("#loginModal .btn-primary").click(loginUser);