import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
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
  BookOpen,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to RetirePath! 🎉',
    description: 'Your complete guide to transitioning to a retirement village. We\'ll help you find the perfect village, understand contracts, value your home, and plan your move.',
    icon: Sparkles,
    tip: 'Take a quick tour to learn how to make the most of RetirePath.',
  },
  {
    title: 'Village Finder Tool',
    description: 'Answer questions about your health, lifestyle, and finances to get personalized retirement village recommendations matched to your needs.',
    icon: Sparkles,
    tip: 'Start here if you\'re looking for retirement village options.',
  },
  {
    title: 'Village Directory',
    description: 'Browse our database of 1900+ verified Australian retirement villages. Search by location, price, amenities, and more.',
    icon: Search,
    tip: 'Use filters to narrow down villages by state, type, and features.',
  },
  {
    title: 'Contract Analyzer Tool',
    description: 'Upload your retirement village contract for analysis. Get risk scores, cost breakdowns, and understand key terms like DMF and exit fees.',
    icon: FileCheck,
    tip: 'This tool helps you understand contracts, but is not a substitute for legal advice.',
  },
  {
    title: 'Home Value Estimator Tool',
    description: 'Get an estimate of your current home\'s value based on recent sales in your area. Plan your budget and timeline for the move.',
    icon: Home,
    tip: 'For accurate valuations, consider getting a professional appraisal.',
  },
  {
    title: 'Resources & Guides',
    description: 'Access comprehensive guides on retirement planning, selling your home, understanding contracts, and involving family in decisions.',
    icon: BookOpen,
    tip: 'Check the FAQ section for quick answers to common questions.',
  },
  {
    title: 'You\'re All Set! ✨',
    description: 'Start exploring RetirePath! Your progress is automatically saved, and you can access all tools from the navigation menu.',
    icon: CheckCircle,
    tip: 'Need help? Contact us at support@retirepath.com.au',
  },
];

interface WelcomeTourProps {
  open: boolean;
  onComplete: () => void;
}

export function WelcomeTour({ open, onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { markToolSeen } = useOnboarding();

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    markToolSeen('hasSeenWelcomeTour');
    onComplete();
  };

  const handleSkip = () => {
    markToolSeen('hasSeenWelcomeTour');
    onComplete();
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="size-4" />
              <span className="sr-only">Skip tour</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="size-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <Icon className="size-12 text-blue-600" />
            </div>
          </div>

          {/* Description */}
          <DialogDescription className="text-base text-center">
            {step.description}
          </DialogDescription>

          {/* Tip */}
          {step.tip && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Tip:</span> {step.tip}
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="size-4 mr-2" />
              Previous
            </Button>

            <Button onClick={handleSkip} variant="ghost">
              Skip Tour
            </Button>

            <Button onClick={handleNext}>
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle className="size-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
