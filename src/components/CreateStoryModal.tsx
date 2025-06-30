import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Camera, Mic, Upload, Play, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (storyData: any) => void;
}

const CreateStoryModal = ({ isOpen, onClose, onCreateStory }: CreateStoryModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as string[],
    audioUrl: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a story title");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onCreateStory(formData);
      setFormData({ title: "", content: "", images: [], audioUrl: null });
      setIsLoading(false);
    }, 500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Create object URLs from the actual files
      const newImages = Array.from(files).map((file) => 
        URL.createObjectURL(file)
      );
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
      toast.success(`${files.length} image(s) added`);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index];
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(imageToRemove);
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        setFormData({ ...formData, audioUrl });
        toast.success("Audio recording saved!");
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (err) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const removeAudio = () => {
    if (formData.audioUrl) {
      URL.revokeObjectURL(formData.audioUrl);
    }
    setFormData({ ...formData, audioUrl: null });
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    // Clean up object URLs when closing
    formData.images.forEach(imageUrl => {
      URL.revokeObjectURL(imageUrl);
    });
    if (formData.audioUrl) {
      URL.revokeObjectURL(formData.audioUrl);
    }
    setFormData({ title: "", content: "", images: [], audioUrl: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-amber-600" />
            <DialogTitle className="text-2xl text-amber-900">Add New Story</DialogTitle>
          </div>
          <p className="text-amber-700">
            Share a precious family memory with photos and recordings.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="story-title">Story Title</Label>
            <Input
              id="story-title"
              type="text"
              placeholder="e.g., Grandpa's 90th Birthday"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="story-content">Story Content</Label>
            <Textarea
              id="story-content"
              placeholder="Tell your story here..."
              className="min-h-[120px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>Photos</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Upload ${index + 1}`} 
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio Recording Section */}
          <div className="space-y-3">
            <Label>Audio Recording</Label>
            {!formData.audioUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full ${isRecording ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50'}`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded border border-amber-200">
                <audio controls className="flex-1">
                  <source src={formData.audioUrl} type="audio/wav" />
                </audio>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAudio}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
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
              {isLoading ? "Adding Story..." : "Add Story"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
