import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useMessageStore } from "../store/useMessageStore";

const MAX_BIO_LENGTH = 500;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function SettingsPage() {
  const {
    authUser,
    theme,
    updateProfileDetails,
    updateProfile,
    removeProfileImage,
    deleteAccount,
    logout,
    changePassword,
    updateThemePreference
  } = useAuthStore();
  const { blockedUsers, fetchBlockedUsersDetailed, unblockUser, isBlockedUsersLoading } = useMessageStore();

  const [fullName, setFullName] = useState(authUser?.fullName ?? "");
  const [username, setUsername] = useState(authUser?.username ?? "");
  const [bio, setBio] = useState(authUser?.bio ?? "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const confirmInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFullName(authUser?.fullName ?? "");
    setUsername(authUser?.username ?? "");
    setBio(authUser?.bio ?? "");
  }, [authUser]);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  useEffect(() => {
    fetchBlockedUsersDetailed();
  }, [fetchBlockedUsersDetailed]);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    if (showDeleteModal) {
      confirmInputRef.current?.focus();
    }
  }, [showDeleteModal]);

  const bioCount = useMemo(() => bio.length, [bio]);
  const bioTooLong = bioCount > MAX_BIO_LENGTH;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be 2MB or smaller");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);

    const formData = new FormData();
    formData.append("profilePic", file);

    setIsUploading(true);
    await updateProfile(formData);
    setIsUploading(false);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await updateProfileDetails({ fullName, username });
    setIsSavingProfile(false);
  };

  const handleSaveBio = async () => {
    if (bioTooLong) return;
    setIsSavingBio(true);
    await updateProfileDetails({ bio });
    setIsSavingBio(false);
  };

  const handleRemovePhoto = async () => {
    if (!authUser?.profilePic && !selectedImage) {
      toast.error("You have not set a profile picture");
      return;
    }
    setSelectedImage(null);
    setIsUploading(true);
    await removeProfileImage();
    setIsUploading(false);
  };

  const validatePasswordForm = () => {
    const errors: typeof passwordErrors = {};
    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      errors.newPassword = "Must be 8+ chars with a letter and a number";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    setIsChangingPassword(true);
    const success = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword
    });
    setIsChangingPassword(false);
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }
    if (!deletePassword) {
      toast.error("Password is required");
      return;
    }
    setIsDeleting(true);
    const success = await deleteAccount({ password: deletePassword, confirm: deleteConfirm });
    setIsDeleting(false);
    if (success) {
      setShowDeleteModal(false);
      await logout();
    }
  };

  const handleThemeSave = async () => {
    setIsUpdatingTheme(true);
    await updateThemePreference(selectedTheme);
    setIsUpdatingTheme(false);
  };

  const formatBlockedAt = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleModalKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setShowDeleteModal(false);
      return;
    }
    if (event.key !== "Tab" || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      "input, button, [href], textarea, select, [tabindex]:not([tabindex='-1'])"
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto space-y-6 pb-10">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-slate-300 hover:text-slate-100 transition-colors"
        aria-label="Back to main page"
      >
        Back
      </Link>
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
        <h2 className="text-slate-100 text-lg font-semibold">Profile</h2>
        <p className="text-slate-400 text-sm mt-1">Update your basic info and photo.</p>

        <div className="mt-4 flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="size-24 rounded-full overflow-hidden border border-slate-700">
              <img
                src={selectedImage || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 text-xs rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 min-h-[44px]"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Change"}
              </button>
              <button
                className="px-3 py-2 text-xs rounded-md border border-slate-700 text-slate-300 hover:border-slate-500 min-h-[44px]"
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                Remove
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Display name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={50}
                className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                placeholder="optional"
                className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
              Email
              <input
                type="email"
                value={authUser?.email ?? ""}
                disabled
                className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 min-h-[44px]"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
        <h2 className="text-slate-100 text-lg font-semibold">Bio</h2>
        <p className="text-slate-400 text-sm mt-1">Let others know a bit about you.</p>

        <div className="mt-4">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={MAX_BIO_LENGTH}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
          />
          <div className={`text-xs mt-2 ${bioTooLong ? "text-red-400" : "text-slate-400"}`}>
            {bioCount}/{MAX_BIO_LENGTH}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 min-h-[44px]"
            onClick={handleSaveBio}
            disabled={isSavingBio || bioTooLong}
          >
            {isSavingBio ? "Saving..." : "Save Bio"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
        <h2 className="text-slate-100 text-lg font-semibold">Security</h2>
        <p className="text-slate-400 text-sm mt-1">Change your account password.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
            />
            {passwordErrors.currentPassword && (
              <span className="text-xs text-red-400">{passwordErrors.currentPassword}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
            />
            {passwordErrors.newPassword && (
              <span className="text-xs text-red-400">{passwordErrors.newPassword}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
            />
            {passwordErrors.confirmPassword && (
              <span className="text-xs text-red-400">{passwordErrors.confirmPassword}</span>
            )}
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 min-h-[44px]"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Saving..." : "Change Password"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
        <h2 className="text-slate-100 text-lg font-semibold">Appearance</h2>
        <p className="text-slate-400 text-sm mt-1">Choose your theme.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Theme
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as "WHITE_BLUE" | "BLACK_GREEN")}
              className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
            >
              <option value="WHITE_BLUE">Blue Mist (Light)</option>
              <option value="BLACK_GREEN">Black &amp; Green</option>
            </select>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 rounded-full border border-slate-700 bg-white"></span>
              <span className="inline-flex size-6 rounded-full border border-slate-700 bg-blue-600"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 rounded-full border border-slate-700 bg-black"></span>
              <span className="inline-flex size-6 rounded-full border border-slate-700 bg-green-500"></span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 min-h-[44px]"
            onClick={handleThemeSave}
            disabled={isUpdatingTheme}
          >
            {isUpdatingTheme ? "Saving..." : "Save Theme"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-red-500/30 rounded-xl p-5">
        <h2 className="text-red-200 text-lg font-semibold">Danger Zone</h2>
        <p className="text-slate-400 text-sm mt-1">Deleting your account is permanent.</p>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-red-500 text-slate-950 hover:bg-red-400 min-h-[44px]"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
        <h2 className="text-slate-100 text-lg font-semibold">Blocked Users</h2>
        <p className="text-slate-400 text-sm mt-1">Manage who you have blocked.</p>

        <div className="mt-4 space-y-3">
          {isBlockedUsersLoading && (
            <p className="text-sm text-slate-400">Loading blocked users...</p>
          )}
          {!isBlockedUsersLoading && blockedUsers.length === 0 && (
            <p className="text-sm text-slate-400">You haven't blocked anyone.</p>
          )}
          {!isBlockedUsersLoading &&
            blockedUsers.map((user) => (
              <div
                key={user.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-full overflow-hidden bg-slate-700">
                    <img
                      src={user.avatarUrl || "/avatar.png"}
                      alt={user.displayName}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-100 text-sm font-medium truncate">
                      {user.displayName}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {user.username ? `@${user.username}` : "No username"}
                    </p>
                    {user.blockedAt && (
                      <p className="text-slate-500 text-xs">
                        Blocked {formatBlockedAt(user.blockedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  className="px-3 py-2 text-xs rounded-md border border-slate-700 text-slate-300 hover:border-slate-500 min-h-[44px]"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Unblock ${user.username ? `@${user.username}` : user.displayName}?`
                    );
                    if (!confirmed) return;
                    await unblockUser(user.userId);
                  }}
                >
                  Unblock
                </button>
              </div>
            ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            ref={modalRef}
            onKeyDown={handleModalKeyDown}
            className="w-[92%] max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-slate-100 text-lg font-semibold">Confirm deletion</h3>
            <p className="text-slate-400 text-sm">
              Type <span className="text-red-300 font-semibold">DELETE</span> to confirm.
            </p>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Confirmation
              <input
                ref={confirmInputRef}
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Password
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-slate-700 text-slate-300 hover:border-slate-500 min-h-[44px]"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-500 text-slate-950 hover:bg-red-400 disabled:opacity-50 min-h-[44px]"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
