"use client";

import { useState, useEffect } from "react";
import { removeToken } from "@/lib/token";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { journalEntries: number };
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, []);

  async function fetchAccount() {
    try {
      const res = await api.get("/api/account");
      setUser(res.data.user)
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/api/account/password", { currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || "Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await api.get("/api/account/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moodmatch-journal-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    setExportLoading(false);
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      await api.delete("/api/account", { data: { password: deletePassword } });
      removeToken();
      await signOut({ callbackUrl: "/login" });
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || "Something went wrong");
    }
    setDeleteLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[80%] max-w-6xl mx-auto mt-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account Info</h1>
        <p className="text-muted-foreground">Manage your settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Name</span><span>{user?.name}</span></div>
            <div className="flex justify-between"><span>Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span>Member since</span><span>{new Date(user?.createdAt ?? "").toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span>Entries</span><span>{user?._count.journalEntries}</span></div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Change Password</h2>
          <div className="space-y-3">
            <Input placeholder="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input placeholder="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}

            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2">Export Data</h2>
          <p className="text-muted-foreground text-sm mb-4">Download your journal data.</p>
          <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? "Exporting..." : "Download JSON"}
          </Button>
        </div>

        {/* Danger */}
        <div className="bg-card border border-red-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-500 mb-2">Account Deletion</h2>
          <p className="text-muted-foreground text-sm mb-4">Delete account permanently.</p>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Enter password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />

          {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}