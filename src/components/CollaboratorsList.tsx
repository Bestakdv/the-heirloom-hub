
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, UserMinus, Eye, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Collaborator {
  id: string;
  user_id: string;
  permission: "view_only" | "view_and_add";
  created_at: string;
  user_profile?: {
    full_name: string | null;
  };
}

interface CollaboratorsListProps {
  vaultId: string;
  isOwner: boolean;
  onCollaboratorRemoved: () => void;
}

const CollaboratorsList = ({ vaultId, isOwner, onCollaboratorRemoved }: CollaboratorsListProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, [vaultId]);

  const fetchCollaborators = async () => {
    try {
      // First get collaborators
      const { data: collaboratorData, error: collaboratorError } = await supabase
        .from('vault_collaborators')
        .select('*')
        .eq('vault_id', vaultId)
        .order('created_at', { ascending: false });

      if (collaboratorError) throw collaboratorError;

      // Then get profile information for each collaborator
      const collaboratorsWithProfiles = await Promise.all(
        (collaboratorData || []).map(async (collaborator) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', collaborator.user_id)
            .single();

          return {
            ...collaborator,
            user_profile: profileError ? null : profile
          };
        })
      );

      setCollaborators(collaboratorsWithProfiles);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error("Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('vault_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      onCollaboratorRemoved();
      toast.success("Collaborator removed successfully");
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error("Failed to remove collaborator");
    }
  };

  const getPermissionIcon = (permission: string) => {
    return permission === 'view_and_add' ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />;
  };

  const getPermissionColor = (permission: string) => {
    return permission === 'view_and_add' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <Card className="bg-white border-amber-200">
        <CardContent className="p-6">
          <div className="text-center text-amber-600">Loading collaborators...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Users className="w-5 h-5" />
          Collaborators ({collaborators.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <div className="text-center py-4 text-amber-600">
            No collaborators yet. Invite someone to help preserve your family stories!
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div 
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-900">
                      {collaborator.user_profile?.full_name || "Unknown User"}
                    </div>
                    <div className="text-sm text-amber-600">
                      Added {new Date(collaborator.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`${getPermissionColor(collaborator.permission)} flex items-center gap-1`}
                  >
                    {getPermissionIcon(collaborator.permission)}
                    {collaborator.permission === 'view_and_add' ? 'View & Add' : 'View Only'}
                  </Badge>
                  
                  {isOwner && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4" />
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
                            onClick={() => removeCollaborator(collaborator.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorsList;
