"use client";

import { useEffect, useState, useCallback } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { getCurrentAdminUser, updateUserFields, UserUpdate } from "../../services/usersService";


export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<{ username: string; email: string; role: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  
  // Form input state for real-time validation
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Real-time validation state
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentAdminUser();
        setUser({ username: data.username, email: data.email, role: data.role, id: data.id });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load user info");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle input changes and validate in real-time
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
       let isValid = true;
      
       if (newData.username.length > 0 && newData.username.length < 5) {
        isValid = false;
      }
      
       if (newData.password.length > 0 && newData.password.length < 8) {
        isValid = false;
      }
      
       if (newData.email.length > 0 && !newData.email.includes('@')) {
        isValid = false;
      }
      
      setIsFormValid(isValid);
      return newData;
    });
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setFormError("");
    setFormSuccess("");
    
    const { username, email, password } = formData;
    
    // Validation
    if (username && username.length < 5) {
      setFormError("Username must be at least 5 characters.");
      return;
    }
    if (password && password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (email && !email.includes('@')) {
      setFormError("Please enter a valid email address.");
      return;
    }
    
    // Prepare update data - only include non-empty fields
    const updateData: UserUpdate = {};
    if (username && username.trim() !== "" && username.trim() !== user.username) {
      updateData.username = username.trim();
    }
    if (email && email.trim() !== "" && email.trim() !== user.email) {
      updateData.email = email.trim();
    }
    if (password && password.trim() !== "") {
      updateData.password = password;
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      setFormError("Please provide at least one field to update.");
      return;
    }
    
    setFormLoading(true);
    try {
      await updateUserFields(user.id, updateData);
      setFormSuccess("Profile updated successfully!");
      
      // Update local user state with new values
      setUser(prev => prev ? {
        ...prev,
        username: updateData.username || prev.username,
        email: updateData.email || prev.email,
      } : null);
      
      // Reset form
      setFormData({ username: "", email: "", password: "" });
      setIsFormValid(true);
      
      setTimeout(() => {
        closeModal();
        setFormSuccess("");
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to update profile.");
      }
    } finally {
      setFormLoading(false);
    }
  }, [formData, user, closeModal]);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold rounded-full border-2 border-white shadow-lg dark:border-gray-700">
              {user ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="order-3 xl:order-2">
              {loading ? (
                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">Loading...</h4>
              ) : error ? (
                <h4 className="mb-2 text-lg font-semibold text-center text-red-600 xl:text-left">{error}</h4>
              ) : user ? (
                <>
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {user.username}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </>
              ) : null}
            </div>
            
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
             
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Username (Optional)</Label>
                    <input
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={`Current: ${user?.username || 'Loading...'}`}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className={`mt-1 text-xs ${formData.username.length > 0 && formData.username.length < 5 ? 'text-red-500' : 'text-gray-400'}`}>
                      Username must be at least 5 characters if provided
                    </p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Role (Read-only)</Label>
                    <Input 
                      type="text" 
                      defaultValue={user?.role || ""} 
                      disabled
                      className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-400">Role cannot be changed</p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address (Optional)</Label>
                    <input
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={`Current: ${user?.email || 'Loading...'}`}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className={`mt-1 text-xs ${formData.email.length > 0 && !formData.email.includes('@') ? 'text-red-500' : 'text-gray-400'}`}>
                      Enter a valid email address if provided
                    </p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>New Password (Optional)</Label>
                    <input
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password or leave empty"
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className={`mt-1 text-xs ${formData.password.length > 0 && formData.password.length < 8 ? 'text-red-500' : 'text-gray-400'}`}>
                      Password must be at least 8 characters if provided
                    </p>
                  </div>
                </div>
                
                {formError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">{formSuccess}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={formLoading}>
                Close
              </Button>
              <button 
                type="submit" 
                disabled={formLoading || !isFormValid}
                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  formLoading || !isFormValid
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {formLoading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
