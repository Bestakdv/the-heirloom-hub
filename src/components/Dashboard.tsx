
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, LogOut, Users, Calendar, FileText, Trash2, MoreVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CreateVaultModal from "./CreateVaultModal";
import VaultView from "./VaultView";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const { signOut } = useAuth();
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch vaults from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchVaults();
    }
  }, [user?.id]);

  const fetchVaults = async () => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVaults(data || []);
    } catch (error) {
      console.error('Error fetching vaults:', error);
      toast.error("Failed to load vaults");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVault = async (vaultData: any) => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .insert([{
          ...vaultData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setVaults([data, ...vaults]);
      setIsCreateVaultModalOpen(false);
      toast.success("Family vault created successfully!");
    } catch (error) {
      console.error('Error creating vault:', error);
      toast.error("Failed to create vault");
    }
  };

  const handleDeleteVault = async (vaultId: string) => {
    try {
      const { error } = await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId);

      if (error) throw error;

      setVaults(vaults.filter(vault => vault.id !== vaultId));
      if (selectedVault && selectedVault.id === vaultId) {
        setSelectedVault(null);
      }
      toast.success("Vault deleted successfully!");
    } catch (error) {
      console.error('Error deleting vault:', error);
      toast.error("Failed to delete vault");
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  if (selectedVault) {
    return (
      <VaultView 
        vault={selectedVault} 
        onBack={() => setSelectedVault(null)}
        user={user}
        onVaultUpdate={fetchVaults}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-amber-600">Loading your vaults...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-600" />
            <h1 className="text-2xl font-bold text-amber-900">The Heirloom Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-700">Welcome, {user.user_metadata?.full_name || user.email}!</span>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-amber-600 text-amber-700 hover:bg-amber-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">Your Family Vaults</h2>
          <p className="text-amber-700">
            Organize and preserve your family stories in dedicated vaults. Each vault can contain unlimited stories, photos, and recordings.
          </p>
        </div>

        <div className="mb-8">
          <Button 
            onClick={() => setIsCreateVaultModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Vault
          </Button>
        </div>

        {vaults.length === 0 ? (
          <Card className="text-center py-12 bg-white border-amber-200">
            <CardContent>
              <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">No Family Vaults Yet</h3>
              <p className="text-amber-700 mb-6">
                Create your first family vault to start preserving your precious memories.
              </p>
              <Button 
                onClick={() => setIsCreateVaultModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Vault
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <Card 
                key={vault.id} 
                className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
              >
                <div className="absolute top-3 right-3 z-10">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vault</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{vault.name}"? This will permanently delete the vault and all its stories. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteVault(vault.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedVault(vault)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-amber-900 mb-2">
                          {vault.name}
                        </CardTitle>
                        <CardDescription className="text-amber-700">
                          {vault.description}
                        </CardDescription>
                      </div>
                      <Users className="w-6 h-6 text-amber-600 flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-amber-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{vault.story_count} stories</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(vault.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreateVaultModal 
        isOpen={isCreateVaultModalOpen}
        onClose={() => setIsCreateVaultModalOpen(false)}
        onCreateVault={handleCreateVault}
      />
    </div>
  );
};

export default Dashboard;
