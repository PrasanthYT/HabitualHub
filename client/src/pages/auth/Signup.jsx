import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate(); // React Router hook for navigation

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    marketingAccept: false,
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    passwordConfirmation: false,
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    passwordConfirmation: false,
  });

  const [successMessages, setSuccessMessages] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    passwordConfirmation: false,
  });

  const [apiError, setApiError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSigninBtnClick = () => {
    navigate("/auth/signin"); // Using React Router to navigate to the signin page
  };

  const handleLogoClick = () => {
    navigate("/"); // Using React Router to navigate to the Home page
  };

  useEffect(() => {
    // Validate fields on form change
    const newErrors = {};
    const newSuccessMessages = {};

    // Validate firstName
    newErrors.firstName = formData.firstName === "";
    newSuccessMessages.firstName = formData.firstName !== "";

    // Validate lastName
    newErrors.lastName = formData.lastName === "";
    newSuccessMessages.lastName = formData.lastName !== "";

    // Validate email
    newErrors.email = !validateEmail(formData.email);
    newSuccessMessages.email = validateEmail(formData.email);

    // Validate password
    newErrors.password = !validatePassword(formData.password);
    newSuccessMessages.password = validatePassword(formData.password);

    // Validate password confirmation
    newErrors.passwordConfirmation =
      formData.password !== formData.passwordConfirmation;
    newSuccessMessages.passwordConfirmation =
      formData.password === formData.passwordConfirmation &&
      touched.passwordConfirmation;

    setErrors(newErrors);
    setSuccessMessages(newSuccessMessages);
  }, [formData, touched]);

  const isFormValid = Object.values(errors).every((error) => !error);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data for the API call
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    try {
      // Make the API call to register the user
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        userData
      );

      const jwtToken = response.data.token;
      sessionStorage.setItem("_token", jwtToken);

      // Redirect to the dashboard
      navigate("/dashboard"); // Using React Router to navigate to the dashboard page
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Error during registration:", error);
      setApiError(
        "There was an issue with your registration. Please try again."
      );
    }
  };

  return (
    <>
      <section className="bg-white">
        <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
          <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </aside>

          <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
            <div className="max-w-xl lg:max-w-3xl">
              <a className="block text-blue-600" onClick={handleLogoClick}>
                <span className="sr-only">Home</span>
                <svg
                  width="40"
                  height="16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 7.30156C0 3.54688 3.04688 0.5 6.80156 0.5C8.60625 0.5 10.3359 1.21719 11.6109 2.49219L15 5.87656L18.3844 2.49219C19.6641 1.21719 21.3937 0.5 23.1984 0.5C26.9531 0.5 30 3.54688 30 7.30156V8.69375C30 12.4531 26.9531 15.5 23.1984 15.5C21.3937 15.5 19.6641 14.7828 18.3891 13.5078L15 10.1234L11.6156 13.5078C10.3359 14.7828 8.60625 15.5 6.80156 15.5C3.04688 15.5 0 12.4531 0 8.69844V7.30156ZM12.8766 8L9.49219 4.61563C8.77969 3.90313 7.80938 3.5 6.80156 3.5C4.70156 3.5 3 5.20156 3 7.30156V8.69375C3 10.7937 4.70156 12.4953 6.80156 12.4953C7.80938 12.4953 8.77969 12.0969 9.49219 11.3797L12.8766 8ZM17.1188 8L20.5031 11.3844C21.2156 12.0969 22.1859 12.5 23.1937 12.5C25.2937 12.5 26.9953 10.7984 26.9953 8.69844V7.30156C26.9953 5.20156 25.2937 3.5 23.1937 3.5C22.1859 3.5 21.2156 3.89844 20.5031 4.61563L17.1234 8H17.1188Z"
                    fill="#4F46E5"
                  />
                </svg>
              </a>

              <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                Welcome to{" "}
                <span className="font-semibold text-indigo-600">
                  HabitualHub
                </span>{" "}
                🦑
              </h1>

              <p className="mt-4 leading-relaxed text-gray-500">
                HabitualHub is your go-to platform for managing and tracking
                your habits effectively. Organize, set reminders, and track
                progress to stay consistent and build meaningful habits.
              </p>
              <form
                onSubmit={handleSubmit}
                className="mt-8 grid grid-cols-6 gap-6"
              >
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="FirstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="FirstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm h-8 p-3 ${
                      successMessages.firstName
                        ? "border-green-500"
                        : touched.firstName && errors.firstName
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="First Name"
                  />
                  {touched.firstName &&
                    !successMessages.firstName &&
                    errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Oh, snap!</span> This
                        field is required.
                      </p>
                    )}
                  {successMessages.firstName && (
                    <p className="mt-2 text-sm text-green-600">
                      <span className="font-medium">Well done!</span> Success
                      input.
                    </p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="LastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="LastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm h-8 p-3 ${
                      successMessages.lastName
                        ? "border-green-500"
                        : touched.lastName && errors.lastName
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Last Name"
                  />
                  {touched.lastName &&
                    !successMessages.lastName &&
                    errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Oh, snap!</span> This
                        field is required.
                      </p>
                    )}
                  {successMessages.lastName && (
                    <p className="mt-2 text-sm text-green-600">
                      <span className="font-medium">Well done!</span> Success
                      input.
                    </p>
                  )}
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="Email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm h-8 p-3 ${
                      successMessages.email
                        ? "border-green-500"
                        : touched.email && errors.email
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Email"
                  />
                  {touched.email && !successMessages.email && errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      <span className="font-medium">Oh, snap!</span> Please
                      enter a valid email.
                    </p>
                  )}
                  {successMessages.email && (
                    <p className="mt-2 text-sm text-green-600">
                      <span className="font-medium">Well done!</span> Success
                      input.
                    </p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm h-8 p-3 ${
                      successMessages.password
                        ? "border-green-500"
                        : touched.password && errors.password
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Password"
                  />
                  {touched.password &&
                    !successMessages.password &&
                    errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Oh, snap!</span> Password
                        must be at least 8 characters, contain one number, and
                        one special character.
                      </p>
                    )}
                  {successMessages.password && (
                    <p className="mt-2 text-sm text-green-600">
                      <span className="font-medium">Well done!</span> Password
                      is strong.
                    </p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="PasswordConfirmation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="PasswordConfirmation"
                    name="passwordConfirmation"
                    value={formData.passwordConfirmation}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm h-8 p-3 ${
                      successMessages.passwordConfirmation
                        ? "border-green-500"
                        : touched.passwordConfirmation &&
                          errors.passwordConfirmation
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Confirm Password"
                  />
                  {touched.passwordConfirmation &&
                    !successMessages.passwordConfirmation &&
                    errors.passwordConfirmation && (
                      <p className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Oh, snap!</span> Passwords
                        do not match.
                      </p>
                    )}
                  {touched.passwordConfirmation &&
                    successMessages.passwordConfirmation && (
                      <p className="mt-2 text-sm text-green-600">
                        <span className="font-medium">Well done!</span>{" "}
                        Passwords match.
                      </p>
                    )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="MarketingAccept" className="flex gap-4">
                    <input
                      type="checkbox"
                      id="MarketingAccept"
                      name="marketingAccept"
                      checked={formData.marketingAccept}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marketingAccept: e.target.checked,
                        })
                      }
                      className="rounded-md border-gray-200 bg-white"
                    />
                    <span className="text-sm text-gray-700">
                      I want to receive emails about events, product updates,
                      and company announcements.
                    </span>
                  </label>
                </div>

                <div className="col-span-6">
                  <p className="text-sm text-gray-500">
                    By creating an account, you agree to our
                    <a href="#" className="text-gray-700 underline">
                      {" "}
                      terms and conditions{" "}
                    </a>
                    and
                    <a href="#" className="text-gray-700 underline">
                      {" "}
                      privacy policy{" "}
                    </a>
                    .
                  </p>
                </div>

                <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                  >
                    Create an account
                  </button>

                  {apiError && (
                    <div className="mt-4 text-sm text-red-600">
                      <p>{apiError}</p>
                    </div>
                  )}

                  <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                    Already have an account?
                    <a onClick={handleSigninBtnClick} className="text-gray-700 underline">
                      Log in
                    </a>
                    .
                  </p>
                </div>
              </form>
            </div>
          </main>
        </div>
      </section>
    </>
  );
}

export default Signup;
