import { useState } from 'react';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { UserData } from '../App';
import { 
  CheckCircle2,
  Circle,
  Download,
  RotateCcw
} from 'lucide-react';

interface ProgressTrackerProps {
  userData: UserData | null;
}

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
}

export function ProgressTracker({ userData }: ProgressTrackerProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Retirement Village Tasks
    { id: 'rv1', category: 'Retirement Village', task: 'Research different types of retirement villages', completed: false },
    { id: 'rv2', category: 'Retirement Village', task: 'Create list of must-have features and amenities', completed: false },
    { id: 'rv3', category: 'Retirement Village', task: 'Identify 5-10 potential villages in desired locations', completed: false },
    { id: 'rv4', category: 'Retirement Village', task: 'Book and attend village tours', completed: false },
    { id: 'rv5', category: 'Retirement Village', task: 'Talk to current residents', completed: false },
    { id: 'rv6', category: 'Retirement Village', task: 'Request detailed cost breakdowns from villages', completed: false },
    { id: 'rv7', category: 'Retirement Village', task: 'Compare villages using comparison template', completed: false },
    { id: 'rv8', category: 'Retirement Village', task: 'Consult with financial advisor about costs', completed: false },
    { id: 'rv9', category: 'Retirement Village', task: 'Review contracts from shortlisted villages', completed: false },
    { id: 'rv10', category: 'Retirement Village', task: 'Get independent legal advice on contract', completed: false },
    { id: 'rv11', category: 'Retirement Village', task: 'Make final village selection', completed: false },
    { id: 'rv12', category: 'Retirement Village', task: 'Submit application to chosen village', completed: false },
    
    // Home Selling Tasks
    { id: 'hs1', category: 'Home Selling', task: 'Get property valuation/market appraisal', completed: false },
    { id: 'hs2', category: 'Home Selling', task: 'Complete necessary repairs and maintenance', completed: false },
    { id: 'hs3', category: 'Home Selling', task: 'Declutter and deep clean property', completed: false },
    { id: 'hs4', category: 'Home Selling', task: 'Interview 3+ real estate agents', completed: false },
    { id: 'hs5', category: 'Home Selling', task: 'Select and sign with real estate agent', completed: false },
    { id: 'hs6', category: 'Home Selling', task: 'Approve marketing plan and photography', completed: false },
    { id: 'hs7', category: 'Home Selling', task: 'List property for sale', completed: false },
    { id: 'hs8', category: 'Home Selling', task: 'Conduct open homes/inspections', completed: false },
    { id: 'hs9', category: 'Home Selling', task: 'Review and negotiate offers', completed: false },
    { id: 'hs10', category: 'Home Selling', task: 'Accept offer and sign contract', completed: false },
    { id: 'hs11', category: 'Home Selling', task: 'Complete building/pest inspections', completed: false },
    { id: 'hs12', category: 'Home Selling', task: 'Prepare for settlement', completed: false },
    
    // Moving Tasks
    { id: 'mv1', category: 'Moving', task: 'Start downsizing - sort items to keep/donate/sell', completed: false },
    { id: 'mv2', category: 'Moving', task: 'Organize estate sale or donate unwanted items', completed: false },
    { id: 'mv3', category: 'Moving', task: 'Measure retirement village unit for furniture planning', completed: false },
    { id: 'mv4', category: 'Moving', task: 'Book removalist or arrange moving truck', completed: false },
    { id: 'mv5', category: 'Moving', task: 'Notify utilities about disconnection/transfer', completed: false },
    { id: 'mv6', category: 'Moving', task: 'Update address with banks, insurance, Medicare', completed: false },
    { id: 'mv7', category: 'Moving', task: 'Redirect mail with post office', completed: false },
    { id: 'mv8', category: 'Moving', task: 'Pack belongings', completed: false },
    { id: 'mv9', category: 'Moving', task: 'Complete final clean of old property', completed: false },
    { id: 'mv10', category: 'Moving', task: 'Move into retirement village', completed: false },
    { id: 'mv11', category: 'Moving', task: 'Attend village orientation and welcome events', completed: false },
    { id: 'mv12', category: 'Moving', task: 'Settle into new home and community', completed: false },
  ]);

  const toggleTask = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const resetProgress = () => {
    setChecklist(prev => prev.map(item => ({ ...item, completed: false })));
  };

  const categories = ['Retirement Village', 'Home Selling', 'Moving'];
  
  const getProgress = (category?: string) => {
    const items = category 
      ? checklist.filter(item => item.category === category)
      : checklist;
    const completed = items.filter(item => item.completed).length;
    return (completed / items.length) * 100;
  };

  const totalCompleted = checklist.filter(item => item.completed).length;
  const totalProgress = getProgress();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2">Your Progress Tracker</h2>
        <p className="text-muted-foreground">
          Track your journey from start to finish. Check off tasks as you complete them.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Overall Progress</h3>
            <p className="text-muted-foreground">
              {totalCompleted} of {checklist.length} tasks completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-1">{Math.round(totalProgress)}%</div>
            <Button variant="outline" size="sm" onClick={resetProgress}>
              <RotateCcw className="size-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        <Progress value={totalProgress} className="h-3" />
      </Card>

      {/* Category Progress */}
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map(category => {
          const categoryItems = checklist.filter(item => item.category === category);
          const completed = categoryItems.filter(item => item.completed).length;
          const progress = getProgress(category);
          
          return (
            <Card key={category} className="p-4">
              <h4 className="mb-2">{category}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {completed} of {categoryItems.length} done
              </p>
              <Progress value={progress} className="h-2" />
            </Card>
          );
        })}
      </div>

      {/* Detailed Checklist */}
      {categories.map(category => {
        const categoryItems = checklist.filter(item => item.category === category);
        const completedCount = categoryItems.filter(item => item.completed).length;
        
        return (
          <Card key={category} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                {completedCount === categoryItems.length ? (
                  <CheckCircle2 className="size-6 text-green-600" />
                ) : (
                  <Circle className="size-6 text-gray-300" />
                )}
                {category}
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{categoryItems.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {categoryItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    item.completed ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleTask(item.id)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={item.id}
                    className={`flex-1 cursor-pointer ${
                      item.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item.task}
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Action Buttons */}
      <Card className="p-6 text-center">
        <h3 className="mb-2">Need to save your progress?</h3>
        <p className="text-muted-foreground mb-4">
          Download your checklist and notes as a PDF to keep track offline
        </p>
        <Button>
          <Download className="size-4 mr-2" />
          Download Progress Report
        </Button>
      </Card>

      {/* Motivational Message */}
      {totalProgress > 0 && totalProgress < 100 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-center">
            <strong>Great progress!</strong> You're {Math.round(totalProgress)}% through your journey. 
            Keep going - your new retirement village home awaits!
          </p>
        </Card>
      )}

      {totalProgress === 100 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center">
            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="mb-2">Congratulations!</h3>
            <p className="text-muted-foreground">
              You've completed all the tasks. Welcome to your new chapter in retirement village living!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
