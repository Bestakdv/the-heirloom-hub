import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Camera, Mic, Upload, Play, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { storySchema, sanitizeHtml, validateImageFile, validateImageArray } from "@/lib/validation";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimiting";
import { logRateLimitExceeded, logFileUploadBlocked } from "@/lib/securityLogger";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (storyData: any) => void;
  userId: string;
  editingStory?: any;
}

const CreateStoryModal = ({ isOpen, onClose, onCreateStory, userId, editingStory }: CreateStoryModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as string[],
    audio_url: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize form data when editing
  useEffect(() => {
    if (editingStory) {
      setFormData({
        title: editingStory.title || "",
        content: editingStory.content || "",
        images: editingStory.images || [],
        audio_url: editingStory.audio_url || null
      });
    } else {
      setFormData({
        title: "",
        content: "",
        images: [],
        audio_url: null
      });
    }
  }, [editingStory]);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      // Validate file before upload
      const fileValidation = validateImageFile(file);
      if (!fileValidation.valid) {
        logFileUploadBlocked(fileValidation.error!, file.name, userId);
        toast.error(`${file.name}: ${fileValidation.error}`);
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('story-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const uploadAudioToStorage = async (file: File | Blob, isRecording = false): Promise<string | null> => {
    try {
      const fileName = `${userId}/audio_${Date.now()}.${isRecording ? 'wav' : (file instanceof File ? file.name?.split('.').pop() : 'mp3') || 'mp3'}`;
      
      const { data, error } = await supabase.storage
        .from('story-images')
        .upload(fileName, file);

      if (error) {
        console.error('Audio upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error("Failed to upload audio");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const rateLimitCheck = checkRateLimit('STORY_CREATE', userId);
    if (!rateLimitCheck.allowed) {
      toast.error(rateLimitCheck.message);
      logRateLimitExceeded('STORY_CREATE', userId);
      return;
    }
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate input data
    try {
      const validatedData = storySchema.parse({
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: "Story Author", // Default author for stories
      });
      
      // Validate images array
      const imageValidation = validateImageArray(formData.images);
      if (!imageValidation.valid) {
        toast.error(imageValidation.error);
        return;
      }
      
      // Sanitize content
      const sanitizedContent = sanitizeHtml(validatedData.content);
      
      setIsLoading(true);
      
      const storyData = {
        ...formData,
        title: validatedData.title,
        content: sanitizedContent
      };
      
      await onCreateStory(storyData);
      setFormData({ title: "", content: "", images: [], audio_url: null });
      setValidationErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        toast.error("Please fix the validation errors");
      } else {
        console.error('Error in modal:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check rate limit
    const rateLimitCheck = checkRateLimit('IMAGE_UPLOAD', userId);
    if (!rateLimitCheck.allowed) {
      toast.error(rateLimitCheck.message);
      logRateLimitExceeded('IMAGE_UPLOAD', userId);
      return;
    }

    // Validate file count
    if (formData.images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed per story");
      return;
    }

    setIsUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const url = await uploadImageToStorage(file);
        if (url) {
          newImageUrls.push(url);
        }
      }

      if (newImageUrls.length > 0) {
        setFormData({ ...formData, images: [...formData.images, ...newImageUrls] });
        toast.success(`${newImageUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error("Failed to upload some images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast.error("Please select an audio file");
      return;
    }

    setIsUploading(true);
    try {
      const audioUrl = await uploadAudioToStorage(file);
      if (audioUrl) {
        setFormData({ ...formData, audio_url: audioUrl });
        toast.success("Audio file uploaded successfully!");
      }
    } catch (error) {
      console.error('Error uploading audio file:', error);
      toast.error("Failed to upload audio file");
    } finally {
      setIsUploading(false);
      // Reset the input
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        
        // Upload to storage
        const audioUrl = await uploadAudioToStorage(blob, true);
        if (audioUrl) {
          setFormData({ ...formData, audio_url: audioUrl });
          toast.success("Audio recording uploaded successfully!");
        }
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
    setFormData({ ...formData, audio_url: null });
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    setFormData({ title: "", content: "", images: [], audio_url: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-amber-600" />
            <DialogTitle className="text-2xl text-amber-900">
              {editingStory ? "Edit Story" : "Add New Story"}
            </DialogTitle>
          </div>
          <p className="text-amber-700">
            {editingStory 
              ? "Update your family memory with photos and recordings."
              : "Share a precious family memory with photos and recordings."
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="story-title">Story Title</Label>
            <Input
              id="story-title"
              type="text"
              placeholder="e.g., Grandpa's 90th Birthday (max 200 characters)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
              required
              className={validationErrors.title ? "border-destructive" : ""}
            />
            {validationErrors.title && (
              <p className="text-sm text-destructive">{validationErrors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="story-content">Story Content</Label>
            <Textarea
              id="story-content"
              placeholder="Tell your story here... (max 100,000 characters)"
              className={`min-h-[120px] ${validationErrors.content ? "border-destructive" : ""}`}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              maxLength={100000}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{validationErrors.content && <span className="text-destructive">{validationErrors.content}</span>}</span>
              <span>{formData.content.length.toLocaleString()}/100,000 characters</span>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>Photos</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50"
              disabled={isUploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Add Photos"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground">
              Max 10 images, 5MB each. Supports JPEG, PNG, GIF, WebP. ({formData.images.length}/10)
            </p>
            
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

          {/* Audio Recording/Upload Section */}
          <div className="space-y-3">
            <Label>Audio Recording</Label>
            {!formData.audio_url ? (
              <div className="space-y-2">
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
                
                <div className="text-center text-amber-600 text-sm">or</div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full border-amber-300 hover:border-amber-400 hover:bg-amber-50"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Audio File"}
                </Button>
                
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded border border-amber-200">
                <audio controls className="flex-1">
                  <source src={formData.audio_url} type="audio/wav" />
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
              disabled={isLoading || isUploading}
            >
              {isLoading 
                ? (editingStory ? "Updating Story..." : "Adding Story...") 
                : (editingStory ? "Update Story" : "Add Story")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
