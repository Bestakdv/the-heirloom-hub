
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, FileText } from "lucide-react";
import { vaultSchema } from "@/lib/validation";
import { z } from "zod";
import { toast } from "sonner";

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVault: (vaultData: any) => void;
}

const CreateVaultModal = ({ isOpen, onClose, onCreateVault }: CreateVaultModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate input data
    try {
      const validatedData = vaultSchema.parse({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      
      setIsLoading(true);
      
      await onCreateVault(validatedData);
      setFormData({ name: "", description: "" });
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

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-6 h-6 text-amber-600" />
            <DialogTitle className="text-2xl text-amber-900">Create Family Vault</DialogTitle>
          </div>
          <p className="text-amber-700">
            Create a new vault to organize your family's stories and memories.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vault-name">Vault Name</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="vault-name"
                type="text"
                placeholder="e.g., Smith Family Stories (max 100 characters)"
                className={`pl-10 ${validationErrors.name ? "border-destructive" : ""}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
                required
              />
            </div>
            {validationErrors.name && (
              <p className="text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vault-description">Description (Optional)</Label>
            <Textarea
              id="vault-description"
              placeholder="Describe what this vault will contain... (max 500 characters)"
              className={`min-h-[80px] ${validationErrors.description ? "border-destructive" : ""}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{validationErrors.description && <span className="text-destructive">{validationErrors.description}</span>}</span>
              <span>{formData.description.length}/500 characters</span>
            </div>
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
              {isLoading ? "Creating..." : "Create Vault"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVaultModal;
