
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { addReel } from '@/services/reelService';
import { ArrowDown, ArrowUp, Youtube, Upload } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      await addReel(title, youtubeUrl);
      setTitle('');
      setYoutubeUrl('');
      toast({
        title: "Success! 🎉",
        description: "Reel has been added successfully",
      });
    } catch (error) {
      console.error('Error adding reel:', error);
      toast({
        title: "Error",
        description: "Failed to add reel. Please check the YouTube URL.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            রিল অ্যাডমিন প্যানেল
          </h1>
          <p className="text-blue-200">
            YouTube ভিডিও লিংক যোগ করুন
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Youtube className="text-red-500" />
              নতুন রিল যোগ করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                  রিলের নাম
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="রিলের একটি আকর্ষণীয় নাম দিন..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube-url" className="text-white">
                  YouTube ভিডিও লিংক
                </Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <p className="text-sm text-blue-200">
                  YouTube ভিডিওর সম্পূর্ণ লিংক পেস্ট করুন
                </p>
              </div>

              <Button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 text-lg"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    আপলোড হচ্ছে...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload size={20} />
                    রিল যোগ করুন
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <h3 className="text-white font-bold mb-4">নির্দেশনা:</h3>
            <div className="space-y-2 text-blue-200">
              <p>• YouTube থেকে যেকোনো ভিডিওর লিংক কপি করুন</p>
              <p>• রিলের জন্য একটি আকর্ষণীয় নাম দিন</p>
              <p>• ভিডিও TikTok স্টাইলে দেখানো হবে</p>
              <p>• ব্যবহারকারীরা লাইক, কমেন্ট ও শেয়ার করতে পারবেন</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
