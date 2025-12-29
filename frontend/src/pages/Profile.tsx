import { useEffect, useState } from "react";
import { Phone, Mail, CalendarClock, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { userApi } from "@/services";
import { formatPhoneNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          View your account details and update your contact number
        </p>
      </div>

      <div className="w-full">
        <div
          className="relative w-full"
          style={{ perspective: "1500px", minHeight: "450px" }}
        >
          <div
            className="relative w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: isEditing ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.9s ease-in-out",
            }}
          >
            {/* Front Side - Profile Overview */}
            <div
              className="w-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        <AvatarImage
                          src={user.profile_picture ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="text-2xl font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">
                          {user.name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={user.is_admin ? "default" : "secondary"}
                            className="text-sm px-3 py-1"
                          >
                            {user.is_admin ? "Administrator" : "User"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="default"
                      size="lg"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  <Separator className="mb-8" />

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="w-5 h-5" /> Email Address
                      </Label>
                      <p className="text-base font-semibold break-words">
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="w-5 h-5" /> Phone Number
                      </Label>
                      <p className="text-base font-semibold">
                        {formatPhoneNumber(user.phone_number)}
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CalendarClock className="w-5 h-5" /> Member Since
                      </Label>
                      <p className="text-base font-semibold">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Back Side - Edit Form */}
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Edit Profile
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Update your name and phone number below.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-base font-medium">
                        Full name
                      </Label>
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
                        required
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-base font-medium">
                        Phone number
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="rounded-md border bg-muted px-4 py-3 text-base font-medium text-muted-foreground">
                          +91
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter 10 digits"
                          value={formData.phone_number}
                          onChange={(event) =>
                            handlePhoneChange(event.target.value)
                          }
                          className="h-12 text-base"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Keep this empty if you don&apos;t want to add it yet.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
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
                      <Button type="submit" disabled={saving} size="lg">
                        {saving ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
