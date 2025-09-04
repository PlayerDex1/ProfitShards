import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/i18n';
import { 
  Calculator, 
  Map, 
  BarChart3, 
  ArrowRight, 
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  Users,
  Star
} from 'lucide-react';

export function HeroModern() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Calculator,
      title: "Advanced Calculator",
      description: "Precise ROI calculations with real-time data",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Map,
      title: "Map Planner",
      description: "Optimize your farming strategies",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your performance and growth",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Calculations", value: "1M+", icon: Calculator },
    { label: "Success Rate", value: "98%", icon: Target },
    { label: "Satisfaction", value: "4.9★", icon: Star }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">WorldShards Calculator Pro</span>
            <Zap className="h-4 w-4 text-blue-500" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
              Maximize Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-primary to-foreground bg-clip-text text-transparent">
              WorldShards ROI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The most advanced calculator and analytics platform for WorldShards. 
            Optimize your strategies, track your performance, and maximize your profits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={isAuthenticated ? "/profile" : "/auth"}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Start Calculating
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/planner">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 hover:bg-muted/50 transition-all duration-300 group"
              >
                <Map className="h-5 w-5 mr-2" />
                Plan Strategy
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}