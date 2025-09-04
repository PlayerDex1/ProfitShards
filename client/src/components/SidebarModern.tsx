import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { 
  Gamepad2, 
  ExternalLink, 
  ShoppingCart, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Users,
  MessageCircle
} from 'lucide-react';

export function SidebarModern() {
  const { t } = useI18n();

  const quickLinks = [
    {
      title: 'Play Now',
      description: 'Start your WorldShards journey',
      icon: Gamepad2,
      href: 'https://worldshards.com',
      color: 'from-green-500 to-emerald-500',
      external: true
    },
    {
      title: 'Marketplace',
      description: 'Trade items and NFTs',
      icon: ShoppingCart,
      href: 'https://marketplace.worldshards.com',
      color: 'from-blue-500 to-cyan-500',
      external: true
    },
    {
      title: 'FAQ & Help',
      description: 'Get support and answers',
      icon: HelpCircle,
      href: '/help',
      color: 'from-purple-500 to-pink-500',
      external: false
    }
  ];

  const communityStats = [
    { label: 'Active Players', value: '10,247', icon: Users, color: 'text-green-500' },
    { label: 'Discord Members', value: '8,532', icon: MessageCircle, color: 'text-blue-500' },
    { label: 'Success Rate', value: '98.2%', icon: Star, color: 'text-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      {/* WorldShards Tools */}
      <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-primary to-blue-600 p-2 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {t('home.sidebar.title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('home.sidebar.subtitle')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-4 h-auto hover:bg-muted/50 transition-all duration-300 group"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${link.color} mr-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{link.title}</div>
                      <div className="text-xs text-muted-foreground">{link.description}</div>
                    </div>
                    {link.external ? (
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Users className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">Community</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {communityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {stat.value}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pro Features */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/20 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-primary">Pro Features</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Real-time Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Priority Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Custom Reports</span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            Upgrade to Pro
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">{t('home.support.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            {t('home.support.subtitle')}
          </p>
          
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>{t('home.support.createdBy')}</div>
            <div className="flex items-center gap-2">
              <span>Need help?</span>
              <Link href="/help">
                <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}