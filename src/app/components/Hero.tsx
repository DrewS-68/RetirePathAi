import { Button } from './ui/button';
import { Card } from './ui/card';
import { Home, Heart, Shield, Users, HelpCircle, Building2 } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';
import { MembershipPlans } from './auth/MembershipPlans';
import { Login } from './auth/Login';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const [showPlans, setShowPlans] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <Logo className="size-36" />
          </div>
          <h1 className="mb-4 text-6xl">Welcome to RetirePath</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your personal guide to navigating retirement village living and selling your home with confidence
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowPlans(true)} className="px-8">
              View Plans
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <button
              onClick={() => setShowLogin(true)}
              className="text-[#2D6A4F] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <HelpCircle className="size-6 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2">Personalized Guidance</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered recommendations based on your unique situation
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="size-6 text-green-600" />
              </div>
            </div>
            <h3 className="mb-2">Step-by-Step Process</h3>
            <p className="text-sm text-muted-foreground">
              Clear roadmap from selling your home to moving in
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Heart className="size-6 text-purple-600" />
              </div>
            </div>
            <h3 className="mb-2">Expert Resources</h3>
            <p className="text-sm text-muted-foreground">
              Curated information and contacts to help you succeed
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="size-6 text-orange-600" />
              </div>
            </div>
            <h3 className="mb-2">Community Insights</h3>
            <p className="text-sm text-muted-foreground">
              Learn what to expect from real retirement village experiences
            </p>
          </Card>
        </div>

        {/* For Village Operators */}
        <Card className="max-w-4xl mx-auto mb-16 p-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-600 text-white rounded-full p-4">
                <Building2 className="size-12" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="mb-2">Are You a Retirement Village Operator?</h3>
              <p className="text-muted-foreground mb-4">
                We're actively seeking small and independent operators to join our directory. 
                Help local retirees discover your community by listing your village for <strong>free</strong>.
              </p>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.hash = '#list-village'}
                >
                  <Building2 className="size-4 mr-2" />
                  List Your Village Free
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.hash = '#list-village'}
                >
                  Learn More
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                💡 <strong>Especially seeking:</strong> Smaller, local operators in regional areas. No commission, no fees, just visibility.
              </p>
            </div>
          </div>
        </Card>

        {/* What We Help With */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-8">How We Can Help</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="mb-4">Retirement Village Transition</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Understanding different retirement village models</li>
                <li>✓ Financial considerations and costs</li>
                <li>✓ Choosing the right village for you</li>
                <li>✓ Contract review guidance</li>
                <li>✓ Move-in preparation</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Home Selling Process</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Preparing your home for sale</li>
                <li>✓ Finding the right real estate agent</li>
                <li>✓ Pricing strategies</li>
                <li>✓ Timing your sale with your move</li>
                <li>✓ Managing the settlement process</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {showPlans && <MembershipPlans onClose={() => setShowPlans(false)} />}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowPlans(true);
          }}
        />
      )}
    </div>
  );
}