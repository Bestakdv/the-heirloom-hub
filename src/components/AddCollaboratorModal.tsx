
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultName: string;
  onCollaboratorAdded: () => void;
}

const AddCollaboratorModal = ({ isOpen, onClose, vaultId, vaultName, onCollaboratorAdded }: AddCollaboratorModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view_only" | "view_and_add">("view_only");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, find the user by email in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email) // For now, we'll use ID directly - in a real app you'd search by email
        .single();

      if (profileError) {
        toast.error("User not found. Please check the user ID.");
        setIsLoading(false);
        return;
      }

      // Add collaborator with the current user as the inviter
      const { data, error } = await supabase
        .from('vault_collaborators')
        .insert({
          vault_id: vaultId,
          user_id: profileData.id,
          invited_by: user?.id || '',
          permission: permission
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error("This user is already a collaborator on this vault");
        } else {
          throw error;
        }
      } else {
        toast.success(`Collaborator added to ${vaultName}!`);
        onCollaboratorAdded();
        handleClose();
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error("Failed to add collaborator. Please check the user ID.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPermission("view_only");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserPlus className="w-6 h-6 text-amber-600" />
            <DialogTitle className="text-2xl text-amber-900">Add Collaborator</DialogTitle>
          </div>
          <p className="text-amber-700">
            Invite someone to collaborate on "{vaultName}"
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collaborator-email">User ID</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="collaborator-email"
                type="text"
                placeholder="Enter user ID"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="permission">Permission Level</Label>
            <Select value={permission} onValueChange={(value: "view_only" | "view_and_add") => setPermission(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view_only">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">View Only</span>
                    <span className="text-sm text-gray-500">Can view stories but cannot add new ones</span>
                  </div>
                </SelectItem>
                <SelectItem value="view_and_add">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">View & Add</span>
                    <span className="text-sm text-gray-500">Can view and add new stories</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Collaborator"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollaboratorModal;
