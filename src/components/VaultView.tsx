import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Calendar, Camera, Mic, FileText, Trash2, Bot, Users } from "lucide-react";
import CreateStoryModal from "./CreateStoryModal";
import StoryDetailModal from "./StoryDetailModal";
import AIChatBot from "./AIChatBot";
import VaultCollaborators from "./VaultCollaborators";
import { toast } from "sonner";


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
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPermission, setUserPermission] = useState(null);

  const isOwner = vault?.user_id === user?.id;

  // Fetch stories from Supabase
  useEffect(() => {
    if (vault?.id && user?.id) {
      fetchStories();
      checkUserPermission();
    }
  }, [vault?.id, user?.id]);

  const checkUserPermission = async () => {
    if (isOwner) {
      setUserPermission('owner');
      return;
    }

    try {
      // Mock permission check - assume user has view_and_add permission
      setUserPermission('view_and_add');
    } catch (error) {
      console.error('Error checking user permission:', error);
    }
  };

  const fetchStories = async () => {
    try {
      // Mock stories data
      const mockStories = [
        {
          id: 'story-1',
          title: 'First Family Vacation',
          content: 'We went to the beach and had the most amazing time. The kids loved building sandcastles and playing in the waves.',
          author: 'Demo User',
          vault_id: vault.id,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [],
          audio_url: null
        },
        {
          id: 'story-2',
          title: 'Grandma\'s Recipe',
          content: 'Today I learned how to make Grandma\'s famous apple pie. The secret ingredient is a pinch of cinnamon and lots of love.',
          author: 'Demo User',
          vault_id: vault.id,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [],
          audio_url: null
        }
      ];
      
      setStories(mockStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (storyData: any) => {
    try {
      // Mock story creation
      const newStory = {
        id: `story-${Date.now()}`,
        title: storyData.title,
        content: storyData.content,
        author: user.user_metadata?.full_name || user.email,
        vault_id: vault.id,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: storyData.images || [],
        audio_url: storyData.audio_url || null
      };

      setStories([newStory, ...stories]);
      setIsCreateStoryModalOpen(false);
      onVaultUpdate();
      toast.success("Story added successfully!");
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error("Failed to add story");
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      // Mock story deletion
      setStories(stories.filter(story => story.id !== storyId));
      onVaultUpdate();
      toast.success("Story deleted successfully!");
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error("Failed to delete story");
    }
  };

  const canAddStories = isOwner || userPermission === 'view_and_add';

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
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-amber-900">{vault.name}</h1>
                {!isOwner && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {userPermission === 'view_and_add' ? 'Collaborator' : 'Viewer'}
                  </span>
                )}
              </div>
              <p className="text-amber-700">{vault.description}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCollaborators(!showCollaborators)}
                variant="outline"
                className="border-amber-600 text-amber-700 hover:bg-amber-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Collaborators
              </Button>
              <Button 
                onClick={() => setShowAIChat(!showAIChat)}
                variant="outline"
                className="border-amber-600 text-amber-700 hover:bg-amber-50"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              {canAddStories && (
                <Button 
                  onClick={() => setIsCreateStoryModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {showCollaborators && (
          <div className="mb-8">
            <VaultCollaborators 
              vault={vault}
              isOwner={isOwner}
              user={user}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Stories Section */}
          <div className={`${showAIChat ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            {stories.length === 0 ? (
              <Card className="text-center py-12 bg-white border-amber-200">
                <CardContent>
                  <FileText className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">No Stories Yet</h3>
                  <p className="text-amber-700 mb-6">
                    {canAddStories 
                      ? "Start preserving your family memories by adding your first story."
                      : "No stories have been added to this vault yet."
                    }
                  </p>
                  {canAddStories && (
                    <Button 
                      onClick={() => setIsCreateStoryModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Story
                    </Button>
                  )}
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
                          {(isOwner || story.user_id === user.id) && (
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
                          )}
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

      {canAddStories && (
        <CreateStoryModal 
          isOpen={isCreateStoryModalOpen}
          onClose={() => setIsCreateStoryModalOpen(false)}
          onCreateStory={handleCreateStory}
          userId={user.id}
        />
      )}

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
