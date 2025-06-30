import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Calendar, Camera, Mic, FileText, Trash2, Bot } from "lucide-react";
import CreateStoryModal from "./CreateStoryModal";
import StoryDetailModal from "./StoryDetailModal";
import AIChatBot from "./AIChatBot";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VaultViewProps {
  vault: any;
  onBack: () => void;
  user: any;
  onVaultUpdate: () => void;
}

const VaultView = ({ vault, onBack, user, onVaultUpdate }: VaultViewProps) => {
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stories from Supabase
  useEffect(() => {
    if (vault?.id && user?.id) {
      fetchStories();
    }
  }, [vault?.id, user?.id]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('vault_id', vault.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (storyData: any) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{
          ...storyData,
          vault_id: vault.id,
          user_id: user.id,
          author: user.user_metadata?.full_name || user.email
        }])
        .select()
        .single();

      if (error) throw error;

      setStories([data, ...stories]);
      setIsCreateStoryModalOpen(false);
      onVaultUpdate(); // Update vault story count
      toast.success("Story added successfully!");
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error("Failed to add story");
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      setStories(stories.filter(story => story.id !== storyId));
      onVaultUpdate(); // Update vault story count
      toast.success("Story deleted successfully!");
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error("Failed to delete story");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-amber-600">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-amber-700 hover:bg-amber-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vaults
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-900">{vault.name}</h1>
              <p className="text-amber-700">{vault.description}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAIChat(!showAIChat)}
                variant="outline"
                className="border-amber-600 text-amber-700 hover:bg-amber-50"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              <Button 
                onClick={() => setIsCreateStoryModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Stories Section */}
          <div className={`${showAIChat ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            {stories.length === 0 ? (
              <Card className="text-center py-12 bg-white border-amber-200">
                <CardContent>
                  <FileText className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">No Stories Yet</h3>
                  <p className="text-amber-700 mb-6">
                    Start preserving your family memories by adding your first story.
                  </p>
                  <Button 
                    onClick={() => setIsCreateStoryModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Story
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-amber-900">
                    Stories ({stories.length})
                  </h2>
                </div>

                <div className="grid gap-6">
                  {stories.map((story) => (
                    <Card 
                      key={story.id} 
                      className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedStory(story)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-amber-900 mb-2">
                              {story.title}
                            </CardTitle>
                            <CardDescription className="text-amber-700 line-clamp-2">
                              {story.content}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStory(story.id);
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-amber-600">
                          <div className="flex items-center gap-4">
                            {story.images && story.images.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Camera className="w-4 h-4" />
                                <span>{story.images.length} photo{story.images.length > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {story.audio_url && (
                              <div className="flex items-center gap-1">
                                <Mic className="w-4 h-4" />
                                <span>Audio</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span>By {story.author}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(story.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Chat Section */}
          {showAIChat && (
            <div className="lg:col-span-1">
              <AIChatBot 
                vaultName={vault.name} 
                vaultId={vault.id}
                userId={user.id}
              />
            </div>
          )}
        </div>
      </main>

      <CreateStoryModal 
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
        onCreateStory={handleCreateStory}
        userId={user.id}
      />

      {selectedStory && (
        <StoryDetailModal 
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
};

export default VaultView;
