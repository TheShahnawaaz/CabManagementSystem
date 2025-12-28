import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  ShieldCheck,
  User as UserIcon,
  CalendarClock,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { userApi } from "@/services";
import { formatPhoneNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    phone_number: user?.phone_number ?? "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone_number: user.phone_number ?? "",
      });
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        phone_number: formData.phone_number ? formData.phone_number : null,
      };

      const response = await userApi.updateProfile(payload);
      if (response.success) {
        toast.success("Profile updated successfully");
        await refetchUser();
        setIsEditing(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone_number: digits }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-primary" />
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            View your account details and update your contact number.
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="default">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>
                Core details about your account.
              </CardDescription>
            </div>
            {user.profile_picture && (
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.profile_picture} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <p className="text-sm font-medium break-words">{user.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Role
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant={user.is_admin ? "default" : "secondary"}>
                    {user.is_admin ? "Administrator" : "User"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Member since
                </Label>
                <p className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone number
                </Label>
                <p className="text-sm font-medium">
                  {formatPhoneNumber(user.phone_number)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Display name
              </Label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Only your name and phone number can be edited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex items-center gap-2">
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    +91
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter 10 digits"
                    value={formData.phone_number}
                    onChange={(event) => handlePhoneChange(event.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this empty if you don&apos;t want to add it yet.
                </p>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        phone_number: user.phone_number ?? "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
