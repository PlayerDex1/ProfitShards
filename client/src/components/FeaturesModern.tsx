import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Clock,
  DollarSign,
  Shield,
  Star
} from 'lucide-react';

export function FeaturesModern() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      id: 'calculator',
      icon: Calculator,
      title: t('home.features.calculator.title'),
      description: t('home.features.calculator.description'),
      benefits: [
        t('home.features.calculator.benefit1'),
        t('home.features.calculator.benefit2'),
        t('home.features.calculator.benefit3')
      ],
      buttonText: t('home.features.calculator.useButton'),
      href: isAuthenticated ? '/perfil' : '/auth',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/5 to-cyan-500/5',
      borderGradient: 'from-blue-500/20 to-cyan-500/20',
      iconBg: 'from-blue-500 to-cyan-500',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'planner',
      icon: Map,
      title: t('home.features.planner.title'),
      description: t('home.features.planner.description'),
      benefits: [
        t('home.features.planner.benefit1'),
        t('home.features.planner.benefit2'),
        t('home.features.planner.benefit3')
      ],
      buttonText: 'Use Planner',
      href: '/planner',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/5 to-emerald-500/5',
      borderGradient: 'from-green-500/20 to-emerald-500/20',
      iconBg: 'from-green-500 to-emerald-500',
      badge: 'New',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: t('home.features.analytics.title'),
      description: t('home.features.analytics.description'),
      benefits: [
        t('home.features.analytics.benefit1'),
        t('home.features.analytics.benefit2')
      ],
      buttonText: 'View Analytics',
      href: '/analytics',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/5 to-pink-500/5',
      borderGradient: 'from-purple-500/20 to-pink-500/20',
      iconBg: 'from-purple-500 to-pink-500',
      badge: 'Pro',
      badgeColor: 'bg-purple-500'
    }
  ];

  const quickStats = [
    { icon: TrendingUp, label: 'ROI Accuracy', value: '99.8%', color: 'text-green-500' },
    { icon: Clock, label: 'Time Saved', value: '2.5h/day', color: 'text-blue-500' },
    { icon: DollarSign, label: 'Avg Profit', value: '+23%', color: 'text-emerald-500' },
    { icon: Shield, label: 'Success Rate', value: '98%', color: 'text-purple-500' }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Tools</span>
            <Zap className="h-4 w-4 text-blue-500" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              To Succeed
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools designed to maximize your WorldShards experience and profits.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-muted to-muted/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Border Gradient */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: '1px' }}>
                  <div className="w-full h-full bg-card rounded-lg"></div>
                </div>

                <div className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <Badge className={`${feature.badgeColor} text-white border-0`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Benefits */}
                    <div className="space-y-3 mb-6">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-primary to-blue-500 mt-2"></div>
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link href={feature.href}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${feature.gradient} hover:shadow-lg hover:shadow-primary/25 text-white border-0 group/btn transition-all duration-300`}
                        size="lg"
                      >
                        {feature.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Join 10,000+ players optimizing their WorldShards experience
            </span>
            <Star className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
}