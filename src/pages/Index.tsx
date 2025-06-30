
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Mic, Camera, Heart, ArrowRight } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-600" />
            <h1 className="text-2xl font-bold text-amber-900">Family Stories Hub</h1>
          </div>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6 leading-tight">
            Preserve Your Family's
            <span className="text-amber-600 block">Precious Stories</span>
          </h1>
          <p className="text-xl text-amber-800 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create a digital sanctuary for your family's memories. Share stories, photos, and voices 
            across generations in beautiful, private family vaults.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg"
            >
              Start Your Family's Story
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-4 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">
              Everything You Need to Preserve Family Memories
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Our platform provides all the tools you need to capture, organize, and share your family's most treasured moments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Family Vaults</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 text-center">
                  Create private, secure spaces for each family line. Organize stories by generation, 
                  branch, or theme with complete privacy control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Rich Media Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 text-center">
                  Combine text, photos, and audio recordings to tell complete stories. 
                  Upload multiple images and record voice memos directly in the app.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Voice Recordings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 text-center">
                  Capture the actual voices of your loved ones. Record stories, songs, or 
                  conversations to preserve the essence of each family member.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Timeline View</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 text-center">
                  View your family's stories in chronological order. See how your family's 
                  history unfolds through decades of memories and milestones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Legacy Preservation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 text-center">
                  Ensure your family's stories survive for generations. Our secure platform 
                  keeps your memories safe and accessible for years to come.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Easy Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 text-center">
                  Share individual stories or entire vaults with family members. 
                  Control who can view, edit, or contribute to your family's collection.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Preserving Your Family's Legacy Today
          </h2>
          <p className="text-xl text-amber-100 mb-10 max-w-2xl mx-auto">
            Join thousands of families who are already preserving their precious memories 
            for future generations. Your family's story matters.
          </p>
          <Button 
            size="lg" 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 text-lg font-semibold"
          >
            Create Your First Family Vault
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-12 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-6 h-6" />
            <span className="text-xl font-semibold">Family Stories Hub</span>
          </div>
          <p className="text-amber-200">
            Preserving family memories, one story at a time.
          </p>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
