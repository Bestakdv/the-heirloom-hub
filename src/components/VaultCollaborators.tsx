
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Mail, Trash2, Eye, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type CollaborationPermission = Database['public']['Enums']['collaboration_permission'];

interface Collaborator {
  id: string;
  vault_id: string;
  user_id: string;
  permission: CollaborationPermission;
  invited_by: string;
  invited_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
  } | null;
}

interface VaultCollaboratorsProps {
  vault: any;
  isOwner: boolean;
  user: any;
}

const VaultCollaborators = ({ vault, isOwner, user }: VaultCollaboratorsProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<CollaborationPermission>("view_only");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vault?.id) {
      fetchCollaborators();
    }
  }, [vault?.id]);

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_collaborators')
        .select(`
          *,
          profiles!vault_collaborators_user_id_fkey (
            id,
            full_name
          )
        `)
        .eq('vault_id', vault.id);

      if (error) throw error;
      setCollaborators((data || []) as Collaborator[]);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error("Failed to load collaborators");
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // First, try to find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', inviteEmail) // This won't work for email lookup
        .single();

      // For now, we'll create the invitation with email and let the user know
      // In a real app, you'd want to send an email invitation
      toast.info("User invitation feature needs email integration. For now, share the vault ID directly with users.");
      
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInvitePermission("view_only");
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error("Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('vault_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      toast.success("Collaborator removed successfully");
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error("Failed to remove collaborator");
    }
  };

  const handleUpdatePermission = async (collaboratorId: string, newPermission: CollaborationPermission) => {
    try {
      const { error } = await supabase
        .from('vault_collaborators')
        .update({ permission: newPermission })
        .eq('id', collaboratorId);

      if (error) throw error;

      setCollaborators(collaborators.map(c => 
        c.id === collaboratorId ? { ...c, permission: newPermission } : c
      ));
      toast.success("Permission updated successfully");
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error("Failed to update permission");
    }
  };

  if (!isOwner && collaborators.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-amber-900">Vault Collaborators</CardTitle>
            <CardDescription>
              Manage who can access and contribute to this vault
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Collaborator</DialogTitle>
                  <DialogDescription>
                    Invite someone to collaborate on this vault
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="permission">Permission</Label>
                    <Select value={invitePermission} onValueChange={(value: CollaborationPermission) => setInvitePermission(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view_only">View Only</SelectItem>
                        <SelectItem value="view_and_add">View & Add Stories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsInviteModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      disabled={loading}
                    >
                      {loading ? "Inviting..." : "Send Invite"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <p className="text-amber-600 text-center py-4">
            No collaborators yet. {isOwner ? "Invite someone to get started!" : ""}
          </p>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">
                      {collaborator.profiles?.full_name || "User"}
                    </p>
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      {collaborator.permission === 'view_only' ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Can view stories
                        </>
                      ) : (
                        <>
                          <Edit className="w-3 h-3" />
                          Can view & add stories
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={collaborator.permission}
                      onValueChange={(value: CollaborationPermission) => handleUpdatePermission(collaborator.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view_only">View Only</SelectItem>
                        <SelectItem value="view_and_add">View & Add</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this collaborator? They will no longer be able to access this vault.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VaultCollaborators;
