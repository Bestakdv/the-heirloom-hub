
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, Camera, Mic, X } from "lucide-react";
import { useState } from "react";

interface StoryDetailModalProps {
  story: any;
  onClose: () => void;
}

const StoryDetailModal = ({ story, onClose }: StoryDetailModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-900 text-left">
              {story.title}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-amber-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{story.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(story.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Story Content */}
            {story.content && (
              <div className="prose prose-amber max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {story.content}
                </p>
              </div>
            )}

            {/* Images */}
            {story.images && story.images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-900">
                    Photos ({story.images.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {story.images.map((image: string, index: number) => (
                    <div 
                      key={index}
                      className="relative cursor-pointer group"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Story image ${index + 1}`}
                        className="w-full h-32 object-cover rounded border border-amber-200 group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio */}
            {story.audio_url && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-900">Audio Recording</h3>
                </div>
                <div className="bg-amber-50 p-4 rounded border border-amber-200">
                  <audio controls className="w-full">
                    <source src={story.audio_url} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && (
        <Dialog open={true} onOpenChange={() => setSelectedImageIndex(null)}>
          <DialogContent className="sm:max-w-5xl p-0 bg-black/90">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
              <img 
                src={story.images[selectedImageIndex]} 
                alt={`Story image ${selectedImageIndex + 1}`}
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-sm opacity-75">
                  {selectedImageIndex + 1} of {story.images.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default StoryDetailModal;
