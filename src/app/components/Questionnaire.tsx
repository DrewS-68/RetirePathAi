import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { UserData } from '../App';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (data: UserData) => void;
}

export function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    currentSituation: '',
    homeOwnership: '',
    timeline: '',
    budget: '',
    concerns: [] as string[],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        ...formData,
        age: parseInt(formData.age) || 0,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8">
          <div className="mb-8">
            <h2 className="mb-2">Let's Get to Know You</h2>
            <p className="text-muted-foreground mb-4">
              Step {step} of {totalSteps}
            </p>
            <Progress value={progress} />
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="age">What's your age?</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter your age"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>What's your current living situation?</Label>
                <RadioGroup
                  value={formData.currentSituation}
                  onValueChange={(value) => setFormData({ ...formData, currentSituation: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="own-house" id="own-house" />
                    <Label htmlFor="own-house">Own a house</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="own-apartment" id="own-apartment" />
                    <Label htmlFor="own-apartment">Own an apartment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="renting" id="renting" />
                    <Label htmlFor="renting">Renting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Are you planning to sell your current property?</Label>
                <RadioGroup
                  value={formData.homeOwnership}
                  onValueChange={(value) => setFormData({ ...formData, homeOwnership: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes-sell" id="yes-sell" />
                    <Label htmlFor="yes-sell">Yes, I need to sell to fund the move</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes-keep" id="yes-keep" />
                    <Label htmlFor="yes-keep">Yes, but I'll keep it as an investment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-property" id="no-property" />
                    <Label htmlFor="no-property">No, I don't own property</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure" id="unsure" />
                    <Label htmlFor="unsure">I'm not sure yet</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>What's your timeline for moving?</Label>
                <RadioGroup
                  value={formData.timeline}
                  onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent">Within 3 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="soon" id="soon" />
                    <Label htmlFor="soon">3-6 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">6-12 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible">More than 12 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exploring" id="exploring" />
                    <Label htmlFor="exploring">Just exploring options</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label>What's your budget range for retirement village entry?</Label>
                <RadioGroup
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="under-300k" id="under-300k" />
                    <Label htmlFor="under-300k">Under $300,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="300-500k" id="300-500k" />
                    <Label htmlFor="300-500k">$300,000 - $500,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="500-750k" id="500-750k" />
                    <Label htmlFor="500-750k">$500,000 - $750,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="750k-1m" id="750k-1m" />
                    <Label htmlFor="750k-1m">$750,000 - $1,000,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1m-1.5m" id="1m-1.5m" />
                    <Label htmlFor="1m-1.5m">$1,000,000 - $1,500,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="over-1.5m" id="over-1.5m" />
                    <Label htmlFor="over-1.5m">Over $1,500,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure-budget" id="unsure-budget" />
                    <Label htmlFor="unsure-budget">I'm not sure yet</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">What are your main concerns? (Select all that apply)</Label>
                <div className="space-y-3">
                  {[
                    'Understanding the financial commitment',
                    'Finding the right retirement village',
                    'Selling my home quickly',
                    'Getting a fair price for my property',
                    'Understanding contracts and legal terms',
                    'Healthcare and support services',
                    'Maintaining independence',
                    'Social activities and community',
                    'Timing the sale and move',
                    'What happens to my investment',
                  ].map((concern) => (
                    <div key={concern} className="flex items-center space-x-2">
                      <Checkbox
                        id={concern}
                        checked={formData.concerns.includes(concern)}
                        onCheckedChange={() => toggleConcern(concern)}
                      />
                      <Label htmlFor={concern} className="cursor-pointer">
                        {concern}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="size-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {step === totalSteps ? 'Complete' : 'Next'}
              {step < totalSteps && <ChevronRight className="size-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
