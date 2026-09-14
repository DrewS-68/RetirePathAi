import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Sparkles,
  Search,
  FileCheck,
  Home,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface QuickStartGuideProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

interface QuickStartItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  tab: string;
  duration: string;
  difficulty: 'Easy' | 'Medium';
  isPremium?: boolean;
}

const QUICK_START_ITEMS: QuickStartItem[] = [
  {
    title: 'Find Your Perfect Village',
    description: 'Answer a few questions to get personalized retirement village recommendations.',
    icon: Sparkles,
    action: 'Start Matcher',
    tab: 'matcher',
    duration: '10 min',
    difficulty: 'Easy',
    isPremium: true,
  },
  {
    title: 'Browse Village Directory',
    description: 'Explore 1900+ verified retirement villages across Australia.',
    icon: Search,
    action: 'Browse Villages',
    tab: 'directory',
    duration: '5 min',
    difficulty: 'Easy',
  },
  {
    title: 'Analyze Your Contract',
    description: 'Upload a retirement village contract to understand costs and risks.',
    icon: FileCheck,
    action: 'Analyze Contract',
    tab: 'contract',
    duration: '15 min',
    difficulty: 'Medium',
    isPremium: true,
  },
  {
    title: 'Estimate Home Value',
    description: 'Get an estimate of your current home\'s value to plan your budget.',
    icon: Home,
    action: 'Estimate Value',
    tab: 'valuation',
    duration: '10 min',
    difficulty: 'Easy',
    isPremium: true,
  },
  {
    title: 'Read the Guides',
    description: 'Learn about retirement villages, contracts, and the moving process.',
    icon: BookOpen,
    action: 'View Resources',
    tab: 'resources',
    duration: '20 min',
    difficulty: 'Easy',
    isPremium: true,
  },
];

export function QuickStartGuide({ open, onClose, onNavigate }: QuickStartGuideProps) {
  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quick Start Guide</DialogTitle>
          <DialogDescription>
            Get started with RetirePath in minutes. Choose an activity below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {QUICK_START_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="size-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="size-6 text-blue-600" />
                    </div>
                    <div className="flex gap-2">
                      {item.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          Premium
                        </Badge>
                      )}
                      <Badge
                        variant={item.difficulty === 'Easy' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      <span>{item.duration}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleNavigate(item.tab)}
                    >
                      {item.action}
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Helpful Tips */}
        <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
          <div className="flex gap-3">
            <TrendingUp className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Pro Tips</h4>
              <ul className="text-sm text-blue-900 space-y-1">
                <li>• Start with the Village Finder to get personalized recommendations</li>
                <li>• Use the Directory to research specific villages in your area</li>
                <li>• Upload contracts before signing to understand all costs</li>
                <li>• All your progress is automatically saved</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
